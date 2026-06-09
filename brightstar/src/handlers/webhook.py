"""企业微信自建应用 Webhook 入口：URL 验签(GET) + 消息/事件处理(POST)。

流程（全程 AES 加密 + msg_signature 验签）：
  GET  /wechat  → 验签 + 解密 echostr → 回明文 echostr
  POST /wechat  → 取 <Encrypt> 验签 → 解密内层消息 →
       事件(enter_agent/菜单点击) | 文本(注册 / 老师命令 / 数字 / AI 意图) → 加密被动回复
"""
import base64
import json
import logging
import time

from common import bedrock, business, config, kf, teacher, wecom, wecom_crypto
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
        ev = (msg.get("event", "") or "").lower()
        if ev in ("subscribe", "enter_agent"):
            return business.start_registration(openid) if not business.get_student(openid) else business.MENU
        if ev == "click":
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


# ------------------------- 微信客服(kf) 消息处理 -------------------------
def _kf_reply_for(openid: str, text: str) -> str:
    return _route({"fromUser": openid, "msgType": "text", "content": text,
                   "event": "", "eventKey": ""})


MSG_MAX_AGE = 300  # 只处理最近 5 分钟的消息，避免回复历史积压


def handle_kf(open_kfid: str, token: str):
    """收到 kf 事件 → 拉取消息 → 逐条处理 → 经中转回复。

    幂等：按 msgid 去重；时效：跳过 5 分钟前的旧消息。调用方应已异步化。
    """
    now = int(time.time())
    cursor = kf.get_cursor(open_kfid)
    for _ in range(10):  # 最多翻 10 页，防御性上限
        resp = kf.sync_msg(token, cursor, open_kfid)
        if resp.get("errcode", 0) != 0:
            log.error("kf sync_msg failed: %s", resp)
            return
        for m in resp.get("msg_list", []):
            uid = m.get("external_userid", "")
            mtype = m.get("msgtype", "")
            is_text = mtype == "text" and m.get("origin") == 3
            is_enter = mtype == "event" and (m.get("event", {}) or {}).get("event_type") == "enter_session"
            if not uid or not (is_text or is_enter):
                continue
            if now - int(m.get("send_time", now) or now) > MSG_MAX_AGE:
                continue  # 历史积压，跳过
            if not kf.claim_msgid(m.get("msgid", "")):
                continue  # 重复（重试/并发），已处理过
            if is_text:
                reply = _kf_reply_for(uid, (m.get("text", {}) or {}).get("content", "").strip())
            else:  # enter_session
                reply = business.start_registration(uid) if not business.get_student(uid) else business.MENU
            kf.send_text(open_kfid, uid, reply)
        cursor = resp.get("next_cursor", cursor)
        kf.set_cursor(open_kfid, cursor)
        if not resp.get("has_more"):
            break


def _invoke_async(context, open_kfid: str, token: str):
    """自调用一个异步实例去处理 kf 消息，使回调本身能立刻返回 200。"""
    import boto3

    try:
        boto3.client("lambda").invoke(
            FunctionName=context.function_name,
            InvocationType="Event",  # 异步
            Payload=json.dumps({"kf_async": True, "open_kfid": open_kfid, "token": token}).encode(),
        )
    except Exception:  # noqa: BLE001
        log.exception("async self-invoke failed; 退化为同步处理")
        handle_kf(open_kfid, token)


# ------------------------------- 入口 -------------------------------
def handler(event, context):
    # 异步自调用入口：实际拉取/回复在这里做（回调已快速返回）
    if isinstance(event, dict) and event.get("kf_async"):
        handle_kf(event.get("open_kfid", ""), event.get("token", ""))
        return {"ok": True}

    method = event["requestContext"]["http"]["method"]
    qs = event.get("queryStringParameters") or {}
    msg_sig = qs.get("msg_signature", "")
    timestamp = qs.get("timestamp", "")
    nonce = qs.get("nonce", "")

    # GET：URL 验签（echostr 是密文，需验签后解密返回明文）
    if method == "GET":
        echostr = qs.get("echostr", "")
        if not wecom_crypto.verify(msg_sig, timestamp, nonce, echostr):
            return wecom.http(403, "invalid signature")
        try:
            plain, _ = wecom_crypto.decrypt(echostr)
            return wecom.http(200, plain)
        except Exception:  # noqa: BLE001
            log.exception("echostr decrypt failed")
            return wecom.http(403, "decrypt failed")

    # POST：消息处理
    try:
        encrypt = wecom.extract_encrypt(_body(event))
        if not wecom_crypto.verify(msg_sig, timestamp, nonce, encrypt):
            return wecom.http(403, "invalid signature")
        plain_xml, _ = wecom_crypto.decrypt(encrypt)
        msg = wecom.parse_message(plain_xml)

        # 微信客服事件：异步去拉取/回复，回调本身立刻回空 200（避免企业微信超时重试）
        if msg["msgType"] == "event" and msg.get("event") == "kf_msg_or_event":
            _invoke_async(context, msg.get("openKfId", ""), msg.get("kfToken", ""))
            return wecom.http(200, "")

        # 自建应用消息：被动加密回复
        reply = _route(msg)
        envelope = wecom.build_encrypted_reply(msg["fromUser"], config.WECOM_CORP_ID, reply)
        return wecom.xml_resp(envelope)
    except Exception:  # noqa: BLE001
        log.exception("webhook error")
        # 出错回空串 200，企业微信不展示也不重试到崩
        return wecom.http(200, "")
