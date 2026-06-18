"""結合テスト：個人履歴 + 人事コマンド + 名簿CRUD。IT-10〜13, IT-15〜18, IT-23。

ハンドラ _route を通し、roster/submissions/employees の整合、
人事ブロードキャスト（messaging.send 宛先）、reminder 非同期 invoke を検証。
"""
import pytest

from common import business, db

from .conftest import file_event, text_event, kintai_serial


@pytest.fixture(autouse=True)
def fixed_period(monkeypatch):
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    return "202606"


def _submit(uid, type_, period="202606"):
    """submissions に 1 件直接投入（提出済をシミュレート）。"""
    business.record_submission(uid, type_, period, "hr/x/%s.xlsx" % type_, "f.xlsx")


# ============ IT-10 個人履歴 ============

def test_it10_personal_history(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-10 | FR-13 提出後「履歴」で一覧 + carousel ダウンロードリンク。"""
    uid = "line:U201"
    seed.link("E001", "山田太郎", uid)
    _submit(uid, "kintai")
    _submit(uid, "commute")

    route(text_event(uid, "履歴"))

    msgs = line_stub.last_messages()
    # 1 通目テキスト一覧 + carousel
    assert any(m.get("type") == "text" and "提出履歴" in m.get("text", "") for m in msgs)
    carousels = [m for m in msgs if m.get("type") == "template"
                 and m["template"].get("type") == "carousel"]
    assert carousels, "carousel が無い"
    cols = carousels[0]["template"]["columns"]
    assert len(cols) == 2
    # 各カードにダウンロードボタン（/dl?key=&sig=）
    for c in cols:
        uri = c["actions"][0]["uri"]
        assert "/dl?key=" in uri and "sig=" in uri


# ============ IT-11 提出状況一覧 ============

def test_it11_hr_roster_status(line_stub, seed, route):
    """IT-11 | FR-15 人事 提出状況一覧：未提出が上位・✓/✗ 表示。"""
    hr = "line:HR1"
    seed.link("E001", "人事太郎", hr, department="人事部", role="hr")
    u2 = "line:U2"
    seed.link("E002", "山田太郎", u2, department="開発部")
    seed.roster("E003", "未連携花子", department="営業部")   # LINE 未連携

    # 山田だけ kintai+commute 提出（完了）。人事と E003 は未提出。
    _submit(u2, "kintai")
    _submit(u2, "commute")

    route(text_event(hr, "一覧"))

    txt = line_stub.reply_concat()
    assert "提出状況" in txt
    # 未提出セクションが提出済より前
    assert "【未提出" in txt and "【提出済" in txt
    assert txt.index("【未提出") < txt.index("【提出済")
    # ✓/✗ マークが含まれる
    assert "✓" in txt and "✗" in txt
    # 山田は提出済セクション、未提出は人事太郎/未連携花子
    assert "未連携花子" in txt and "山田太郎" in txt


# ============ IT-12 未提出者抽出 ============

def test_it12_hr_missing(line_stub, seed, route):
    """IT-12 | FR-16 人事 未提出者抽出。"""
    hr = "line:HR1"
    seed.link("E001", "人事太郎", hr, department="人事部", role="hr")
    u2 = "line:U2"
    seed.link("E002", "山田太郎", u2)
    seed.roster("E003", "鈴木花子", department="営業部")

    # 山田は両方提出 → 未提出は人事太郎 + 鈴木花子
    _submit(u2, "kintai")
    _submit(u2, "commute")

    route(text_event(hr, "未提出確認"))

    txt = line_stub.reply_concat()
    assert "未提出" in txt
    assert "鈴木花子" in txt
    assert "人事太郎" in txt
    assert "山田太郎" not in txt          # 提出済は出ない


# ============ IT-13 催促（手動リマインド）→ reminder 非同期 invoke ============

def test_it13_hr_remind_invokes_reminder(line_stub, seed, route, monkeypatch):
    """IT-13 | FR-17,24 人事「催促」→ reminder Lambda を Event invoke、連携済人数を返信。"""
    hr = "line:HR1"
    seed.link("E001", "人事太郎", hr, department="人事部", role="hr")
    u2 = "line:U2"
    seed.link("E002", "山田太郎", u2)              # 連携済・未提出
    seed.roster("E003", "鈴木花子")               # 未連携・未提出

    # lambda invoke を記録器に差し替え（moto に存在しない関数の呼び出しを回避）
    from handlers import line_webhook
    calls = []

    class FakeLambda:
        def invoke(self, **kw):
            calls.append(kw)
            return {"StatusCode": 202}

    monkeypatch.setattr(line_webhook, "_lambda_client", lambda: FakeLambda())

    route(text_event(hr, "催促"))

    # reminder を Event invoke した
    assert len(calls) == 1
    assert calls[0]["InvocationType"] == "Event"
    assert calls[0]["FunctionName"]
    import json
    payload = json.loads(calls[0]["Payload"])
    assert payload["trigger"] == "manual"
    assert payload["period"] == "202606"

    # 連携済(=push 可能)人数: 人事太郎 + 山田 = 2（鈴木は未連携で除外）
    txt = line_stub.reply_concat()
    assert "2 名" in txt or "2名" in txt


# ============ IT-15〜18 名簿 CRUD + ブロードキャスト ============

def test_it15_roster_add_and_broadcast(line_stub, seed, route):
    """IT-15 | FR-20,23 社員追加 → roster に追加、他人事へブロードキャスト。"""
    hr1 = "line:HR1"
    hr2 = "line:HR2"
    seed.link("E001", "人事太郎", hr1, department="人事部", role="hr")
    seed.link("E002", "人事次郎", hr2, department="人事部", role="hr")

    route(text_event(hr1, "社員追加 新人三郎 開発部"))

    # roster に E003 が採番されて追加
    rows = business.roster_scan()
    added = [r for r in rows if r.get("name") == "新人三郎"]
    assert len(added) == 1
    assert added[0]["empId"] == "E003"
    assert added[0]["department"] == "開発部"
    assert added[0]["role"] == "employee"

    # 操作者 hr1 以外（hr2）へブロードキャスト
    targets = [u for u, _ in line_stub.sends]
    assert hr2 in targets
    assert hr1 not in targets


def test_it16_roster_list(line_stub, seed, route):
    """IT-16 | FR-19 名簿一覧。"""
    hr1 = "line:HR1"
    seed.link("E001", "人事太郎", hr1, department="人事部", role="hr")
    seed.roster("E002", "山田太郎", department="開発部")

    route(text_event(hr1, "名簿"))

    txt = line_stub.reply_concat()
    assert "社員名簿" in txt
    assert "人事太郎" in txt and "山田太郎" in txt
    assert "E001" in txt and "E002" in txt


def test_it17_roster_update_and_broadcast(line_stub, seed, route):
    """IT-17 | FR-21,23 社員変更（部署）→ roster 更新 + ブロードキャスト。"""
    hr1 = "line:HR1"
    hr2 = "line:HR2"
    seed.link("E001", "人事太郎", hr1, department="人事部", role="hr")
    seed.link("E009", "人事次郎", hr2, department="人事部", role="hr")
    seed.roster("E003", "山田太郎", department="開発部")

    route(text_event(hr1, "社員変更 E003 部署 営業部"))

    ros = db.roster().get_item(Key={"empId": "E003"})["Item"]
    assert ros["department"] == "営業部"

    targets = [u for u, _ in line_stub.sends]
    assert hr2 in targets and hr1 not in targets


def test_it18_roster_delete_and_unlink(line_stub, seed, route):
    """IT-18 | FR-22,23 社員削除 → roster 削除 + employees 紐付け解除 + ブロードキャスト。"""
    hr1 = "line:HR1"
    hr2 = "line:HR2"
    seed.link("E001", "人事太郎", hr1, department="人事部", role="hr")
    seed.link("E009", "人事次郎", hr2, department="人事部", role="hr")
    target_uid = "line:U3"
    seed.link("E003", "山田太郎", target_uid, department="開発部")

    route(text_event(hr1, "社員削除 E003"))

    # roster から削除
    assert db.roster().get_item(Key={"empId": "E003"}).get("Item") is None
    # employees の LINE 紐付けも削除
    assert db.employees().get_item(Key={"userId": target_uid}).get("Item") is None
    # ブロードキャスト
    targets = [u for u, _ in line_stub.sends]
    assert hr2 in targets


# ============ IT-23 跨月再提出 → 人事へ再確認通知 ============

def test_it23_late_resubmit_notifies_hr(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-23 | FR-25 跨月再提出（過去月への補提出 + 既存提出あり）→ 人事へ resubmit_alert。

    当月=202607、対象=202606（過去月）。既に 202606#kintai が存在 → 再提出。
    """
    monkeypatch.setattr(business, "current_period", lambda: "202607")  # 当月=7月

    hr = "line:HR1"
    seed.link("E001", "人事太郎", hr, department="人事部", role="hr")
    u2 = "line:U2"
    seed.link("E002", "山田太郎", u2)

    # 既存提出（202606#kintai）を先に作る → 再提出判定が立つ
    _submit(u2, "kintai", period="202606")

    # 当月=202607、対象月=202606（過去月への補提出）。
    # save_submission に period=202606 を明示し、既存提出ありなので resubmit=True、
    # current_period(202607) > 202606 なので is_late_resubmit=True → 人事へ通知。
    from .test_it_submission import _full_kintai_cells
    data = make_xlsx(_full_kintai_cells(name="山田太郎", period="202606"))

    from handlers import line_webhook
    period, _, resubmit = business.save_submission(u2, "kintai", data, "202606")
    line_webhook._maybe_notify_resubmit(u2, period, "kintai", resubmit)

    assert resubmit is True
    assert business.is_late_resubmit("202606") is True
    alerts = [t for u, t in line_stub.sends if u == hr]
    assert alerts and "再提出確認" in alerts[0]
    # 操作者本人(u2)へは通知しない
    assert u2 not in [u for u, _ in line_stub.sends]
