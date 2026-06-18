"""pytest 共通設定。

- lambda/ を sys.path に追加し `from common import ...` を可能にする。
- xlsx を import するだけで boto3 client/resource が生成されるが、
  ネットワーク呼び出しは発生しないため純粋関数テストには影響しない。
  万一の資格情報エラー回避のためリージョンを既定設定する。
- xlsx バイト列をテスト内で自作するためのヘルパ fixture を提供する。
"""
import os
import sys

import pytest

# AWS 資格情報未設定でも client 生成だけは通るようにリージョンを既定設定
os.environ.setdefault("AWS_DEFAULT_REGION", "ap-northeast-1")
os.environ.setdefault("AWS_REGION", "ap-northeast-1")

# lambda/ ディレクトリを import パスに追加（from common import ... 形式）
_LAMBDA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "brightstar-hr", "lambda")
sys.path.insert(0, os.path.abspath(_LAMBDA_DIR))


# ---------------- xlsx 生成ヘルパ ----------------

_CT = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    '<Default Extension="xml" ContentType="application/xml"/>'
    '<Override PartName="/xl/workbook.xml" '
    'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
    '<Override PartName="/xl/worksheets/sheet1.xml" '
    'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
    '<Override PartName="/xl/sharedStrings.xml" '
    'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>'
    '</Types>'
)

_ROOT_RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
    'Target="xl/workbook.xml"/></Relationships>'
)

_WB = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
    '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'
)

_WB_RELS = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
    'Target="worksheets/sheet1.xml"/>'
    '<Relationship Id="rId2" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" '
    'Target="sharedStrings.xml"/></Relationships>'
)

_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


def _xml_escape(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def make_xlsx(cells):
    """{cell_ref: value} から最小の xlsx バイト列を生成する。

    値の型で書き分け:
      - str          → sharedStrings 参照（t="s"）
      - int/float    → 数値（型なし、<v> に文字列化）
    cell_map / read_cell 等が実装と同じ経路（zip+sharedStrings）で読めるよう、
    xl.py が前提とする最小構成（content types / rels / workbook / sharedStrings /
    worksheets/sheet1.xml）を備える。
    """
    import io
    import re
    import zipfile

    # 共有文字列テーブルを構築
    shared = []
    shared_index = {}
    for ref, val in cells.items():
        if isinstance(val, str):
            if val not in shared_index:
                shared_index[val] = len(shared)
                shared.append(val)

    si_parts = []
    for s in shared:
        si_parts.append("<si><t xml:space=\"preserve\">%s</t></si>" % _xml_escape(s))
    shared_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<sst xmlns="%s" count="%d" uniqueCount="%d">%s</sst>'
        % (_NS, len(shared), len(shared), "".join(si_parts))
    )

    # 行ごとにセルをまとめる
    rows = {}
    for ref, val in cells.items():
        m = re.match(r"^([A-Z]+)(\d+)$", ref)
        if not m:
            raise ValueError("bad cell ref: %s" % ref)
        rownum = int(m.group(2))
        rows.setdefault(rownum, []).append((ref, val))

    row_xml = []
    for rownum in sorted(rows):
        cell_xml = []
        for ref, val in sorted(rows[rownum], key=lambda x: x[0]):
            if isinstance(val, str):
                idx = shared_index[val]
                cell_xml.append('<c r="%s" t="s"><v>%d</v></c>' % (ref, idx))
            else:
                # 数値（日付シリアルも数値として格納）
                cell_xml.append('<c r="%s"><v>%s</v></c>' % (ref, repr(val) if isinstance(val, float) else str(val)))
        row_xml.append('<row r="%d">%s</row>' % (rownum, "".join(cell_xml)))

    sheet_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="%s"><sheetData>%s</sheetData></worksheet>'
        % (_NS, "".join(row_xml))
    )

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", _CT)
        z.writestr("_rels/.rels", _ROOT_RELS)
        z.writestr("xl/workbook.xml", _WB)
        z.writestr("xl/_rels/workbook.xml.rels", _WB_RELS)
        z.writestr("xl/sharedStrings.xml", shared_xml)
        z.writestr("xl/worksheets/sheet1.xml", sheet_xml)
    return buf.getvalue()


@pytest.fixture
def xlsx_factory():
    """テストから {cell_ref: value} を渡して xlsx バイト列を得る fixture。"""
    return make_xlsx
