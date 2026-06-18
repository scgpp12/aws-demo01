# -*- coding: utf-8 -*-
"""Markdown → 印刷用スタイル付き HTML（Mermaid 図対応）。

既存 md2pdf.py の上位版：```mermaid ブロックを <div class="mermaid"> に変換し、
mermaid.js（CDN）でレンダリング。Chrome ヘッドレス + --virtual-time-budget で PDF 化する。

usage: python md2pdf_mermaid.py <input.md> <output.html> "<title>"
"""
import re
import sys

import markdown

CSS = """
@page { size: A4; margin: 16mm 15mm 18mm; }
* { box-sizing: border-box; }
body { font-family: 'Noto Sans JP', sans-serif; color: #1B2733; line-height: 1.7;
       font-size: 10pt; margin: 0; }
h1 { color: #0E2238; font-size: 20pt; border-bottom: 3px solid #1390A6;
     padding-bottom: 8px; margin: 0 0 14px; }
h2 { color: #0B5A82; font-size: 14pt; margin: 20px 0 8px;
     border-left: 5px solid #1390A6; padding-left: 10px; }
h3 { color: #16314e; font-size: 12pt; margin: 14px 0 6px; }
h4 { color: #16314e; font-size: 10.5pt; margin: 12px 0 4px; }
p { margin: 6px 0; }
ul, ol { margin: 6px 0 6px 0; padding-left: 22px; }
li { margin: 3px 0; }
strong { color: #0B5A82; }
code { background: #F4F7FB; border: 1px solid #e2e8f0; border-radius: 4px;
       padding: 1px 5px; font-size: 9pt;
       font-family: 'Consolas','Noto Sans JP',monospace; }
pre { background: #0E2238; color: #e6edf3; border-radius: 8px; padding: 12px 14px;
      overflow-x: auto; font-size: 8.5pt; line-height: 1.5; }
pre code { background: none; border: none; color: inherit; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 8.8pt; }
th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left;
         vertical-align: top; }
th { background: #0E2238; color: #fff; font-weight: 700; }
tr:nth-child(even) td { background: #F4F7FB; }
blockquote { border-left: 4px solid #E0A43B; background: #fffaf0; margin: 10px 0;
             padding: 8px 14px; color: #5E6B7A; }
h2, h3, h4 { page-break-after: avoid; }
table, pre, blockquote, .mermaid { page-break-inside: avoid; }
.mermaid { margin: 12px 0; text-align: center; }
.brandbar { color:#5E6B7A; font-size: 8.5pt; text-align:right; margin-bottom: 4px;
            border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
"""

HTML = """<!doctype html><html lang="ja"><head><meta charset="utf-8">
<title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<script>
  mermaid.initialize({{ startOnLoad: true, theme: 'neutral',
    themeVariables: {{ fontFamily: 'Noto Sans JP, sans-serif', fontSize: '13px' }},
    flowchart: {{ useMaxWidth: true }}, sequence: {{ useMaxWidth: true }} }});
</script>
<style>{css}</style></head><body>
<div class="brandbar">BrightStar 社内システム ｜ 勤怠・通勤費 提出システム 開発ドキュメント</div>
{body}
</body></html>"""


def convert(src, out, title):
    md = open(src, encoding="utf-8").read()

    # ```mermaid ブロックを退避（markdown 変換で壊さない）
    blocks = []

    def stash(m):
        blocks.append(m.group(1))
        return "\n\nMERMAIDPLACEHOLDER%d\n\n" % (len(blocks) - 1)

    md = re.sub(r"```mermaid\s*\n(.*?)```", stash, md, flags=re.S)

    body = markdown.markdown(
        md, extensions=["tables", "fenced_code", "sane_lists", "nl2br"]
    )

    # プレースホルダを <div class="mermaid"> に戻す（<p> 包みも考慮）
    for i, code in enumerate(blocks):
        div = '<div class="mermaid">\n%s\n</div>' % code.strip()
        body = body.replace("<p>MERMAIDPLACEHOLDER%d</p>" % i, div)
        body = body.replace("MERMAIDPLACEHOLDER%d" % i, div)

    html = HTML.format(title=title, css=CSS, body=body)
    open(out, "w", encoding="utf-8").write(html)
    print("wrote", out, len(html), "bytes,", len(blocks), "mermaid")


if __name__ == "__main__":
    convert(sys.argv[1], sys.argv[2], sys.argv[3])
