# -*- coding: utf-8 -*-
"""BrightStar 受託開発ケーススタディ —— 日本語プレゼン(.pptx)生成。

python-pptx で 16:9・14 枚。Ocean Executive 配色。CJK フォント(ea)も明示。
"""
import os
from pptx import Presentation
from pptx.util import Inches as IN, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# ---------------- 配色 ----------------
NAVY = RGBColor(0x0E, 0x22, 0x38)
DEEP = RGBColor(0x0B, 0x5A, 0x82)
TEAL = RGBColor(0x13, 0x90, 0xA6)
GOLD = RGBColor(0xE0, 0xA4, 0x3B)
LIGHT = RGBColor(0xF4, 0xF7, 0xFB)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
INK = RGBColor(0x1B, 0x27, 0x33)
MUTE = RGBColor(0x5E, 0x6B, 0x7A)
LINE = RGBColor(0xD8, 0xE0, 0xEA)
CARDBG = RGBColor(0xFF, 0xFF, 0xFF)
NAVYCARD = RGBColor(0x16, 0x2E, 0x47)

HEAD = "Yu Gothic UI"
BODY = "Meiryo"

EMW, EMH = IN(13.333), IN(7.5)
prs = Presentation()
prs.slide_width = EMW
prs.slide_height = EMH
BLANK = prs.slide_layouts[6]


def slide():
    return prs.slides.add_slide(BLANK)


def rect(s, x, y, w, h, fill, shape=MSO_SHAPE.RECTANGLE, line=None, line_w=None, shadow=False):
    sp = s.shapes.add_shape(shape, x, y, w, h)
    sp.fill.solid()
    sp.fill.fore_color.rgb = fill
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line
        sp.line.width = line_w or Pt(1)
    sp.shadow.inherit = False
    if shadow:
        el = sp._element.spPr
        # 轻阴影
        from pptx.oxml.ns import nsmap  # noqa
    return sp


def _setfont(run, size, color, bold, font, italic=False):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name = font
    rPr = run._r.get_or_add_rPr()
    for tag in ("a:ea", "a:cs"):
        e = rPr.find(qn(tag))
        if e is None:
            e = rPr.makeelement(qn(tag), {})
            rPr.append(e)
        e.set("typeface", font)


def text(s, x, y, w, h, paras, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
         wrap=True, space_after=6, line_spacing=1.08):
    """paras: list of (string, size, color, bold[, font]) 或 dict。"""
    tb = s.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    for i, p in enumerate(paras):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        para.space_after = Pt(p.get("sa", space_after))
        para.space_before = Pt(p.get("sb", 0))
        para.line_spacing = p.get("ls", line_spacing)
        runs = p["runs"] if "runs" in p else [(p["t"], p.get("sz", 16), p.get("c", INK), p.get("b", False), p.get("f", BODY))]
        for r in runs:
            run = para.add_run()
            run.text = r[0]
            _setfont(run, r[1], r[2], r[3], r[4] if len(r) > 4 else BODY)
    return tb


def page_bg(s, color):
    rect(s, 0, 0, EMW, EMH, color)


def content_header(s, idx, title, kicker=None):
    """浅色内容页的页眉：左侧色块 + 标题。"""
    page_bg(s, LIGHT)
    rect(s, 0, 0, IN(0.22), EMH, TEAL)               # 左侧细色带(贯穿,作动机)
    # 序号圆
    c = rect(s, IN(0.62), IN(0.55), IN(0.62), IN(0.62), DEEP, MSO_SHAPE.OVAL)
    tf = c.text_frame
    tf.margin_left = 0; tf.margin_right = 0; tf.margin_top = 0; tf.margin_bottom = 0
    r = tf.paragraphs[0].add_run(); r.text = f"{idx:02d}"
    tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    _setfont(r, 18, WHITE, True, HEAD)
    if kicker:
        text(s, IN(1.45), IN(0.5), IN(10.5), IN(0.32),
             [{"t": kicker, "sz": 12, "c": TEAL, "b": True, "f": HEAD}])
        text(s, IN(1.45), IN(0.78), IN(11.2), IN(0.6),
             [{"t": title, "sz": 27, "c": INK, "b": True, "f": HEAD}])
    else:
        text(s, IN(1.45), IN(0.6), IN(11.2), IN(0.7),
             [{"t": title, "sz": 28, "c": INK, "b": True, "f": HEAD}])
    # footer
    text(s, IN(0.62), IN(7.02), IN(9), IN(0.3),
         [{"t": "BrightStar 研修アシスタント｜受託開発ケーススタディ", "sz": 9, "c": MUTE}])
    text(s, IN(11.4), IN(7.02), IN(1.3), IN(0.3),
         [{"t": "CONFIDENTIAL", "sz": 9, "c": MUTE}], align=PP_ALIGN.RIGHT)


def card(s, x, y, w, h, fill=CARDBG, line=LINE):
    return rect(s, x, y, w, h, fill, MSO_SHAPE.ROUNDED_RECTANGLE, line=line, line_w=Pt(0.75))


def chip(s, x, y, w, h, label, fill, fg=WHITE):
    sp = rect(s, x, y, w, h, fill, MSO_SHAPE.ROUNDED_RECTANGLE)
    tf = sp.text_frame
    tf.margin_left = 0; tf.margin_right = 0; tf.margin_top = 0; tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = label
    _setfont(r, 11, fg, True, HEAD)
    return sp


# =====================================================================
# 1. 表紙
# =====================================================================
s = slide()
page_bg(s, NAVY)
rect(s, 0, 0, EMW, IN(0.16), TEAL)
rect(s, 0, IN(7.34), EMW, IN(0.16), GOLD)
# 右側パネル（バランス＆ケイパビリティ）
rect(s, IN(9.25), IN(0.16), IN(4.083), IN(7.18), NAVYCARD)
rect(s, IN(9.25), IN(0.16), IN(0.1), IN(7.18), TEAL)
rect(s, IN(11.0), IN(-1.3), IN(3.6), IN(3.6), NAVY, MSO_SHAPE.OVAL)  # 微妙な奥行き
text(s, IN(9.65), IN(1.5), IN(3.4), IN(0.4),
     [{"t": "CAPABILITIES", "sz": 12, "c": GOLD, "b": True, "f": HEAD}])
caps_cover = ["AWS Serverless / IaC", "生成AI・RAG (Bedrock)", "メッセージング連携", "Web / SaaS 開発"]
yy = IN(2.15)
for cc in caps_cover:
    rect(s, IN(9.65), yy + IN(0.12), IN(0.14), IN(0.14), TEAL, MSO_SHAPE.OVAL)
    text(s, IN(9.95), yy, IN(3.1), IN(0.6), [{"t": cc, "sz": 13.5, "c": WHITE, "b": True, "f": HEAD, "ls": 1.05}])
    yy += IN(0.72)
# 左側メイン
text(s, IN(0.9), IN(1.55), IN(8.0), IN(0.4),
     [{"t": "受託開発 ケーススタディ / CASE STUDY", "sz": 13.5, "c": GOLD, "b": True, "f": HEAD}])
text(s, IN(0.9), IN(2.15), IN(8.1), IN(1.6),
     [{"t": "BrightStar", "sz": 50, "c": WHITE, "b": True, "f": HEAD, "sa": 2},
      {"t": "研修アシスタント", "sz": 40, "c": WHITE, "b": True, "f": HEAD, "sa": 6}])
text(s, IN(0.9), IN(4.35), IN(8.0), IN(1.0),
     [{"t": "サーバーレス × 生成AI で実現した", "sz": 19, "c": RGBColor(0xCA,0xDC,0xFC), "f": BODY, "sa": 2},
      {"t": "社内研修 DX", "sz": 19, "c": RGBColor(0xCA,0xDC,0xFC), "f": BODY}])
text(s, IN(0.9), IN(6.5), IN(8.0), IN(0.5),
     [{"runs": [("作成：開発チーム", 12, RGBColor(0xB9,0xC6,0xD6), False, BODY),
                ("　／　2026年6月　／　社外秘", 12, RGBColor(0x7C,0x8C,0x9E), False, BODY)]}])

# =====================================================================
# 2. エグゼクティブサマリー
# =====================================================================
s = slide()
content_header(s, 1, "エグゼクティブサマリー", "EXECUTIVE SUMMARY")
text(s, IN(0.62), IN(1.55), IN(7.1), IN(0.9),
     [{"t": "「微信で完結する社内研修アシスタント」を、サーバーレス＋生成AIでフルスクラッチ開発。受講管理・多言語対応・AI問答・自動リマインドを、固定費ほぼゼロの構成で実現しました。",
       "sz": 14.5, "c": INK, "ls": 1.18}])
# 左：要点
pts = [
    ("企画から実装・IaC・運用・ドキュメントまで一気通貫", DEEP),
    ("AWS Serverless：アイドル時コスト実質ゼロの従量課金", TEAL),
    ("生成AI(Bedrock)＋自前RAG：OpenSearch不使用でコスト最適", DEEP),
    ("データ主権：生成AIは日本リージョン内で完結", TEAL),
]
y = IN(2.75)
for t, col in pts:
    rect(s, IN(0.62), y + IN(0.07), IN(0.16), IN(0.16), col, MSO_SHAPE.OVAL)
    text(s, IN(0.95), y, IN(6.8), IN(0.5), [{"t": t, "sz": 13.5, "c": INK, "ls": 1.1}])
    y += IN(0.62)
# 右：KPI 卡片
stats = [("6", "DynamoDB テーブル"), ("3", "Lambda 関数"), ("14", "自動テスト 全合格"),
         ("2", "IaC 方式 (SAM / CDK)"), ("¥0.5", "AI 1問あたり概算"), ("日中", "多言語対応")]
gx, gy, cw, ch, gap = IN(8.0), IN(1.6), IN(2.3), IN(1.55), IN(0.22)
for i, (num, lab) in enumerate(stats):
    cx = gx + (i % 2) * (cw + gap)
    cy = gy + (i // 2) * (ch + gap)
    card(s, cx, cy, cw, ch)
    text(s, cx, cy + IN(0.2), cw, IN(0.8), [{"t": num, "sz": 34, "c": DEEP, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
    text(s, cx + IN(0.1), cy + IN(1.0), cw - IN(0.2), IN(0.5), [{"t": lab, "sz": 11, "c": MUTE}], align=PP_ALIGN.CENTER)

# =====================================================================
# 3. 背景・課題
# =====================================================================
s = slide()
content_header(s, 2, "背景と課題", "THE PROBLEM")
text(s, IN(0.62), IN(1.55), IN(12), IN(0.5),
     [{"t": "社内研修の運営は、申込・出欠・リマインド・成績管理が手作業に依存しがち。多言語チームでは負担がさらに増大します。",
       "sz": 14, "c": INK, "ls": 1.15}])
probs = [
    ("📋", "受講管理が煩雑", "申込・キャンセル・名簿・グループ分けを手作業・表計算で管理"),
    ("⏰", "連絡漏れ", "開講案内・直前リマインドの抜け漏れ、Zoomリンク共有の手間"),
    ("🌐", "多言語の壁", "日本人・中国人スタッフ混在で案内が二度手間"),
    ("📊", "成績が散在", "テスト結果・アンケートが個人に紐づかず集計困難"),
]
gx, gy, cw, ch, gap = IN(0.62), IN(2.45), IN(5.95), IN(1.85), IN(0.3)
for i, (ic, tt, ds) in enumerate(probs):
    cx = gx + (i % 2) * (cw + gap)
    cy = gy + (i // 2) * (ch + gap)
    card(s, cx, cy, cw, ch)
    text(s, cx + IN(0.3), cy + IN(0.28), IN(0.9), IN(0.7), [{"t": ic, "sz": 30, "c": INK}])
    text(s, cx + IN(1.25), cy + IN(0.28), cw - IN(1.5), IN(0.5), [{"t": tt, "sz": 16, "c": DEEP, "b": True, "f": HEAD}])
    text(s, cx + IN(1.25), cy + IN(0.78), cw - IN(1.5), IN(0.9), [{"t": ds, "sz": 12.5, "c": MUTE, "ls": 1.12}])

# =====================================================================
# 4. ソリューション概要
# =====================================================================
s = slide()
content_header(s, 3, "ソリューション概要", "SOLUTION")
text(s, IN(0.62), IN(1.55), IN(12), IN(0.7),
     [{"t": "BrightStar は、受講者が普段使う「微信(WeChat)」で完結する研修アシスタント。チャットだけで申込・確認ができ、講師は数行のコマンドで運営。Webサイトで成績・アンケートを記録します。",
       "sz": 14, "c": INK, "ls": 1.18}])
cols = [
    ("受講者", DEEP, ["言語選択→氏名登録", "講座一覧・申込・キャンセル", "次回講座/Zoom 確認", "AI問答(任意ON)"]),
    ("講師", TEAL, ["コマンドで開講・公開", "受講名簿の確認", "ランダムグループ分け", "成績エクスポート"]),
    ("Webサイト", GOLD, ["ログインコードで認証", "教材・小テスト", "課後アンケート", "成績を個人別に記録"]),
]
gx, cw, gap = IN(0.62), IN(3.95), IN(0.27)
cy = IN(2.6)
for i, (head, col, items) in enumerate(cols):
    cx = gx + i * (cw + gap)
    card(s, cx, cy, cw, IN(3.6))
    rect(s, cx, cy, cw, IN(0.7), col, MSO_SHAPE.ROUNDED_RECTANGLE)
    rect(s, cx, cy + IN(0.35), cw, IN(0.35), col)  # 方角だけ填补圆角下方
    text(s, cx, cy + IN(0.13), cw, IN(0.5), [{"t": head, "sz": 18, "c": WHITE, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
    yy = cy + IN(0.95)
    for it in items:
        rect(s, cx + IN(0.3), yy + IN(0.09), IN(0.12), IN(0.12), col, MSO_SHAPE.OVAL)
        text(s, cx + IN(0.55), yy, cw - IN(0.8), IN(0.5), [{"t": it, "sz": 13, "c": INK, "ls": 1.1}])
        yy += IN(0.62)

# =====================================================================
# 5. システムアーキテクチャ
# =====================================================================
s = slide()
content_header(s, 4, "システムアーキテクチャ", "ARCHITECTURE")
text(s, IN(0.62), IN(1.5), IN(12), IN(0.4),
     [{"t": "フルサーバーレス。固定サーバなし・従量課金・自動スケール。", "sz": 13.5, "c": MUTE}])

def node(x, y, w, h, label, sub, fill, fg=WHITE):
    card(s, x, y, w, h, fill=fill, line=fill)
    tb = s.shapes.add_textbox(x, y + IN(0.12), w, h - IN(0.2))
    tf = tb.text_frame; tf.word_wrap = True
    tf.margin_left = Pt(2); tf.margin_right = Pt(2); tf.margin_top = 0; tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = label; _setfont(r, 12.5, fg, True, HEAD)
    p2 = tf.add_paragraph(); p2.alignment = PP_ALIGN.CENTER
    r2 = p2.add_run(); r2.text = sub; _setfont(r2, 9.5, fg, False, BODY)

def arrow(x, y, w, label=None):
    a = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, x, y, w, IN(0.28))
    a.fill.solid(); a.fill.fore_color.rgb = TEAL; a.line.fill.background(); a.shadow.inherit = False
    if label:
        text(s, x - IN(0.1), y - IN(0.34), w + IN(0.2), IN(0.3), [{"t": label, "sz": 9, "c": MUTE}], align=PP_ALIGN.CENTER)

def vbar(x, y, h, color=TEAL, w=IN(0.1)):
    rect(s, x, y, w, h, color)

def darrow(cx, y, h):
    a = s.shapes.add_shape(MSO_SHAPE.DOWN_ARROW, cx - IN(0.13), y, IN(0.26), h)
    a.fill.solid(); a.fill.fore_color.rgb = TEAL; a.line.fill.background(); a.shadow.inherit = False

# 上段：入口フロー  微信 → 中継 → API GW → Lambda
row = IN(2.35)
node(IN(0.62), row, IN(2.25), IN(0.95), "微信 / 企業微信", "受講者・講師", NAVY)
arrow(IN(2.92), row + IN(0.33), IN(0.6))
node(IN(3.57), row, IN(2.35), IN(0.95), "中継サーバ", "Tailscale Funnel / 可信IP", DEEP)
arrow(IN(5.97), row + IN(0.33), IN(0.6))
node(IN(6.62), row, IN(2.0), IN(0.95), "API Gateway", "HTTP API", DEEP)
arrow(IN(8.67), row + IN(0.33), IN(0.55))
node(IN(9.27), row, IN(3.45), IN(0.95), "Lambda (Python 3.12)", "webhook / web / reminder", TEAL)
# Lambda から下段バックエンドへ分配（バス＋3本の下矢印）
vbar(IN(10.95), IN(3.3), IN(0.4))                      # Lambda 直下
rect(s, IN(3.9), IN(3.68), IN(7.1), IN(0.06), TEAL)    # 水平バス
for cx in (IN(3.95), IN(6.75), IN(9.7)):
    darrow(cx, IN(3.74), IN(0.4))
row2 = IN(4.18)
node(IN(2.65), row2, IN(2.6), IN(0.95), "DynamoDB ×6", "On-Demand・暗号化", NAVY)
node(IN(5.45), row2, IN(2.6), IN(0.95), "Amazon Bedrock", "Claude / Titan（日本境内）", GOLD, fg=NAVY)
node(IN(8.2), row2, IN(3.0), IN(0.95), "EventBridge → Reminder", "開講1時間前 自動通知", DEEP)
text(s, IN(0.62), IN(5.45), IN(12), IN(1.4),
     [{"t": "設計の勘所", "sz": 13, "c": DEEP, "b": True, "f": HEAD, "sa": 4},
      {"t": "・微信客服APIの「可信IP」制約 → 固定IP中継(Tailscale Funnel)で追加コストゼロ・ポート開放なしで解決", "sz": 12, "c": INK, "ls": 1.12},
      {"t": "・暗号(WXBizMsgCrypt)を純Python AESで自前実装 → 外部依存ゼロ、Lambda は src/ を圧縮するだけ", "sz": 12, "c": INK, "ls": 1.12},
      {"t": "・全リソースに統一タグ → コスト可視化・一括削除が容易", "sz": 12, "c": INK, "ls": 1.12}])

# =====================================================================
# 6. 主要機能
# =====================================================================
s = slide()
content_header(s, 5, "主要機能", "KEY FEATURES")
feats = [
    ("🗂️", "受講管理", "登録・申込・キャンセル・定員制御(条件付き書込み)"),
    ("🧑‍🏫", "講師運営", "開講・公開・名簿・ランダムグループ分け"),
    ("🤖", "AI問答(任意)", "「AI」ONで自由質問→RAGで回答／OFFは通常メニュー"),
    ("🌐", "多言語", "日本語/中国語、利用者ごとに記憶・切替"),
    ("⏰", "自動リマインド", "開講1時間前に申込者へ自動通知"),
    ("📝", "成績・アンケート", "個人別に記録、講師がエクスポート"),
]
gx, gy, cw, ch, gx2, gy2 = IN(0.62), IN(1.75), IN(3.95), IN(1.75), IN(0.27), IN(0.28)
for i, (ic, tt, ds) in enumerate(feats):
    cx = gx + (i % 3) * (cw + gx2)
    cy = gy + (i // 3) * (ch + gy2)
    card(s, cx, cy, cw, ch)
    rect(s, cx + IN(0.28), cy + IN(0.26), IN(0.7), IN(0.7), LIGHT, MSO_SHAPE.OVAL)
    text(s, cx + IN(0.28), cy + IN(0.34), IN(0.7), IN(0.6), [{"t": ic, "sz": 22}], align=PP_ALIGN.CENTER)
    text(s, cx + IN(1.15), cy + IN(0.3), cw - IN(1.3), IN(0.45), [{"t": tt, "sz": 15.5, "c": DEEP, "b": True, "f": HEAD}])
    text(s, cx + IN(1.15), cy + IN(0.78), cw - IN(1.35), IN(0.85), [{"t": ds, "sz": 11.5, "c": MUTE, "ls": 1.12}])

# =====================================================================
# 7. 技術的ハイライト
# =====================================================================
s = slide()
content_header(s, 6, "技術的ハイライト", "TECHNICAL HIGHLIGHTS")
text(s, IN(0.62), IN(1.55), IN(12), IN(0.4),
     [{"t": "「難所をどう解いたか」が受託開発の実力です。", "sz": 13.5, "c": MUTE}])
items = [
    ("可信IP 制約の突破", "クラウド関数の動的IPでは外部API要件を満たせない課題を、固定IP中継＋Tailscale Funnelで解決。ルータ設定・ポート開放不要、月額ゼロ。"),
    ("生成AI のコスト最適化", "OpenSearch(月$350+)を使わず、Titan埋め込み＋DynamoDB近傍探索で自前RAGを構築。従量課金・アイドル$0。"),
    ("データ主権・コンプラ", "生成は日本リージョン内 inference profile で完結。データを国外に出さない構成。"),
    ("依存ゼロ＆IaC", "暗号を純Pythonで実装し外部ライブラリ不要。SAM/CDK 両対応、14件の自動テストで品質担保。"),
]
gx, gy, cw, ch, gap = IN(0.62), IN(2.2), IN(5.95), IN(2.1), IN(0.3)
for i, (tt, ds) in enumerate(items):
    cx = gx + (i % 2) * (cw + gap)
    cy = gy + (i // 2) * (ch + gap)
    card(s, cx, cy, cw, ch)
    rect(s, cx, cy, IN(0.14), ch, GOLD, MSO_SHAPE.ROUNDED_RECTANGLE)
    text(s, cx + IN(0.4), cy + IN(0.28), cw - IN(0.7), IN(0.5), [{"t": tt, "sz": 16.5, "c": DEEP, "b": True, "f": HEAD}])
    text(s, cx + IN(0.4), cy + IN(0.82), cw - IN(0.7), IN(1.2), [{"t": ds, "sz": 12.5, "c": INK, "ls": 1.18}])

# =====================================================================
# 8. 提供価値・解決できる課題
# =====================================================================
s = slide()
content_header(s, 7, "お客様に提供できる価値", "VALUE WE DELIVER")
vals = [
    ("業務のデジタル化", "属人的・手作業の業務をチャット/Webで自動化"),
    ("低コスト運用", "従量課金・固定費最小化。アイドル時はほぼ無料"),
    ("短納期・段階提供", "小さく動かし反復。早期にPoC→本番へ"),
    ("多言語・グローバル", "日本語/中国語など多言語UIを標準対応"),
    ("生成AI活用", "問い合わせ対応・ナレッジ検索・自動応答"),
    ("セキュリティ/主権", "データ国内完結・最小権限・機密の分離管理"),
]
gx, gy, cw, ch, g1, g2 = IN(0.62), IN(1.8), IN(3.95), IN(1.78), IN(0.27), IN(0.28)
for i, (tt, ds) in enumerate(vals):
    cx = gx + (i % 3) * (cw + g1)
    cy = gy + (i // 3) * (ch + g2)
    card(s, cx, cy, cw, ch)
    rect(s, cx + IN(0.3), cy + IN(0.3), IN(0.45), IN(0.45), TEAL, MSO_SHAPE.OVAL)
    text(s, cx + IN(0.3), cy + IN(0.33), IN(0.45), IN(0.4), [{"t": "✓", "sz": 15, "c": WHITE, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
    text(s, cx + IN(0.95), cy + IN(0.3), cw - IN(1.1), IN(0.5), [{"t": tt, "sz": 15, "c": DEEP, "b": True, "f": HEAD}])
    text(s, cx + IN(0.32), cy + IN(0.95), cw - IN(0.6), IN(0.85), [{"t": ds, "sz": 12, "c": MUTE, "ls": 1.14}])

# =====================================================================
# 9. 対応可能領域（ケイパビリティ）
# =====================================================================
s = slide()
content_header(s, 8, "対応可能なプロジェクト領域", "WHAT WE CAN BUILD")
caps = [
    ("クラウドネイティブ基盤", "サーバーレス/コンテナ、IaC、DevOps、コスト最適化"),
    ("生成AI / RAG / エージェント", "チャットボット、社内ナレッジ検索、業務自動化"),
    ("メッセージング連携", "微信/企業微信、LINE、Slack、Teams 等の業務Bot"),
    ("Web / SaaS 開発", "認証付きWebアプリ、管理画面、API、マルチテナント設計"),
    ("業務自動化・データ基盤", "定期バッチ、通知、集計、ダッシュボード"),
    ("セキュリティ / コンプラ", "データ主権、最小権限、機密管理、監査対応"),
]
gx, gy, cw, ch, g1, g2 = IN(0.62), IN(1.85), IN(5.95), IN(1.55), IN(0.3), IN(0.25)
for i, (tt, ds) in enumerate(caps):
    cx = gx + (i % 2) * (cw + g1)
    cy = gy + (i // 2) * (ch + g2)
    card(s, cx, cy, cw, ch)
    rect(s, cx, cy, IN(0.14), ch, DEEP, MSO_SHAPE.ROUNDED_RECTANGLE)
    text(s, cx + IN(0.4), cy + IN(0.24), cw - IN(0.7), IN(0.5), [{"t": tt, "sz": 15.5, "c": INK, "b": True, "f": HEAD}])
    text(s, cx + IN(0.4), cy + IN(0.72), cw - IN(0.7), IN(0.7), [{"t": ds, "sz": 12, "c": MUTE, "ls": 1.12}])

# =====================================================================
# 10. AWS / Python 技術深度（2カラム）
# =====================================================================
s = slide()
content_header(s, 9, "技術スタックの深さ：AWS / Python", "TECHNICAL DEPTH")
# AWS
card(s, IN(0.62), IN(1.75), IN(5.95), IN(4.85))
rect(s, IN(0.62), IN(1.75), IN(5.95), IN(0.72), DEEP, MSO_SHAPE.ROUNDED_RECTANGLE)
rect(s, IN(0.62), IN(2.1), IN(5.95), IN(0.37), DEEP)
text(s, IN(0.62), IN(1.9), IN(5.95), IN(0.5), [{"t": "AWS でできること", "sz": 18, "c": WHITE, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
aws = [
    "Lambda / API Gateway / DynamoDB（サーバーレスAPI）",
    "Amazon Bedrock（生成AI・埋め込み・日本境内）",
    "EventBridge（定期実行）/ S3 / Secrets Manager",
    "IaC：CloudFormation・SAM・CDK(Python)",
    "IAM 最小権限・SSE暗号・Budgets でコスト管理",
    "東京リージョン中心、データ主権を考慮した設計",
]
yy = IN(2.75)
for it in aws:
    rect(s, IN(0.95), yy + IN(0.08), IN(0.12), IN(0.12), TEAL, MSO_SHAPE.OVAL)
    text(s, IN(1.2), yy, IN(5.2), IN(0.6), [{"t": it, "sz": 12.5, "c": INK, "ls": 1.1}])
    yy += IN(0.62)
# Python
card(s, IN(6.78), IN(1.75), IN(5.95), IN(4.85))
rect(s, IN(6.78), IN(1.75), IN(5.95), IN(0.72), TEAL, MSO_SHAPE.ROUNDED_RECTANGLE)
rect(s, IN(6.78), IN(2.1), IN(5.95), IN(0.37), TEAL)
text(s, IN(6.78), IN(1.9), IN(5.95), IN(0.5), [{"t": "Python でできること", "sz": 18, "c": WHITE, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
py = [
    "サーバーレス・バックエンド／業務ロジック",
    "生成AI連携・自前RAG（埋め込み＋近傍探索）",
    "暗号・プロトコル実装（依存ゼロの純Python）",
    "自動テスト（インメモリ擬似DBでE2E）",
    "IaC を Python(CDK) で記述",
    "データ処理・自動化・ドキュメント生成",
]
yy = IN(2.75)
for it in py:
    rect(s, IN(7.11), yy + IN(0.08), IN(0.12), IN(0.12), DEEP, MSO_SHAPE.OVAL)
    text(s, IN(7.36), yy, IN(5.2), IN(0.6), [{"t": it, "sz": 12.5, "c": INK, "ls": 1.1}])
    yy += IN(0.62)

# =====================================================================
# 11. SaaS 開発・設計力
# =====================================================================
s = slide()
content_header(s, 10, "SaaS プロダクト開発を見据えた設計", "SAAS-READY DESIGN")
text(s, IN(0.62), IN(1.6), IN(12), IN(0.7),
     [{"t": "BrightStar は単一組織向けデモですが、アーキテクチャは SaaS 化を前提に設計。テナント分離・従量課金・IaC 複製で、製品化/横展開が容易です。",
       "sz": 14, "c": INK, "ls": 1.18}])
saas = [
    ("マルチテナント拡張", "識別子設計とデータ分離で複数組織へ展開可能"),
    ("従量課金モデル", "利用量に比例するコスト構造＝SaaSの原価管理に好相性"),
    ("環境複製(IaC)", "SAM/CDK でステージ/顧客ごとに同一構成を即複製"),
    ("運用の自動化", "リマインド・集計・通知をマネージドで自動化"),
    ("多言語UI標準", "海外展開を見据えた i18n 設計"),
    ("ドキュメント納品", "設計/運用/利用手册(PDF)まで整備し引継ぎ容易"),
]
gx, gy, cw, ch, g1, g2 = IN(0.62), IN(2.55), IN(3.95), IN(1.75), IN(0.27), IN(0.25)
for i, (tt, ds) in enumerate(saas):
    cx = gx + (i % 3) * (cw + g1)
    cy = gy + (i // 3) * (ch + g2)
    card(s, cx, cy, cw, ch)
    text(s, cx + IN(0.3), cy + IN(0.26), cw - IN(0.6), IN(0.5), [{"t": tt, "sz": 14.5, "c": DEEP, "b": True, "f": HEAD}])
    text(s, cx + IN(0.3), cy + IN(0.78), cw - IN(0.6), IN(0.85), [{"t": ds, "sz": 11.5, "c": MUTE, "ls": 1.14}])

# =====================================================================
# 12. 受託開発としての強み
# =====================================================================
s = slide()
content_header(s, 11, "受託開発としての強み", "WHY US")
strengths = [
    ("一気通貫", "要件定義から実装・IaC・運用・ドキュメントまで一貫対応"),
    ("コスト意識", "従量課金・固定費最小。不要な高額サービスは選ばない"),
    ("検証ドリブン", "各工程で実機検証。通らなければ止めて報告する誠実さ"),
    ("納品物の充実", "ソース＋IaC＋テスト＋設計/運用/利用手册を整備"),
    ("セキュリティ", "機密はパラメータ/Secrets管理、コードに残さない"),
    ("短サイクル", "小さく早く動かし、フィードバックで磨き込む"),
]
gx, gy, cw, ch, g1, g2 = IN(0.62), IN(1.85), IN(3.95), IN(1.85), IN(0.27), IN(0.28)
for i, (tt, ds) in enumerate(strengths):
    cx = gx + (i % 3) * (cw + g1)
    cy = gy + (i // 3) * (ch + g2)
    card(s, cx, cy, cw, ch)
    n = rect(s, cx + IN(0.28), cy + IN(0.26), IN(0.55), IN(0.55), GOLD, MSO_SHAPE.OVAL)
    tf = n.text_frame; tf.margin_left=0; tf.margin_right=0; tf.margin_top=0; tf.margin_bottom=0
    tf.vertical_anchor=MSO_ANCHOR.MIDDLE
    rr = tf.paragraphs[0].add_run(); rr.text=str(i+1); tf.paragraphs[0].alignment=PP_ALIGN.CENTER
    _setfont(rr, 16, NAVY, True, HEAD)
    text(s, cx + IN(1.0), cy + IN(0.3), cw - IN(1.2), IN(0.5), [{"t": tt, "sz": 15, "c": DEEP, "b": True, "f": HEAD}])
    text(s, cx + IN(0.32), cy + IN(0.95), cw - IN(0.6), IN(0.8), [{"t": ds, "sz": 11.5, "c": MUTE, "ls": 1.14}])

# =====================================================================
# 13. 開発プロセスと納品物
# =====================================================================
s = slide()
content_header(s, 12, "進め方と納品物", "PROCESS & DELIVERABLES")
steps = [("01", "ヒアリング", "課題・要件整理"), ("02", "PoC", "小さく実証"),
         ("03", "反復実装", "各工程で検証"), ("04", "IaC化", "再現可能に"),
         ("05", "納品・運用", "文書と引継ぎ")]
gx, cw, gap = IN(0.62), IN(2.2), IN(0.32)
cy = IN(2.0)
for i, (n, tt, ds) in enumerate(steps):
    cx = gx + i * (cw + gap)
    card(s, cx, cy, cw, IN(1.85))
    text(s, cx, cy + IN(0.22), cw, IN(0.6), [{"t": n, "sz": 26, "c": TEAL, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
    text(s, cx, cy + IN(0.88), cw, IN(0.4), [{"t": tt, "sz": 14, "c": INK, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
    text(s, cx + IN(0.15), cy + IN(1.28), cw - IN(0.3), IN(0.5), [{"t": ds, "sz": 11, "c": MUTE}], align=PP_ALIGN.CENTER)
    if i < 4:
        a = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, cx + cw + IN(0.02), cy + IN(0.78), IN(0.28), IN(0.28))
        a.fill.solid(); a.fill.fore_color.rgb = GOLD; a.line.fill.background(); a.shadow.inherit=False
text(s, IN(0.62), IN(4.35), IN(12), IN(0.5),
     [{"t": "主な納品物", "sz": 15, "c": DEEP, "b": True, "f": HEAD}])
delivs = ["ソースコード(Git)", "IaC (SAM / CDK)", "自動テスト一式",
          "設計・運用ドキュメント", "利用手册(PDF)", "コスト試算・予算アラート"]
gx, cw, gap, cy = IN(0.62), IN(3.95), IN(0.27), IN(4.9)
for i, d in enumerate(delivs):
    cx = gx + (i % 3) * (cw + gap)
    yy = cy + (i // 3) * IN(0.78)
    chip_w = cw
    sp = rect(s, cx, yy, chip_w, IN(0.6), WHITE, MSO_SHAPE.ROUNDED_RECTANGLE, line=LINE, line_w=Pt(0.75))
    rect(s, cx + IN(0.22), yy + IN(0.2), IN(0.18), IN(0.18), TEAL, MSO_SHAPE.OVAL)
    text(s, cx + IN(0.55), yy + IN(0.12), cw - IN(0.7), IN(0.4), [{"t": d, "sz": 12.5, "c": INK, "b": True, "f": HEAD}])

# =====================================================================
# 14. まとめ・次の一歩
# =====================================================================
s = slide()
page_bg(s, NAVY)
rect(s, 0, 0, EMW, IN(0.16), TEAL)
rect(s, 0, IN(7.34), EMW, IN(0.16), GOLD)
text(s, IN(0.9), IN(1.0), IN(11), IN(0.4), [{"t": "SUMMARY & NEXT STEP", "sz": 14, "c": GOLD, "b": True, "f": HEAD}])
text(s, IN(0.9), IN(1.5), IN(11.5), IN(1.4),
     [{"t": "「動くものを、堅実に、無駄なく」", "sz": 34, "c": WHITE, "b": True, "f": HEAD, "sa": 8},
      {"t": "BrightStar は、当社が受託開発で提供できる総合力 —— クラウド・生成AI・連携・IaC・運用 —— を一つの形にした実例です。",
       "sz": 15, "c": RGBColor(0xCA,0xDC,0xFC), "ls": 1.2}])
nexts = [
    ("ご相談", "課題・ご要望のヒアリング（無料）"),
    ("PoC", "小規模で実証、効果と費用感を可視化"),
    ("本開発", "IaC・ドキュメント込みで堅実に納品"),
]
gx, cw, gap, cy = IN(0.9), IN(3.75), IN(0.35), IN(3.9)
for i, (tt, ds) in enumerate(nexts):
    cx = gx + i * (cw + gap)
    card(s, cx, cy, cw, IN(1.7), fill=RGBColor(0x1C, 0x3E, 0x5B), line=TEAL)
    rect(s, cx, cy, cw, IN(0.1), TEAL, MSO_SHAPE.ROUNDED_RECTANGLE)  # 上部アクセント
    text(s, cx, cy + IN(0.26), cw, IN(0.5), [{"t": f"STEP {i+1}", "sz": 12, "c": GOLD, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
    text(s, cx, cy + IN(0.62), cw, IN(0.45), [{"t": tt, "sz": 18, "c": WHITE, "b": True, "f": HEAD}], align=PP_ALIGN.CENTER)
    text(s, cx + IN(0.25), cy + IN(1.08), cw - IN(0.5), IN(0.5), [{"t": ds, "sz": 11.5, "c": RGBColor(0xB9,0xC6,0xD6), "ls": 1.1}], align=PP_ALIGN.CENTER)
text(s, IN(0.9), IN(6.2), IN(11.5), IN(0.5),
     [{"t": "お問い合わせ：開発チーム　｜　受託開発・PoC のご相談を承ります", "sz": 12.5, "c": RGBColor(0x9F,0xB4,0xCC)}])

out = os.path.join(os.path.dirname(__file__), "BrightStar_受託開発ケーススタディ.pptx")
prs.save(out)
print("saved:", out, "slides:", len(prs.slides._sldIdLst))
