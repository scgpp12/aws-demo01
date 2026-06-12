"""把演示用知识文档向量化后写入 KnowledgeTable（供 RAG 答疑测试用）。

本地运行（用你的 AWS 凭证，东京区）：
    cd brightstar
    AWS_DEFAULT_REGION=ap-northeast-1 PYTHONUTF8=1 python tools/seed_knowledge.py

文档为中日双语（Titan v2 多语种向量，一条即可匹配中/日提问；
生成时按学员语言回答）。内容与系统真实行为一致，便于验证 RAG 是否答对。
重复运行=覆盖（同 docId）。
"""
import os
import sys

os.environ.setdefault("AWS_DEFAULT_REGION", "ap-northeast-1")
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from common import db, rag  # noqa: E402

DOCS = [
    {
        "docId": "faq-enroll",
        "title": "如何报名课程 / 申込方法",
        "text": (
            "报名：直接发「报名 课程名」，或回复数字 1 查看课程列表再报名。"
            "报名成功会显示上课时间和 Zoom 链接。\n"
            "申込：「申込 講座名」と送るか、番号 1 で講座一覧を見て申し込みます。"
            "申込完了後に日時と Zoom リンクが表示されます。"
        ),
    },
    {
        "docId": "faq-cancel",
        "title": "取消报名 / キャンセル規定",
        "text": (
            "取消：发「取消 课程名」。注意开课前 2 小时之后无法取消。\n"
            "キャンセル：「キャンセル 講座名」。開講 2 時間前を過ぎるとキャンセルできません。"
        ),
    },
    {
        "docId": "faq-logincode",
        "title": "网页登录码与课程网站 / ログインコードとサイト",
        "text": (
            "在微信里发「登录码」，会得到一个 8 位登录码，有效期 7 天，过期再发一次即可。"
            "在课程网站输入登录码登录，可看讲义、做测验和课后问卷。\n"
            "「ログインコード」と送ると 8 桁のコード（有効期限 7 日）が届きます。"
            "講座サイトでコードを入力すると、教材・小テスト・アンケートが利用できます。"
        ),
    },
    {
        "docId": "faq-zoom",
        "title": "上课方式 / 受講方法（Zoom）",
        "text": (
            "课程通过 Zoom 在线进行。报名后发「下节课」或回复数字 3 可查看最近一节课的"
            "时间和 Zoom 链接。\n"
            "講座は Zoom でオンライン実施。申込後「次の講座」または番号 3 で、"
            "直近の講座の日時と Zoom リンクを確認できます。"
        ),
    },
    {
        "docId": "faq-grade-survey",
        "title": "成绩与课后问卷 / 成績とアンケート",
        "text": (
            "测验成绩和课后问卷都按学员本人记录。登录课程网站后即可做测验和问卷，"
            "结果会计入你的个人记录，老师可以导出。\n"
            "小テストの成績とアンケートは受講者ごとに記録されます。"
            "サイトにログインして回答すると個人の記録に反映され、講師が出力できます。"
        ),
    },
    {
        "docId": "faq-language",
        "title": "切换语言 / 言語切替",
        "text": (
            "默认日语，可切中文。发「语言」查看选择，或直接发「中文」「日本語」切换。\n"
            "既定は日本語、中国語に切替可。「言語」で選択肢を表示、"
            "または「中文」「日本語」と送れば切り替わります。"
        ),
    },
    {
        "docId": "course-s3",
        "title": "课程内容样例：Amazon S3 / Amazon S3とは",
        "text": (
            "Amazon S3 是 AWS 的对象存储服务，像一个「永远装不满的云端储物柜」，"
            "用来存放图片、视频、备份等文件，按存储量和访问付费，非常耐久。\n"
            "Amazon S3 は AWS のオブジェクトストレージで、"
            "「いっぱいにならないクラウドの収納庫」のようなもの。画像・動画・"
            "バックアップ等を保存し、容量とアクセスに応じて課金、非常に高耐久です。"
        ),
    },
    {
        "docId": "faq-help",
        "title": "遇到问题怎么办 / 困ったとき",
        "text": (
            "随时发「菜单」查看所有功能。要找老师可在群里联系。开了「AI」后可以自由提问，"
            "发「退出AI」回到普通菜单模式。\n"
            "いつでも「メニュー」で全機能を確認できます。講師へはグループで連絡を。"
            "「AI」をオンにすると自由に質問でき、「AI終了」で通常モードに戻ります。"
        ),
    },
]


def main():
    table = db.knowledge()
    for d in DOCS:
        vec = rag.embed(d["title"] + "\n" + d["text"])
        table.put_item(
            Item={
                "docId": d["docId"],
                "chunkId": "0",
                "title": d["title"],
                "text": d["text"],
                "vec": rag.pack_vec(vec),
            }
        )
        print("seeded:", d["docId"], "(dim", len(vec), ")")
    print(f"\nOK: {len(DOCS)} 篇演示文档已写入 KnowledgeTable。")


if __name__ == "__main__":
    main()
