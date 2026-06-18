"""jpholiday.py 祝日判定の単体テスト（DD-23）。

検証に用いる事実(2026年):
  2026-01-01(元日)=木曜, 2026-05-03(憲法記念日)=日曜 → 2026-05-06 が振替休日,
  2026-06-06=土, 2026-06-07=日, 2026-06-08=月(平日)。
"""
from datetime import date

from common import jpholiday


def test_is_holiday_new_year():
    """UT-019 | DD-23/FR-09 is_holiday: 元日 2026-01-01 → True/名称『元日』"""
    assert jpholiday.is_holiday(date(2026, 1, 1)) is True
    assert jpholiday.holiday_name(date(2026, 1, 1)) == "元日"


def test_is_holiday_substitute():
    """UT-020 | DD-23 is_holiday: 振替休日 2026-05-06 → True/名称『振替休日』"""
    # 5/3(憲法記念日)が日曜 → 5/4はみどりの日 → 5/6が振替休日
    assert jpholiday.is_holiday(date(2026, 5, 6)) is True
    assert jpholiday.holiday_name(date(2026, 5, 6)) == "振替休日"


def test_is_holiday_weekday_false():
    """UT-021 | DD-23 is_holiday: 通常の平日 → False"""
    assert jpholiday.is_holiday(date(2026, 6, 8)) is False     # 月曜・平日
    assert jpholiday.holiday_name(date(2026, 6, 8)) is None


def test_is_rest_day_weekend():
    """UT-022 | DD-23/FR-09 is_rest_day: 土曜/日曜 → True"""
    assert jpholiday.is_rest_day(date(2026, 6, 6)) is True     # 土
    assert jpholiday.is_rest_day(date(2026, 6, 7)) is True     # 日


def test_is_rest_day_holiday_on_weekday():
    """UT-023 | DD-23 is_rest_day: 平日の祝日(元日=木)/振替休日 → True"""
    assert jpholiday.is_rest_day(date(2026, 1, 1)) is True     # 木曜だが祝日
    assert jpholiday.is_rest_day(date(2026, 5, 6)) is True     # 振替休日


def test_is_rest_day_plain_weekday_false():
    """UT-024 | DD-23 is_rest_day: 平日(非祝日) → False"""
    assert jpholiday.is_rest_day(date(2026, 6, 8)) is False    # 月曜・平日
    assert jpholiday.is_rest_day(date(2026, 6, 1)) is False    # 月曜・平日
