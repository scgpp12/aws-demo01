"""端到端流程测试：用内存 DynamoDB 假实现，跑通微信对话全流程。

覆盖：注册流程 → 老师建课/发布(Zoom 桩) → 学员列课/报名/容量/下节课/取消 → 随机分组。
运行：python tests/test_flow.py
"""
import os
import re
import sys

# 环境：关闭 Bedrock(走关键词) 与 Zoom(走桩)，老师白名单
os.environ.update(
    {
        "WECHAT_TOKEN": "demo_tok",
        "BEDROCK_ENABLED": "false",
        "ZOOM_ENABLED": "false",
        "TEACHER_OPENIDS": "oTEACHER",
        "STUDENTS_TABLE": "t-students",
        "COURSES_TABLE": "t-courses",
        "ENROLLMENTS_TABLE": "t-enrollments",
        "GROUPS_TABLE": "t-groups",
    }
)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


# --------------------------- 内存 DynamoDB 假实现 ---------------------------
class FakeTable:
    def __init__(self, hk, rk=None):
        self.hk, self.rk = hk, rk
        self.items = {}

    def _key(self, d):
        return (d[self.hk], d[self.rk]) if self.rk else (d[self.hk],)

    def get_item(self, Key):
        it = self.items.get(self._key(Key))
        return {"Item": dict(it)} if it else {}

    def put_item(self, Item):
        self.items[self._key(Item)] = dict(Item)

    def delete_item(self, Key):
        self.items.pop(self._key(Key), None)

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues=None,
                    ExpressionAttributeNames=None, ConditionExpression=None):
        vals = ExpressionAttributeValues or {}
        names = ExpressionAttributeNames or {}
        k = self._key(Key)
        it = self.items.setdefault(k, dict(Key))
        # 条件检查
        if ConditionExpression:
            if not _eval_cond(ConditionExpression, it, vals, names):
                from botocore.exceptions import ClientError
                raise ClientError(
                    {"Error": {"Code": "ConditionalCheckFailedException", "Message": "cond"}},
                    "UpdateItem",
                )
        body = UpdateExpression[UpdateExpression.upper().index("SET") + 3:]
        for clause in _split_top(body):
            lhs, rhs = clause.split("=", 1)
            field = names.get(lhs.strip(), lhs.strip())
            it[field] = _eval_rhs(rhs.strip(), it, vals, names)

    def query(self, KeyConditionExpression=None, IndexName=None, **kw):
        expr = KeyConditionExpression.get_expression()
        attr = expr["values"][0].name
        val = expr["values"][1]
        return {"Items": [dict(v) for v in self.items.values() if v.get(attr) == val]}

    def scan(self, **kw):
        return {"Items": [dict(v) for v in self.items.values()]}

    def batch_writer(self):
        table = self

        class BW:
            def __enter__(self):
                return self

            def __exit__(self, *a):
                return False

            def put_item(self, Item):
                table.put_item(Item)

            def delete_item(self, Key):
                table.delete_item(Key)

        return BW()


def _split_top(s):
    return [c for c in s.split(",")]


def _eval_rhs(rhs, item, vals, names):
    # 形如 ":v"、"field + :one"、"field - :one"
    m = re.match(r"^(\S+)\s*([+\-])\s*(\S+)$", rhs)
    if m:
        a, op, b = m.groups()
        av = item.get(names.get(a, a), 0) if not a.startswith(":") else vals[a]
        bv = vals[b] if b.startswith(":") else item.get(names.get(b, b), 0)
        return av + bv if op == "+" else av - bv
    return vals[rhs] if rhs.startswith(":") else item.get(names.get(rhs, rhs))


def _eval_cond(cond, item, vals, names=None):
    # 支持 "enrolledCount < #cap" 与 "enrolledCount > :zero"（含名称别名）
    names = names or {}
    m = re.match(r"^\s*(\S+)\s*([<>])\s*(\S+)\s*$", cond)
    a, op, b = m.groups()

    def resolve(x):
        if x.startswith(":"):
            return vals[x]
        return item.get(names.get(x, x), 0)

    return resolve(a) < resolve(b) if op == "<" else resolve(a) > resolve(b)


# --------------------------- 注入假表 ---------------------------
from common import db  # noqa: E402

_T = {
    "t-students": FakeTable("openid"),
    "t-courses": FakeTable("courseId"),
    "t-enrollments": FakeTable("openid", "courseId"),
    "t-groups": FakeTable("courseId", "groupId"),
}
db.students = lambda: _T["t-students"]
db.courses = lambda: _T["t-courses"]
db.enrollments = lambda: _T["t-enrollments"]
db.groups = lambda: _T["t-groups"]

from handlers import webhook  # noqa: E402


def say(openid, text):
    """模拟一条微信文本消息，返回 agent 的回复正文。"""
    xml = (
        f"<xml><ToUserName><![CDATA[gh]]></ToUserName>"
        f"<FromUserName><![CDATA[{openid}]]></FromUserName>"
        f"<MsgType><![CDATA[text]]></MsgType><Content><![CDATA[{text}]]></Content></xml>"
    )
    msg = webhook.wecom.parse_message(xml)
    return webhook._route(msg)


def register(openid, name):
    """新用户两步注册：首条消息触发提示，第二条提供姓名。"""
    say(openid, "你好")        # 触发「请回复姓名」
    return say(openid, name)   # 完成注册


# --------------------------------- 用例 ---------------------------------
def main():
    S, T = "oSTUDENT", "oTEACHER"

    # 1) 学员注册流程
    r = say(S, "你好")
    assert "请回复你的【姓名】" in r, r
    r = say(S, "张三")
    assert "注册成功，张三" in r, r
    print("[1] 注册流程 OK")

    # 2) 老师注册 + 建课 + 发布(Zoom 桩)
    register(T, "李老师")  # 老师两步注册
    r = say(T, "建课 Python入门|2026-09-10 14:00|90|2|零基础")
    assert "已创建草稿" in r, r
    r = say(T, "发布 Python入门")
    assert "已发布" in r and "demo：模拟 Zoom" in r, r
    print("[2] 老师建课+发布(Zoom桩) OK")

    # 3) 学员列课 + 报名 + 下节课
    r = say(S, "有哪些课")
    assert "Python入门" in r and "余 2 位" in r, r
    r = say(S, "报名 Python入门")
    assert "报名成功" in r and "zoom.example.com" in r.lower(), r
    r = say(S, "我下节课几点")
    assert "Python入门" in r and "JST" in r, r
    print("[3] 列课+报名+下节课 OK")

    # 4) 容量并发：第 2 人占满，第 3 人被拒（容量=2）
    register("oS2", "李四")
    r = say("oS2", "报名 Python入门")
    assert "报名成功" in r, r
    register("oS3", "王五")
    r = say("oS3", "报名 Python入门")
    assert "名额已满" in r, r
    print("[4] 条件容量(满员拒绝) OK")

    # 5) 老师查名单 + 随机分组
    r = say(T, "名单 Python入门")
    assert "报名名单（2）" in r, r
    r = say(T, "分组 Python入门|组数=2")
    assert "随机分组（2 组）" in r, r
    print("[5] 名单+随机分组 OK")

    # 6) 退课
    r = say(S, "取消 Python入门")
    assert "已取消报名" in r, r
    print("[6] 退课 OK")

    # 7) 非老师发老师命令被拒
    r = say(S, "建课 X|2026-09-10 14:00|60|10|x")
    assert "仅老师可用" in r, r
    print("[7] 老师命令鉴权 OK")

    # 8) 微信客服(kf) 拉取→处理→回复 闭环（mock 中转）
    from common import kf as kfmod
    captured = []
    kfmod.send_text = lambda okf, uid, text: captured.append((uid, text)) or {"errcode": 0}
    pages = iter([
        {"errcode": 0, "has_more": 0, "next_cursor": "c1", "msg_list": [
            {"external_userid": "wmKF1", "msgtype": "event", "origin": 4,
             "event": {"event_type": "enter_session"}}]},
        {"errcode": 0, "has_more": 0, "next_cursor": "c2", "msg_list": [
            {"external_userid": "wmKF1", "msgtype": "text", "origin": 3,
             "text": {"content": "客服李四"}}]},
        {"errcode": 0, "has_more": 0, "next_cursor": "c3", "msg_list": [
            {"external_userid": "wmKF1", "msgtype": "text", "origin": 3,
             "text": {"content": "有哪些课"}}]},
    ])
    kfmod.sync_msg = lambda token, cursor, okf, limit=100: next(pages)
    OKF = "wkJRdemo"
    webhook.handle_kf(OKF, "TK")   # enter_session → 注册提示
    webhook.handle_kf(OKF, "TK")   # "客服李四" → 注册成功
    webhook.handle_kf(OKF, "TK")   # "有哪些课" → 列课
    assert any("请回复你的【姓名】" in t for _, t in captured), captured
    assert any("注册成功，客服李四" in t for _, t in captured), captured
    assert any("Python入门" in t for _, t in captured), captured
    assert kfmod.get_cursor(OKF) == "c3"
    print("[8] 微信客服(kf) 拉取→处理→回复 OK")

    print("\n[OK] ALL FLOW TESTS PASSED")


if __name__ == "__main__":
    main()
