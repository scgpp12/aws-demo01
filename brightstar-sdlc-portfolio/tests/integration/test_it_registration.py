"""結合テスト：登録（名簿照合）フロー。IT-01〜03。

ハンドラ _route を実コードで通し、employees / roster 両テーブルの
状態遷移（副作用）を検証する。LINE/SSM は monkeypatch。
"""
from common import db

from .conftest import subscribe_event, text_event


def test_it01_registration_happy_path(line_stub, seed, route):
    """IT-01 | FR-01,02 初回登録正常フロー。

    subscribe→氏名未設定でテキスト→roster 照合→
    employees.status=active・roster.lineUserId 紐付け（両テーブル確認）。
    """
    uid = "line:U001"
    seed.roster("E001", "山田太郎", department="開発部")

    # 1) 友だち追加（subscribe）→ welcome + ask_name、employees 行が awaiting_name で作成
    route(subscribe_event(uid))
    emp = db.employees().get_item(Key={"userId": uid}).get("Item")
    assert emp is not None
    assert emp["status"] == "awaiting_name"
    assert "ようこそ" in line_stub.reply_concat()

    # 2) 氏名テキスト送信 → 名簿一致1件 → 紐付け
    route(text_event(uid, "山田太郎"))

    emp = db.employees().get_item(Key={"userId": uid})["Item"]
    assert emp["status"] == "active"
    assert emp["empId"] == "E001"
    assert emp["name"] == "山田太郎"

    ros = db.roster().get_item(Key={"empId": "E001"})["Item"]
    assert ros["lineUserId"] == uid

    # 登録完了メッセージ（氏名・部署）
    txt = line_stub.reply_concat()
    assert "登録完了" in txt
    assert "山田太郎" in txt
    assert "開発部" in txt


def test_it02_name_not_in_roster(line_stub, seed, route):
    """IT-02 | FR-03 氏名が名簿に無い → 登録せず案内。"""
    uid = "line:U002"
    seed.roster("E001", "山田太郎")

    route(subscribe_event(uid))
    route(text_event(uid, "存在しない名前"))

    emp = db.employees().get_item(Key={"userId": uid})["Item"]
    assert emp["status"] == "awaiting_name"   # active 化されない
    assert "empId" not in emp
    assert "見つかりませんでした" in line_stub.reply_concat()


def test_it03_duplicate_name(line_stub, seed, route):
    """IT-03 | FR-04 同姓同名で確定不可 → 紐付けしない。"""
    uid = "line:U003"
    seed.roster("E001", "佐藤一郎", department="開発部")
    seed.roster("E002", "佐藤一郎", department="営業部")

    route(subscribe_event(uid))
    route(text_event(uid, "佐藤一郎"))

    emp = db.employees().get_item(Key={"userId": uid})["Item"]
    assert emp["status"] == "awaiting_name"
    # どちらの roster にも lineUserId が付かない
    assert "lineUserId" not in db.roster().get_item(Key={"empId": "E001"})["Item"]
    assert "lineUserId" not in db.roster().get_item(Key={"empId": "E002"})["Item"]
    assert "複数います" in line_stub.reply_concat()
