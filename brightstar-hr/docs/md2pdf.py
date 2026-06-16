# -*- coding: utf-8 -*-
"""Markdown → 印刷用スタイル付き HTML を生成（Chrome ヘッドレスで PDF 化する前段）。

usage: python md2pdf.py <input.md> <output.html> "<title>"
"""
import sys
import markdown

CSS = """
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body { font-family: 'Noto Sans JP', sans-serif; color: #1B2733; line-height: 1.7;
       font-size: 10.5pt; margin: 0; }
h1 { color: #0E2238; font-size: 22pt; border-bottom: 3px solid #1390A6;
     padding-bottom: 8px; margin: 0 0 14px; }
h2 { color: #0B5A82; font-size: 15pt; margin: 22px 0 8px;
     border-left: 5px solid #1390A6; padding-left: 10px; }
h3 { color: #16314e; font-size: 12.5pt; margin: 16px 0 6px; }
p { margin: 6px 0; }
ul, ol { margin: 6px 0 6px 0; padding-left: 22px; }
li { margin: 3px 0; }
strong { color: #0B5A82; }
code { background: #F4F7FB; border: 1px solid #e2e8f0; border-radius: 4px;
       padding: 1px 5px; font-size: 9.5pt;
       font-family: 'Consolas','Noto Sans JP',monospace; }
pre { background: #0E2238; color: #e6edf3; border-radius: 8px; padding: 12px 14px;
      overflow-x: auto; font-size: 9pt; line-height: 1.5; }
pre code { background: none; border: none; color: inherit; padding: 0; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt; }
th, td { border: 1px solid #cbd5e1; padding: 6px 9px; text-align: left;
         vertical-align: top; }
th { background: #0E2238; color: #fff; font-weight: 700; }
tr:nth-child(even) td { background: #F4F7FB; }
blockquote { border-left: 4px solid #E0A43B; background: #fffaf0; margin: 10px 0;
             padding: 8px 14px; color: #5E6B7A; }
h2, h3 { page-break-after: avoid; }
table, pre, blockquote { page-break-inside: avoid; }
.brandbar { color:#5E6B7A; font-size: 8.5pt; text-align:right; margin-bottom: 4px; }
"""

HTML = """<!doctype html><html lang="ja"><head><meta charset="utf-8">
<title>{title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>{css}</style></head><body>
<div class="brandbar">BrightStar 社内システム ｜ 受託開発ケーススタディ</div>
{body}
</body></html>"""


def main():
    src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
    md = open(src, encoding="utf-8").read()
    body = markdown.markdown(md, extensions=["tables", "fenced_code", "sane_lists", "nl2br"])
    html = HTML.format(title=title, css=CSS, body=body)
    open(out, "w", encoding="utf-8").write(html)
    print("wrote", out, len(html), "bytes")


if __name__ == "__main__":
    main()
