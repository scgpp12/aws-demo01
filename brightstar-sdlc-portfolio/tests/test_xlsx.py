"""xlsx.py 純粋関数の単体テスト（DD-17〜22）。

入力 xlsx は conftest の make_xlsx で最小バイト列を自作する。
日付シリアル（1900日付システム, date(1899,12,30)+days）の例:
  46174=2026-06-01, 46180=2026-06-07, 46203=2026-06-30
"""
from common import xlsx


# ---------------- DD-20 to_date ----------------

def test_to_date_serial_in_range():
    """UT-001 | DD-20/FR-09 to_date: 日付シリアル(範囲内)→date"""
    from datetime import date
    assert xlsx.to_date(46174) == date(2026, 6, 1)
    assert xlsx.to_date("46180") == date(2026, 6, 7)


def test_to_date_serial_lower_boundary():
    """UT-002 | DD-20 to_date: シリアル境界 20000(範囲内)/19999(範囲外)"""
    from datetime import date, timedelta
    # 20000 は範囲内 → date
    assert xlsx.to_date(20000) == date(1899, 12, 30) + timedelta(days=20000)
    # 19999 は範囲外 → 文字列解釈に回り、年月日パターン非該当 → None
    assert xlsx.to_date(19999) is None


def test_to_date_serial_upper_boundary():
    """UT-003 | DD-20 to_date: シリアル境界 80000(範囲内)/80001(範囲外)"""
    assert xlsx.to_date(80000) is not None
    assert xlsx.to_date(80001) is None


def test_to_date_string_formats():
    """UT-004 | DD-20/FR-10 to_date: 'YYYY/M/D' / 'YYYY-MM-DD' 文字列→date"""
    from datetime import date
    assert xlsx.to_date("2026/6/1") == date(2026, 6, 1)
    assert xlsx.to_date("2026-06-01") == date(2026, 6, 1)


def test_to_date_invalid_month():
    """UT-005 | DD-20 to_date: 不正月 '2026/13/1' → None(ValueError捕捉)"""
    assert xlsx.to_date("2026/13/1") is None


def test_to_date_none_and_garbage():
    """UT-006 | DD-20 to_date: None / 非日付文字列 → None"""
    assert xlsx.to_date(None) is None
    assert xlsx.to_date("あ") is None
    # 範囲外の小さな数値（100）は文字列解釈へ回り None
    assert xlsx.to_date(100) is None


# ---------------- DD-19 col_of ----------------

def test_col_of_single_and_multi():
    """UT-007 | DD-19 col_of: 'B5'→'B', 'AA12'→'AA'"""
    assert xlsx.col_of("B5") == "B"
    assert xlsx.col_of("AA12") == "AA"


def test_col_of_invalid():
    """UT-008 | DD-19 col_of: 不正参照→None"""
    assert xlsx.col_of("5") is None
    assert xlsx.col_of("B") is None       # 行番号なし


# ---------------- DD-22 is_number ----------------

def test_is_number_true():
    """UT-009 | DD-22/FR-09 is_number: '8.5'/数値→True"""
    assert xlsx.is_number("8.5") is True
    assert xlsx.is_number(8) is True
    assert xlsx.is_number("  7  ") is True


def test_is_number_false():
    """UT-010 | DD-22 is_number: '08:00'/None/''→False"""
    assert xlsx.is_number("08:00") is False
    assert xlsx.is_number(None) is False
    assert xlsx.is_number("") is False


# ---------------- DD-17/18 cell_map / read_cell ----------------

def test_cell_map_string_and_number(xlsx_factory):
    """UT-011 | DD-17 cell_map: sharedStrings 文字列 / 数値セルが読める"""
    data = xlsx_factory({"A1": "経費", "B3": "山田太郎", "B5": 46174, "B6": 8.5})
    m = xlsx.cell_map(data)
    assert m["A1"] == "経費"
    assert m["B3"] == "山田太郎"
    assert m["B5"] == "46174"
    assert m["B6"] == "8.5"


def test_cell_map_empty_cells_excluded(xlsx_factory):
    """UT-012 | DD-17 cell_map: 空セルは含めない"""
    data = xlsx_factory({"A1": "経費"})
    m = xlsx.cell_map(data)
    assert "B1" not in m
    assert set(m.keys()) == {"A1"}


def test_cell_map_broken_bytes():
    """UT-013 | DD-17 cell_map: 壊れた/非xlsxバイト→空dict(例外捕捉)"""
    assert xlsx.cell_map(b"not a zip") == {}
    assert xlsx.cell_map(b"") == {}


def test_read_cell_missing(xlsx_factory):
    """UT-014 | DD-18 read_cell: 存在セル→値, 非存在→None"""
    data = xlsx_factory({"A1": "経費"})
    assert xlsx.read_cell(data, "A1") == "経費"
    assert xlsx.read_cell(data, "Z9") is None


# ---------------- DD-21 cell_year_month ----------------

def test_cell_year_month_from_date_serial(xlsx_factory):
    """UT-015 | DD-21/FR-07 cell_year_month: 日付シリアル→(2026,6)"""
    data = xlsx_factory({"A1": 46174})    # 2026-06-01
    assert xlsx.cell_year_month(data, "A1") == (2026, 6)


def test_cell_year_month_from_text(xlsx_factory):
    """UT-016 | DD-21/FR-07 cell_year_month: 文字列『2026年6月分経費』→(2026,6)"""
    data = xlsx_factory({"A1": "2026年6月分経費"})
    assert xlsx.cell_year_month(data, "A1") == (2026, 6)


def test_cell_year_month_invalid_month(xlsx_factory):
    """UT-017 | DD-21 cell_year_month: 月>12テキスト→None"""
    data = xlsx_factory({"A1": "2026年13月"})
    assert xlsx.cell_year_month(data, "A1") is None


def test_cell_year_month_empty(xlsx_factory):
    """UT-018 | DD-21 cell_year_month: 空/読取不可セル→None"""
    data = xlsx_factory({"B1": "経費"})
    assert xlsx.cell_year_month(data, "A1") is None
