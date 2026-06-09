# -*- coding: utf-8 -*-
"""把 教员使用手册.md 转成带样式的 HTML（供 Chrome 无头打印成 PDF）。"""
import os
import markdown

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "教员使用手册.md")
OUT_HTML = os.path.join(HERE, "_manual_build.html")

with open(SRC, "r", encoding="utf-8") as f:
    md_text = f.read()

body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "sane_lists", "toc", "attr_list"],
    output_format="html5",
)

CSS = """
@page { size: A4; margin: 17mm 15mm 16mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body {
  font-family: "Microsoft YaHei","Yu Gothic UI","Meiryo","Noto Sans CJK SC",sans-serif;
  color: #1f2733; font-size: 10.6pt; line-height: 1.7; margin: 0;
}
h1, h2, h3, h4 { color: #0b4f8f; line-height: 1.35; page-break-after: avoid; }
h1 {
  font-size: 21pt; margin: 0 0 4pt; padding-bottom: 8pt;
  border-bottom: 3px solid #0b6bcb;
}
h2 {
  font-size: 14.5pt; margin: 18pt 0 6pt; padding: 4pt 0 4pt 10pt;
  border-left: 5px solid #0b6bcb; background: #eef5fc;
}
h3 { font-size: 12pt; margin: 12pt 0 4pt; color: #0b6bcb; }
h4 { font-size: 10.8pt; margin: 9pt 0 3pt; color: #2a526f; }
p { margin: 5pt 0; }
a { color: #0b6bcb; text-decoration: none; }
strong { color: #0b3d6b; }
hr { border: 0; border-top: 1px solid #d7dde6; margin: 14pt 0; }
ul, ol { margin: 5pt 0 5pt 0; padding-left: 22pt; }
li { margin: 2.5pt 0; }
blockquote {
  margin: 8pt 0; padding: 7pt 12pt; background: #f6f8fb;
  border-left: 4px solid #8fb8de; color: #41566c; border-radius: 0 6px 6px 0;
}
blockquote p { margin: 3pt 0; }
code {
  font-family: "Cascadia Mono","Consolas",monospace; font-size: 9.4pt;
  background: #eef1f5; padding: 1pt 4pt; border-radius: 4px; color: #b3306b;
}
pre {
  background: #f4f6f9; border: 1px solid #e1e6ee; border-radius: 7px;
  padding: 9pt 12pt; margin: 7pt 0; overflow: hidden;
  white-space: pre-wrap; word-break: break-word; page-break-inside: avoid;
}
pre code { background: none; padding: 0; color: #1f2733; font-size: 9.3pt; }
table {
  border-collapse: collapse; width: 100%; margin: 8pt 0; font-size: 9.8pt;
  page-break-inside: avoid;
}
th, td { border: 1px solid #cfd8e3; padding: 5pt 8pt; text-align: left; vertical-align: top; }
th { background: #0b6bcb; color: #fff; font-weight: 600; }
tr:nth-child(even) td { background: #f4f8fc; }
"""

HTML = f"""<!doctype html>
<html lang="zh">
<head><meta charset="utf-8"><style>{CSS}</style></head>
<body>
{body}
</body></html>"""

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(HTML)

print("HTML written:", OUT_HTML)
