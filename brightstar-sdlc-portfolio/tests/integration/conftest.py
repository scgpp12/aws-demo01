"""結合テスト共通フィクスチャ（moto 5.2.2 + monkeypatch）。

【moto の罠への対処（重要）】
- `common/db.py` は import 時に `boto3.resource("dynamodb")` を生成する。
- `common/s3util.py` は import 時に `boto3.client("s3")` を生成する。
  → moto の mock を「これらの import より前」に開始しないと、実 AWS を向いたまま固まる。

そこで本 conftest は **モジュール読込時（pytest 収集時）** に以下の順で初期化する:
  1. ダミー資格情報・リソース名を環境変数へ設定
  2. moto の `mock_aws()` を start()（session 全体で有効）
  3. boto3 で 3 テーブル + S3 バケットを作成
  4. **その後で** common.* / handlers.* を import
これにより各モジュール内のクライアントが moto にバインドされる。

外部 I/O（LINE / SSM）は各テストの monkeypatch でスタブ化する（実 HTTP を出さない）。
print は英数字中心（Windows コンソール文字化け回避）。
"""
import os
import sys

import pytest

# ---------------- 1) 環境変数（ダミー資格情報 + リソース名） ----------------
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "ap-northeast-1"
os.environ["AWS_REGION"] = "ap-northeast-1"

os.environ["EMPLOYEES_TABLE"] = "it-employees"
os.environ["ROSTER_TABLE"] = "it-roster"
os.environ["SUBMISSIONS_TABLE"] = "it-submissions"
os.environ["SUBMISSIONS_GSI1"] = "GSI1"
os.environ["BUCKET_NAME"] = "it-bucket"
os.environ["REMINDER_FUNCTION_NAME"] = "it-reminder-fn"
# HR_USERIDS は空（roster の role=hr で人事判定する）
os.environ["HR_USERIDS"] = ""

# lambda/ を import パスへ
_LAMBDA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "brightstar-hr", "lambda"))
if _LAMBDA_DIR not in sys.path:
    sys.path.insert(0, _LAMBDA_DIR)

# ---------------- 2) moto 起動（import より前に） ----------------
import boto3  # noqa: E402
from moto import mock_aws  # noqa: E402

_MOCK = mock_aws()
_MOCK.start()

REGION = "ap-northeast-1"
EMPLOYEES_TABLE = os.environ["EMPLOYEES_TABLE"]
ROSTER_TABLE = os.environ["ROSTER_TABLE"]
SUBMISSIONS_TABLE = os.environ["SUBMISSIONS_TABLE"]
BUCKET_NAME = os.environ["BUCKET_NAME"]


def _create_tables_and_bucket():
    ddb = boto3.client("dynamodb", region_name=REGION)
    existing = ddb.list_tables().get("TableNames", [])

    if EMPLOYEES_TABLE not in existing:
        ddb.create_table(
            TableName=EMPLOYEES_TABLE,
            BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[{"AttributeName": "userId", "AttributeType": "S"}],
            KeySchema=[{"AttributeName": "userId", "KeyType": "HASH"}],
        )
    if ROSTER_TABLE not in existing:
        ddb.create_table(
            TableName=ROSTER_TABLE,
            BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[{"AttributeName": "empId", "AttributeType": "S"}],
            KeySchema=[{"AttributeName": "empId", "KeyType": "HASH"}],
        )
    if SUBMISSIONS_TABLE not in existing:
        ddb.create_table(
            TableName=SUBMISSIONS_TABLE,
            BillingMode="PAY_PER_REQUEST",
            AttributeDefinitions=[
                {"AttributeName": "userId", "AttributeType": "S"},
                {"AttributeName": "sk", "AttributeType": "S"},
                {"AttributeName": "gsi1pk", "AttributeType": "S"},
                {"AttributeName": "gsi1sk", "AttributeType": "S"},
            ],
            KeySchema=[
                {"AttributeName": "userId", "KeyType": "HASH"},
                {"AttributeName": "sk", "KeyType": "RANGE"},
            ],
            GlobalSecondaryIndexes=[{
                "IndexName": "GSI1",
                "KeySchema": [
                    {"AttributeName": "gsi1pk", "KeyType": "HASH"},
                    {"AttributeName": "gsi1sk", "KeyType": "RANGE"},
                ],
                "Projection": {"ProjectionType": "ALL"},
            }],
        )

    s3 = boto3.client("s3", region_name=REGION)
    buckets = [b["Name"] for b in s3.list_buckets().get("Buckets", [])]
    if BUCKET_NAME not in buckets:
        s3.create_bucket(
            Bucket=BUCKET_NAME,
            CreateBucketConfiguration={"LocationConstraint": REGION},
        )


_create_tables_and_bucket()

# ---------------- 4) moto 起動後に common / handlers を import ----------------
from common import business, config, db, i18n, line, messaging, s3util  # noqa: E402,F401
from handlers import line_webhook, reminder  # noqa: E402,F401


def pytest_unconfigure(config):  # noqa: D401
    """テストセッション終了時に moto を停止。"""
    try:
        _MOCK.stop()
    except Exception:  # noqa: BLE001
        pass


# ================== ヘルパ ==================

def _clear_table(table):
    """テーブル全件削除（テスト間の独立性確保）。"""
    scan = table.scan()
    items = scan.get("Items", [])
    key_names = [k["AttributeName"] for k in table.key_schema]
    with table.batch_writer() as bw:
        for it in items:
            bw.delete_item(Key={k: it[k] for k in key_names})


def _clear_bucket(bucket_name):
    s3 = boto3.client("s3", region_name=REGION)
    # バージョニング無効バケット → 通常オブジェクト削除のみ
    resp = s3.list_objects_v2(Bucket=bucket_name)
    for obj in resp.get("Contents", []):
        s3.delete_object(Bucket=bucket_name, Key=obj["Key"])


@pytest.fixture(autouse=True)
def _reset_state():
    """各テスト前に 3 テーブル + バケット + SSM キャッシュを初期化。"""
    _clear_table(db.employees())
    _clear_table(db.roster())
    _clear_table(db.submissions())
    _clear_bucket(BUCKET_NAME)
    config._cache.clear()
    yield


# ---------- LINE/SSM スタブ + 送信記録 ----------

class Recorder:
    """LINE 送受信内容を貯めて assert できるようにする記録器。"""

    def __init__(self):
        self.replies = []        # [(reply_token, text)]
        self.reply_messages = [] # [(reply_token, messages_list)]
        self.pushes = []         # [(user_id, text)]
        self.sends = []          # [(user_id, text)]  messaging.send 経由

    def all_reply_texts(self):
        """reply / reply_messages に流れた全テキストを平坦化して返す。"""
        out = [t for _, t in self.replies]
        for _, msgs in self.reply_messages:
            for m in msgs:
                if isinstance(m, dict) and m.get("type") == "text":
                    out.append(m.get("text", ""))
        return out

    def reply_concat(self):
        return "\n".join(self.all_reply_texts())

    def last_messages(self):
        """最後の reply_messages の messages list（無ければ []）。"""
        return self.reply_messages[-1][1] if self.reply_messages else []


@pytest.fixture
def line_stub(monkeypatch):
    """LINE/SSM を monkeypatch で全面スタブ化。Recorder を返す。

    - verify_signature → True
    - reply / reply_messages / push → 記録
    - buttons_message / carousel_message → 実装の構造を保ったまま通す（assert 用）
    - download_content → ダミー（個別テストで上書き）
    - messaging.send → {"errcode":0} を返しつつ宛先記録
    - config.line_secret / line_token → 固定値（SSM を叩かせない）
    """
    rec = Recorder()

    def _reply(token, text):
        rec.replies.append((token, text))
        return {"errcode": 0}

    def _reply_messages(token, messages):
        rec.reply_messages.append((token, messages))
        return {"errcode": 0}

    def _push(user_id, text):
        rec.pushes.append((user_id, text))
        return {"errcode": 0}

    def _send(user_id, text):
        rec.sends.append((user_id, text))
        return {"errcode": 0}

    # line モジュール（複数モジュールが参照するため line.* を直接差し替え）
    monkeypatch.setattr(line, "verify_signature", lambda body, sig: True)
    monkeypatch.setattr(line, "reply", _reply)
    monkeypatch.setattr(line, "reply_messages", _reply_messages)
    monkeypatch.setattr(line, "push", _push)
    monkeypatch.setattr(line, "download_content", lambda mid: b"")

    # line_webhook はモジュール先頭で `from common import line` 済 → 同一オブジェクトを差し替え
    monkeypatch.setattr(line_webhook.line, "verify_signature", lambda body, sig: True)
    monkeypatch.setattr(line_webhook.line, "reply", _reply)
    monkeypatch.setattr(line_webhook.line, "reply_messages", _reply_messages)

    # messaging.send は line.push を呼ぶが、宛先記録のため直接差し替える
    monkeypatch.setattr(messaging, "send", _send)
    monkeypatch.setattr(line_webhook.messaging, "send", _send)
    monkeypatch.setattr(reminder.messaging, "send", _send)

    # SSM を叩かせない（HMAC 署名鍵にも使われる）
    monkeypatch.setattr(config, "line_secret", lambda: "test-secret")
    monkeypatch.setattr(config, "line_token", lambda: "test-token")

    return rec


# ---------- イベント組み立てヘルパ ----------

def text_event(user_id, text, reply_token="rt"):
    """parse_events 後の内部イベント構造（text）。"""
    return {
        "fromUser": user_id, "msgType": "text", "content": text,
        "messageId": None, "fileName": None,
        "event": None, "eventKey": None, "replyToken": reply_token,
    }


def file_event(user_id, file_name, message_id="mid", reply_token="rt"):
    return {
        "fromUser": user_id, "msgType": "file", "content": "",
        "messageId": message_id, "fileName": file_name,
        "event": None, "eventKey": None, "replyToken": reply_token,
    }


def subscribe_event(user_id, reply_token="rt"):
    return {
        "fromUser": user_id, "msgType": "event", "content": "",
        "messageId": None, "fileName": None,
        "event": "subscribe", "eventKey": None, "replyToken": reply_token,
    }


@pytest.fixture
def route():
    """line_webhook._route を直接呼ぶショートカット（base URL 付き）。"""
    def _do(ev, base="https://example.com"):
        return line_webhook._route(ev, base)
    return _do


# ---------- seed ヘルパ ----------

@pytest.fixture
def seed():
    """roster / employees を投入するヘルパ群を返す。"""

    class Seed:
        def roster(self, emp_id, name, department="開発部", role="employee",
                   line_user_id=None):
            item = {"empId": emp_id, "name": name, "department": department, "role": role}
            if line_user_id:
                item["lineUserId"] = line_user_id
            db.roster().put_item(Item=item)
            return item

        def employee_active(self, user_id, emp_id, name):
            db.employees().put_item(Item={
                "userId": user_id, "status": "active",
                "empId": emp_id, "name": name,
            })

        def link(self, emp_id, name, user_id, department="開発部", role="employee"):
            """roster + employees を両方そろえて『LINE 連携済の社員』を作る。"""
            self.roster(emp_id, name, department, role, line_user_id=user_id)
            self.employee_active(user_id, emp_id, name)

    return Seed()


# ---------- xlsx ヘルパ（単体テストの make_xlsx を流用） ----------

@pytest.fixture(scope="session")
def make_xlsx():
    """tests/conftest.py の make_xlsx を import して流用する。"""
    import importlib.util
    unit_conftest = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "conftest.py"))
    spec = importlib.util.spec_from_file_location("_unit_conftest", unit_conftest)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.make_xlsx


# 2026-06 の日付シリアル(1900系)。単体テスト spec と一致。
#   46174=6/1, 46179=6/6(土), 46180=6/7(日), 46203=6/30
def kintai_serial(day, period="202606"):
    """指定月 day 日の 1900 系シリアル値を返す（xlsx.to_date と整合）。"""
    from datetime import date
    y, mo = int(period[:4]), int(period[4:])
    base = date(1899, 12, 30)
    return (date(y, mo, day) - base).days
