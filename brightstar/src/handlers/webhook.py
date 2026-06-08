"""微信 Webhook 入口：URL 验签(GET) + 消息/事件处理(POST)。

流程：
  GET  /wechat  → 微信服务器验签，回 echostr
  POST /wechat  → 验签 → 解析消息 →
       事件(subscribe/菜单点击) | 文本(注册流程 / 老师命令 / 数字快捷 / AI 意图) → 被动回复 XML
"""
import base64
import logging

from common import bedrock, business, teacher, wechat
from common.auth import is_teacher

log = logging.getLogger()
log.setLevel(logging.INFO)

# 菜单 key → 学员意图
MENU_KEY_TO_INTENT = {
    "MENU_COURSES": "list_courses",
    "MENU_MY": "my_courses",
    "MENU_NEXT": "next_class",
}

TEACHER_CMDS = ("建课", "发布", "删课", "改课", "学员列表", "名单", "分组", "老师帮助")


def _body(event) -> str:
    raw = event.get("body") or ""
    if event.get("isBase64Encoded"):
        raw = base64.b64decode(raw).decode("utf-8")
    return raw


# ------------------------------- 路由 -------------------------------
def _dispatch_student(openid: str, intent: str, params: dict) -> str:
    course = (params or {}).get("course", "")
    if intent == "list_courses":
        return business.list_courses()
    if intent == "my_courses":
        return business.my_courses(openid)
    if intent == "next_class":
        return business.next_class(openid)
    if intent == "enroll":
        return business.enroll(openid, course)
    if intent == "cancel":
        return business.cancel(openid, course)
    if intent == "register":
        return "你已经注册过啦～\n\n" + business.MENU
    return business.MENU  # help / 未识别 → 回菜单兜底


def _route(msg: dict) -> str:
    openid = msg["fromUser"]

    # ---- 事件 ----
    if msg["msgType"] == "event":
        ev = msg.get("event", "")
        if ev == "subscribe":
            return business.start_registration(openid) if not business.get_student(openid) else business.MENU
        if ev == "CLICK":
            intent = MENU_KEY_TO_INTENT.get(msg.get("eventKey", ""), "help")
            return _dispatch_student(openid, intent, {})
        return business.MENU

    # ---- 非文本 ----
    if msg["msgType"] != "text":
        return "目前只支持文字消息哦～\n\n" + business.MENU

    text = msg["content"]
    is_tcmd = any(text.startswith(c) for c in TEACHER_CMDS)

    # ---- 老师命令（白名单）：先于注册流程，老师无需走学员注册 ----
    if is_tcmd and is_teacher(openid):
        return teacher.handle(text)

    student = business.get_student(openid)

    # ---- 注册流程 ----
    if not student:
        return business.start_registration(openid)
    if student.get("status") == "awaiting_name":
        return business.complete_registration(openid, text)

    # ---- 老师命令但非老师（已注册学员）----
    if is_tcmd:
        return "该指令仅老师可用。"

    # ---- 数字快捷 ----
    if text in business.NUM_TO_INTENT:
        return _dispatch_student(openid, business.NUM_TO_INTENT[text], {})

    # ---- AI 意图解析（自由打字）----
    parsed = bedrock.parse_intent(text)
    return _dispatch_student(openid, parsed["intent"], parsed["params"])


# ------------------------------- 入口 -------------------------------
def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    qs = event.get("queryStringParameters") or {}
    signature = qs.get("signature", "")
    timestamp = qs.get("timestamp", "")
    nonce = qs.get("nonce", "")

    # GET：URL 验签
    if method == "GET":
        if wechat.verify_signature(signature, timestamp, nonce):
            return wechat.http(200, qs.get("echostr", ""))
        return wechat.http(403, "invalid signature")

    # POST：消息处理
    if not wechat.verify_signature(signature, timestamp, nonce):
        return wechat.http(403, "invalid signature")
    try:
        msg = wechat.parse_message(_body(event))
        reply = _route(msg)
        xml = wechat.build_text_reply(msg["fromUser"], msg["toUser"], reply)
        return wechat.text_xml(xml)
    except Exception:  # noqa: BLE001
        log.exception("webhook error")
        # 微信要求 200，否则会重试；回 success 让其不重试
        return wechat.http(200, "success")
