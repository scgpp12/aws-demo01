"""business.py 純粋系・検証系の単体テスト（DD-01〜08）。

AWS 依存（db/s3util）に触れる関数は対象外（結合テスト範囲）。
current_period() を monkeypatch で固定し決定的にテストする。
xlsx 入力は conftest の xlsx_factory で自作。

2026-06 の日付シリアル(1900系): 46174=6/1, 46179=6/6(土), 46180=6/7(日),
  46181=6/8(月), 46203=6/30。
"""
import pytest

from common import business


# ============ DD-01 normalize_period ============

@pytest.fixture
def fixed_period(monkeypatch):
    """current_period() を '202606' に固定。"""
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    return "202606"


def test_normalize_period_yyyymm(fixed_period):
    """UT-025 | DD-01/FR-16 normalize_period: '202606'→'202606'"""
    assert business.normalize_period("202606") == "202606"


def test_normalize_period_bracket(fixed_period):
    """UT-026 | DD-01/FR-16 normalize_period: '[202606]'→'202606'"""
    assert business.normalize_period("[202606]") == "202606"


def test_normalize_period_hyphen_zeropad(fixed_period):
    """UT-027 | DD-01/FR-16 normalize_period: '2026-6'→'202606'(月ゼロ詰め)"""
    assert business.normalize_period("2026-6") == "202606"
    assert business.normalize_period("2026-06") == "202606"


def test_normalize_period_month_word(fixed_period):
    """UT-028 | DD-01/FR-16 normalize_period: '6月'→当年+'06', '12月'→当年+'12'"""
    assert business.normalize_period("6月") == "202606"
    assert business.normalize_period("12月") == "202612"


def test_normalize_period_empty_or_none(fixed_period):
    """UT-029 | DD-01 normalize_period: ''/None→当月(current_period)"""
    assert business.normalize_period("") == "202606"
    assert business.normalize_period(None) == "202606"


def test_normalize_period_irrelevant_text(fixed_period):
    """UT-030 | DD-01 normalize_period: 無関係文字『未提出確認』→当月"""
    assert business.normalize_period("未提出確認") == "202606"


def test_normalize_period_month_over_12_unguarded(fixed_period):
    """UT-031 | DD-01 normalize_period: 月>12 は非ガード(仕様注記)→'202613'"""
    # 設計書 DD-01 注記: 月>12 のガードは本関数に無い。仕様通りの挙動を確認。
    assert business.normalize_period("2026-13") == "202613"


# ============ DD-02 infer_type ============

def test_infer_type_kintai_by_filename():
    """UT-032 | DD-02/FR-05 infer_type: 勤怠キーワード(ファイル名)→'kintai'"""
    assert business.infer_type("作業時間記録簿_202606.xlsx") == "kintai"
    assert business.infer_type("勤怠.xlsx") == "kintai"


def test_infer_type_commute_by_filename():
    """UT-033 | DD-02/FR-05 infer_type: 経費キーワード→'commute'"""
    assert business.infer_type("経費（山田）.xlsx") == "commute"
    assert business.infer_type("通勤費.xlsx") == "commute"


def test_infer_type_kintai_priority():
    """UT-034 | DD-02/FR-05 infer_type: 両キーワード含む→kintai優先"""
    assert business.infer_type("勤怠と経費.xlsx") == "kintai"


def test_infer_type_unknown():
    """UT-035 | DD-02/FR-06 infer_type: 不明→None"""
    assert business.infer_type("file.xlsx") is None


def test_infer_type_none_empty():
    """UT-036 | DD-02 infer_type: None/'' → None"""
    assert business.infer_type(None, "") is None
    assert business.infer_type("", "") is None


def test_infer_type_case_insensitive():
    """UT-037 | DD-02 infer_type: 大小無視『KINTAI』→'kintai'"""
    assert business.infer_type("KINTAI.xlsx") == "kintai"


def test_infer_type_by_text_arg():
    """UT-038 | DD-02/FR-06 infer_type: テキスト引数でも判定"""
    assert business.infer_type("file.xlsx", "これは勤怠です") == "kintai"
    assert business.infer_type("file.xlsx", "交通費の精算") == "commute"


# ============ DD-04 _norm_name ============

def test_norm_name_half_space():
    """UT-039 | DD-04/FR-08 _norm_name: 半角スペース除去"""
    assert business._norm_name("山田 太郎") == "山田太郎"


def test_norm_name_full_space():
    """UT-040 | DD-04/FR-08 _norm_name: 全角空白『　』除去"""
    assert business._norm_name("山田　太郎") == "山田太郎"


def test_norm_name_trailing_space():
    """UT-041 | DD-04 _norm_name: 前後空白除去"""
    assert business._norm_name("山田太郎 ") == "山田太郎"
    assert business._norm_name("  山田太郎  ") == "山田太郎"


def test_norm_name_none():
    """UT-042 | DD-04 _norm_name: None → ''"""
    assert business._norm_name(None) == ""


# ============ DD-08 is_late_resubmit ============

def test_is_late_resubmit_current_false(monkeypatch):
    """UT-043 | DD-08/FR-25 is_late_resubmit: 当月→False"""
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    assert business.is_late_resubmit("202606") is False


def test_is_late_resubmit_past_true(monkeypatch):
    """UT-044 | DD-08/FR-25 is_late_resubmit: 過去月への補提出→True"""
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    assert business.is_late_resubmit("202605") is True
    assert business.is_late_resubmit("202512") is True


def test_is_late_resubmit_future_false(monkeypatch):
    """UT-045 | DD-08/FR-25 is_late_resubmit: 未来月→False"""
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    assert business.is_late_resubmit("202607") is False


# ============ DD-03 check_file_period ============

def test_check_file_period_match_kintai(xlsx_factory):
    """UT-046 | DD-03/FR-07 check_file_period: kintai B5 年月一致→(True,'2026-06')"""
    data = xlsx_factory({"B5": 46174})    # 2026-06-01
    ok, found = business.check_file_period("kintai", data, "202606")
    assert ok is True
    assert found == "2026-06"


def test_check_file_period_match_commute(xlsx_factory):
    """UT-047 | DD-03/FR-07 check_file_period: commute A1 文字列年月一致→True"""
    data = xlsx_factory({"A1": "2026年6月分経費"})
    ok, found = business.check_file_period("commute", data, "202606")
    assert ok is True
    assert found == "2026-06"


def test_check_file_period_mismatch(xlsx_factory):
    """UT-048 | DD-03/FR-07 check_file_period: 月違い→(False,'2026-05')(保存しない)"""
    data = xlsx_factory({"B5": "2026年5月"})
    ok, found = business.check_file_period("kintai", data, "202606")
    assert ok is False
    assert found == "2026-05"


def test_check_file_period_unreadable(xlsx_factory):
    """UT-049 | DD-03/FR-07 check_file_period: 読取不可セル→(False,None)"""
    data = xlsx_factory({"A9": "無関係"})   # B5 空
    ok, found = business.check_file_period("kintai", data, "202606")
    assert ok is False
    assert found is None


def test_check_file_period_unknown_type(xlsx_factory):
    """UT-050 | DD-03 check_file_period: 未対応種別→(False,None)"""
    data = xlsx_factory({"B5": 46174})
    ok, found = business.check_file_period("unknown", data, "202606")
    assert ok is False
    assert found is None


# ============ DD-06 holiday_work_warnings ============
# kintai 様式: 5行=日付(B5,C5,...), 6/7行=時間。
# 休日(土日祝)の列に 6 or 7 行が数値の日だけ警告。

def test_holiday_work_warnings_weekend_with_time(xlsx_factory):
    """UT-051 | DD-06/FR-09 holiday_work_warnings: 土日に時間入力→警告"""
    data = xlsx_factory({
        "B5": 46179,  # 6/6(土)
        "B6": 8.0,    # 時間入力あり
        "C5": 46180,  # 6/7(日)
        "C7": 5.0,    # 7行に時間
    })
    warns = business.holiday_work_warnings("kintai", data)
    assert warns == ["6/6(土)", "6/7(日)"]


def test_holiday_work_warnings_weekday_no_warn(xlsx_factory):
    """UT-052 | DD-06/FR-09 holiday_work_warnings: 平日の時間入力→警告対象外"""
    data = xlsx_factory({
        "B5": 46181,  # 6/8(月・平日)
        "B6": 8.0,
    })
    assert business.holiday_work_warnings("kintai", data) == []


def test_holiday_work_warnings_holiday_no_time(xlsx_factory):
    """UT-053 | DD-06/FR-09 holiday_work_warnings: 休日だが時間空→対象外"""
    data = xlsx_factory({
        "B5": 46179,  # 6/6(土) 時間なし
    })
    assert business.holiday_work_warnings("kintai", data) == []


def test_holiday_work_warnings_holiday_marked(xlsx_factory):
    """UT-054 | DD-06/FR-09 holiday_work_warnings: 祝日→『M/D(曜・祝)』"""
    data = xlsx_factory({
        "B5": 46023,  # 2026-01-01(元日・木)
        "B6": 8.0,
    })
    assert business.holiday_work_warnings("kintai", data) == ["1/1(木・祝)"]


def test_holiday_work_warnings_commute_empty(xlsx_factory):
    """UT-055 | DD-06 holiday_work_warnings: commuteは常に[]"""
    data = xlsx_factory({"B5": 46179, "B6": 8.0})
    assert business.holiday_work_warnings("commute", data) == []


def test_holiday_work_warnings_broken_file():
    """UT-056 | DD-06 holiday_work_warnings: 壊れファイル(cell_map空)→[]"""
    assert business.holiday_work_warnings("kintai", b"not xlsx") == []


# ============ DD-07 missing_dates ============

def test_missing_dates_all_present(xlsx_factory):
    """UT-057 | DD-07/FR-10 missing_dates: 全日揃う→[]"""
    from datetime import date, timedelta
    base = date(1899, 12, 30)
    cells = {}
    for day in range(1, 31):  # 6月は30日
        d = date(2026, 6, day)
        col = chr(ord("A") + (day - 1))   # A..AD は1文字超えるので簡略化
        # 列は A..Z までに収め、超える分は別アプローチ。30日なので A..Z(26)+α
        cells["%s5" % _col_letters(day)] = (d - base).days
    data = xlsx_factory(cells)
    assert business.missing_dates("kintai", data, "202606") == []


def test_missing_dates_first_and_last_missing(xlsx_factory):
    """UT-058 | DD-07/FR-10 missing_dates: 1日と月末欠落→[1, last]"""
    from datetime import date, timedelta
    base = date(1899, 12, 30)
    cells = {}
    for day in range(2, 30):   # 1日と30日を欠落させる
        d = date(2026, 6, day)
        cells["%s5" % _col_letters(day)] = (d - base).days
    data = xlsx_factory(cells)
    assert business.missing_dates("kintai", data, "202606") == [1, 30]


def test_missing_dates_other_month_not_counted(xlsx_factory):
    """UT-059 | DD-07 missing_dates: period外の月の日付はpresentに数えない"""
    from datetime import date
    base = date(1899, 12, 30)
    # 1日だけ正しい月(6/1)、残りは他月(5月)の日付
    cells = {"A5": (date(2026, 6, 1) - base).days}
    for i, day in enumerate(range(2, 31), start=1):
        cells["%s5" % _col_letters(day)] = (date(2026, 5, day) - base).days
    data = xlsx_factory(cells)
    # 6月で揃うのは1日のみ → 2..30 が欠落
    assert business.missing_dates("kintai", data, "202606") == list(range(2, 31))


def test_missing_dates_leap_february(xlsx_factory):
    """UT-060 | DD-07 missing_dates: うるう年2月→last=29(全欠落で1..29)"""
    # 2024年2月(うるう年) 何も入力なし → 1..29 全欠落
    data = xlsx_factory({"A9": "dummy"})
    assert business.missing_dates("kintai", data, "202402") == list(range(1, 30))


def test_missing_dates_commute_empty(xlsx_factory):
    """UT-061 | DD-07 missing_dates: commute→[]"""
    data = xlsx_factory({"A1": "経費"})
    assert business.missing_dates("commute", data, "202606") == []


# ============ DD-05 check_name (emp_name をモック) ============

def test_check_name_kintai_match(xlsx_factory, monkeypatch):
    """UT-062 | DD-05/FR-08 check_name: 勤怠B3一致(空白差異含む)→(True,...)"""
    monkeypatch.setattr(business, "emp_name", lambda uid: "山田太郎")
    data = xlsx_factory({"B3": "山田　太郎"})   # 全角空白差異
    ok, found = business.check_name("kintai", data, "line:u1")
    assert ok is True
    assert found == "山田　太郎"


def test_check_name_kintai_mismatch(xlsx_factory, monkeypatch):
    """UT-063 | DD-05/FR-08 check_name: 勤怠B3不一致→(False,'別人')(保存しない)"""
    monkeypatch.setattr(business, "emp_name", lambda uid: "山田太郎")
    data = xlsx_factory({"B3": "別人"})
    ok, found = business.check_name("kintai", data, "line:u1")
    assert ok is False
    assert found == "別人"


def test_check_name_commute_always_ok(xlsx_factory, monkeypatch):
    """UT-064 | DD-05/FR-08 check_name: commuteは対象外→(True,None)"""
    monkeypatch.setattr(business, "emp_name", lambda uid: "山田太郎")
    data = xlsx_factory({"B3": "誰でも"})
    ok, found = business.check_name("commute", data, "line:u1")
    assert ok is True
    assert found is None


def test_check_name_empty_b3(xlsx_factory, monkeypatch):
    """UT-065 | DD-05 check_name: B3空→(False, found=None)"""
    monkeypatch.setattr(business, "emp_name", lambda uid: "山田太郎")
    data = xlsx_factory({"A1": "x"})    # B3 空
    ok, found = business.check_name("kintai", data, "line:u1")
    assert ok is False
    assert found is None


# ---------------- ヘルパ ----------------

def _col_letters(n):
    """1→A, 26→Z, 27→AA の Excel 列名（1始まり）。"""
    s = ""
    while n > 0:
        n, r = divmod(n - 1, 26)
        s = chr(ord("A") + r) + s
    return s
