"""最小限の xlsx セル読取（標準ライブラリのみ・依存ゼロ）。

xlsx は zip+XML。指定セル（A1/B5 等）の値を取り出し、年月(year,month)を推定する。
- 文字列セル：sharedStrings 参照 / inlineStr / str
- 数値セル：日付シリアル値（1900 日付システム）なら日付へ変換
"""
import io
import re
import zipfile
from datetime import date, timedelta
from xml.etree import ElementTree as ET

_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"


def _shared_strings(z):
    out = []
    try:
        ss = ET.fromstring(z.read("xl/sharedStrings.xml"))
    except KeyError:
        return out
    for si in ss.findall(_NS + "si"):
        out.append("".join(t.text or "" for t in si.iter(_NS + "t")))
    return out


def _first_sheet_path(z):
    names = z.namelist()
    if "xl/worksheets/sheet1.xml" in names:
        return "xl/worksheets/sheet1.xml"
    ws = sorted(n for n in names
                if n.startswith("xl/worksheets/sheet") and n.endswith(".xml"))
    return ws[0] if ws else None


def read_cell(data, cell_ref):
    """指定セル（例 'A1'）の生値を返す。文字列 or 数値文字列。無ければ None。"""
    try:
        z = zipfile.ZipFile(io.BytesIO(data))
    except Exception:  # noqa: BLE001
        return None
    shared = _shared_strings(z)
    path = _first_sheet_path(z)
    if not path:
        return None
    root = ET.fromstring(z.read(path))
    for c in root.iter(_NS + "c"):
        if c.get("r") != cell_ref:
            continue
        t = c.get("t")
        v = c.find(_NS + "v")
        if t == "s" and v is not None:
            try:
                return shared[int(v.text)]
            except (ValueError, IndexError):
                return None
        if t == "inlineStr":
            is_el = c.find(_NS + "is")
            return "".join(x.text or "" for x in is_el.iter(_NS + "t")) if is_el is not None else None
        if v is not None:
            return v.text          # str / 数値
    return None


def _serial_to_ym(serial):
    d = date(1899, 12, 30) + timedelta(days=int(float(serial)))
    return d.year, d.month


def cell_year_month(data, cell_ref):
    """セルから (year, month) を推定。取れなければ None。
    - 日付シリアル数値 → 変換
    - 文字列（'2025年3月分経費' / '2024/12/1' 等）→ 正規表現抽出"""
    val = read_cell(data, cell_ref)
    if val is None:
        return None
    s = str(val).strip()
    try:
        f = float(s)
        if 20000 <= f <= 80000:    # 1954〜2119 年あたりの日付シリアル
            return _serial_to_ym(f)
    except ValueError:
        pass
    m = re.search(r"(20\d{2})\D{0,3}?(\d{1,2})", s)
    if m:
        mo = int(m.group(2))
        if 1 <= mo <= 12:
            return int(m.group(1)), mo
    return None
