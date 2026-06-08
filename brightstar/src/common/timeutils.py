"""时间工具：存储 UTC，展示/Zoom 用 JST。"""
from datetime import datetime, timedelta, timezone

JST = timezone(timedelta(hours=9))


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso_utc(dt: datetime | None = None) -> str:
    dt = dt or now_utc()
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_iso(s: str) -> datetime:
    """解析 ISO8601（容忍结尾 Z），返回带 tz 的 datetime。"""
    s = s.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def to_jst(dt: datetime) -> datetime:
    return dt.astimezone(JST)


def fmt_jst(iso: str) -> str:
    """UTC ISO 字符串 → 展示用 JST 文案。"""
    if not iso:
        return ""
    return to_jst(parse_iso(iso)).strftime("%Y-%m-%d %H:%M (JST)")
