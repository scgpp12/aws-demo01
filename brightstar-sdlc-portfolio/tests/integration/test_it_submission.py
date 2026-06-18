"""結合テスト：ファイル提出フロー。IT-04〜09。

file イベント → _handle_file（種別判定 / DL）→ _do_submit
（年月・氏名チェック → S3 保存 → submissions 記録 → 応答）を実コードで通す。
複数リソース（S3 + submissions）の整合と分岐（保存する/しない）を検証。

current_period は '202606' に固定（決定的）。xlsx は make_xlsx で自作。
2026-06 シリアル: 46174=6/1, 46180=6/7(日), 46203=6/30。
"""
import pytest

from common import business, db, config, line, s3util

from .conftest import file_event, text_event, kintai_serial


@pytest.fixture(autouse=True)
def fixed_period(monkeypatch):
    """current_period() を '202606' に固定。"""
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    # line_webhook._do_submit が参照する business.current_period も同一オブジェクト
    return "202606"


def _set_download(monkeypatch, data):
    """webhook が呼ぶ line.download_content を所与バイト列にする。"""
    monkeypatch.setattr(line, "download_content", lambda mid: data)
    # line_webhook._handle_file は `from common import line` 済の同一 line を参照
    from handlers import line_webhook
    monkeypatch.setattr(line_webhook.line, "download_content", lambda mid: data)


def _full_kintai_cells(name="山田太郎", period="202606", missing_days=(),
                       holiday_hours=None):
    """勤怠 xlsx セル: B3=氏名, B5=年月, 5行=日付(全日), 6/7行=時間。
    missing_days: 5 行目から除外する日。holiday_hours: {day: 時間} で 6 行に時間入力。
    """
    import calendar
    cells = {"B3": name, "B5": kintai_serial(1, period)}  # B5 は 6/1 のシリアル（年月推定）
    y, mo = int(period[:4]), int(period[4:])
    last = calendar.monthrange(y, mo)[1]
    col_idx = 0
    holiday_hours = holiday_hours or {}
    for day in range(1, last + 1):
        if day in missing_days:
            continue
        # 列を A,B,C... と割り当て（5 行目=日付）。B5 は年月なので C 列以降に日付を置く。
        col = _col_letter(col_idx + 2)  # C 列開始（index2=C）
        cells["%s5" % col] = kintai_serial(day, period)
        if day in holiday_hours:
            cells["%s6" % col] = holiday_hours[day]
        col_idx += 1
    return cells


def _col_letter(idx):
    """0→A,1→B,...25→Z,26→AA。"""
    s = ""
    idx += 1
    while idx:
        idx, r = divmod(idx - 1, 26)
        s = chr(65 + r) + s
    return s


def test_it04_kintai_submit_ok(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-04 | FR-05,07,08,11 勤怠提出 正常。

    file イベント→種別 kintai 判定→年月/氏名一致→submissions 記録 + S3 存在（key 検証）。
    """
    uid = "line:U101"
    seed.link("E001", "山田太郎", uid, department="開発部")

    data = make_xlsx(_full_kintai_cells(name="山田太郎"))
    _set_download(monkeypatch, data)

    route(file_event(uid, "作業時間記録簿_202606.xlsx"))

    # submissions 記録
    item = db.submissions().get_item(
        Key={"userId": uid, "sk": "202606#kintai"}).get("Item")
    assert item is not None
    assert item["type"] == "kintai"
    assert item["period"] == "202606"
    assert item["gsi1pk"] == "202606#kintai"

    # S3 オブジェクト存在（key = hr/2026/06/worktimes/...）
    key = item["s3Key"]
    assert key.startswith("hr/2026/06/worktimes/")
    assert s3util.read_object(key) == data

    assert "受け付けました" in line_stub.reply_concat()


def test_it05_period_mismatch_not_saved(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-05 | FR-07 年月不一致 → 保存しない（submissions が作られない）。"""
    uid = "line:U102"
    seed.link("E001", "山田太郎", uid)

    # B5 を 2026-05（先月）にして不一致を作る
    cells = _full_kintai_cells(name="山田太郎")
    cells["B5"] = kintai_serial(1, "202605")
    data = make_xlsx(cells)
    _set_download(monkeypatch, data)

    route(file_event(uid, "作業時間記録簿.xlsx"))

    item = db.submissions().get_item(
        Key={"userId": uid, "sk": "202606#kintai"}).get("Item")
    assert item is None
    # period_mismatch メッセージ
    assert "一致しません" in line_stub.reply_concat()


def test_it06_name_mismatch_not_saved(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-06 | FR-08 氏名不一致 → 保存しない。"""
    uid = "line:U103"
    seed.link("E001", "山田太郎", uid)

    # B3 を別人にする
    cells = _full_kintai_cells(name="鈴木花子")
    data = make_xlsx(cells)
    _set_download(monkeypatch, data)

    route(file_event(uid, "kintai.xlsx"))

    assert db.submissions().get_item(
        Key={"userId": uid, "sk": "202606#kintai"}).get("Item") is None
    assert "一致しません" in line_stub.reply_concat()


def test_it07_holiday_work_warning_but_saved(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-07 | FR-09,11 休日勤務警告つきで保存はする。

    6/7(日) に時間入力 → 警告文あり、かつ submissions は作られる。
    """
    uid = "line:U104"
    seed.link("E001", "山田太郎", uid)

    cells = _full_kintai_cells(name="山田太郎", holiday_hours={7: 8})  # 6/7=日曜
    data = make_xlsx(cells)
    _set_download(monkeypatch, data)

    route(file_event(uid, "勤怠.xlsx"))

    # 保存される
    assert db.submissions().get_item(
        Key={"userId": uid, "sk": "202606#kintai"}).get("Item") is not None
    txt = line_stub.reply_concat()
    assert "受け付けました" in txt
    assert "休日に勤務時間" in txt


def test_it08_missing_dates_warning(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-08 | FR-10 日付欠落警告（保存はする）。15 日を欠落させる。"""
    uid = "line:U105"
    seed.link("E001", "山田太郎", uid)

    cells = _full_kintai_cells(name="山田太郎", missing_days={15})
    data = make_xlsx(cells)
    _set_download(monkeypatch, data)

    route(file_event(uid, "作業時間.xlsx"))

    assert db.submissions().get_item(
        Key={"userId": uid, "sk": "202606#kintai"}).get("Item") is not None
    txt = line_stub.reply_concat()
    assert "受け付けました" in txt
    assert "15日" in txt and "揃っていません" in txt


def test_it09_pending_then_resolve_by_typeword(line_stub, seed, route, make_xlsx, monkeypatch):
    """IT-09 | FR-06,11 種別不明→pending 保留→種別語で転正。

    1 通目: ファイル名から種別判定できない → stash_pending（S3 pending/ + employees.pendingKey）。
    2 通目: テキスト「経費」 → pending を commute として submissions 化。
    """
    uid = "line:U106"
    seed.link("E001", "山田太郎", uid)

    # commute は A1=年月のみ要求。種別判定不能なファイル名にする。
    data = make_xlsx({"A1": "2026年6月分経費"})
    _set_download(monkeypatch, data)

    # 1 通目: 種別不明 file
    route(file_event(uid, "document.xlsx"))

    emp = db.employees().get_item(Key={"userId": uid})["Item"]
    assert emp.get("pendingKey")                       # pending 保留
    assert business.has_pending(uid)
    assert "経費」ですか" in line_stub.reply_concat()    # ask_type
    # この時点では submissions は無い
    assert db.submissions().get_item(
        Key={"userId": uid, "sk": "202606#commute"}).get("Item") is None

    # 2 通目: テキスト「経費」 → 転正
    route(text_event(uid, "経費"))

    item = db.submissions().get_item(
        Key={"userId": uid, "sk": "202606#commute"}).get("Item")
    assert item is not None
    assert item["type"] == "commute"
    assert item["s3Key"].startswith("hr/2026/06/expenses/")
    # pending ポインタは解除
    emp2 = db.employees().get_item(Key={"userId": uid})["Item"]
    assert not emp2.get("pendingKey")
    assert "受け付けました" in line_stub.reply_concat()
