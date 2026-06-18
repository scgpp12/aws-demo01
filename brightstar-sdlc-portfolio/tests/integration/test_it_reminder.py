"""結合テスト：定時リマインド reminder.handler。IT-14。

reminder.handler を実コードで通し、roster×submissions 差集合で
連携済の未提出者にのみ messaging.send（push）されることを検証。
未連携者は skip される。
"""
import pytest

from common import business
from handlers import reminder

from .conftest import kintai_serial  # noqa: F401


@pytest.fixture(autouse=True)
def fixed_period(monkeypatch):
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    return "202606"


def _submit(uid, type_, period="202606"):
    business.record_submission(uid, type_, period, "hr/x/%s.xlsx" % type_, "f.xlsx")


def test_it14_scheduled_reminder_sends_to_linked_unsubmitted(line_stub, seed):
    """IT-14 | FR-24 定時リマインド：連携済の未提出者にのみ送信、送信数を確認。

    seed:
      - E001 山田（連携済）: kintai+commute 提出済 → 対象外
      - E002 鈴木（連携済）: 未提出 → 送信対象
      - E003 田中（連携済）: kintai のみ提出（commute 未） → 送信対象（差集合で残る）
      - E004 佐藤（未連携）: 未提出 → skip
    """
    u1 = "line:U1"
    u2 = "line:U2"
    u3 = "line:U3"
    seed.link("E001", "山田太郎", u1)
    seed.link("E002", "鈴木花子", u2)
    seed.link("E003", "田中一郎", u3)
    seed.roster("E004", "佐藤次郎", department="営業部")   # 未連携

    _submit(u1, "kintai")
    _submit(u1, "commute")    # 山田は完了
    _submit(u3, "kintai")     # 田中は commute 未

    # EventBridge cron 相当（detail 空）
    result = reminder.handler({}, None)

    # 送信先: 鈴木(u2) + 田中(u3) = 2、佐藤は未連携で skip
    assert result["sent"] == 2
    sent_targets = {u for u, _ in line_stub.sends}
    assert sent_targets == {u2, u3}
    assert u1 not in sent_targets             # 提出済は送らない

    # 文面にリマインド + 未提出種別ラベル
    for _, msg in line_stub.sends:
        assert "リマインド" in msg


def test_it14b_reminder_manual_payload_specific_type(line_stub, seed):
    """IT-14b | FR-24 手動 invoke（type 指定）: 指定種別の未提出者のみ対象。"""
    u1 = "line:U1"
    u2 = "line:U2"
    seed.link("E001", "山田太郎", u1)
    seed.link("E002", "鈴木花子", u2)

    _submit(u1, "kintai")     # 山田 kintai 提出済
    # u2 は kintai 未提出

    result = reminder.handler(
        {"trigger": "manual", "period": "202606", "type": "kintai"}, None)

    # kintai 未提出は鈴木のみ
    assert result["sent"] == 1
    assert {u for u, _ in line_stub.sends} == {u2}
