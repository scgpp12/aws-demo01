"""LINE Webhook 入口：验签 → 解析事件 → 复用 webhook._route → reply 回复。

后端业务（注册/课程/报名/登录码/RAG 等）与企业微信完全共用；
本文件只做 LINE 平台适配（签名校验、事件归一、回复）。

LINE 后台「Verify」按钮会发一条 events 为空的 POST；验签通过即回 200。
"""
import base64
import logging

from common import line
from handlers import webhook

log = logging.getLogger()
log.setLevel(logging.INFO)


def _raw_body(event) -> bytes:
    """取原始 body 字节（签名按字节算，不能先 decode 再处理）。"""
    raw = event.get("body") or ""
    if event.get("isBase64Encoded"):
        return base64.b64decode(raw)
    return raw.encode("utf-8")


def handler(event, context):
    headers = {k.lower(): v for k, v in (event.get("headers") or {}).items()}
    signature = headers.get("x-line-signature", "")
    body_bytes = _raw_body(event)

    if not line.verify_signature(body_bytes, signature):
        return {"statusCode": 403, "body": "invalid signature"}

    for ev in line.parse_events(body_bytes.decode("utf-8")):
        try:
            reply_text = webhook._route(ev)      # 共用路由
            line.reply(ev.get("replyToken", ""), reply_text)
        except Exception:  # noqa: BLE001
            log.exception("line route error")
    # LINE 要求尽快回 200（含 Verify 的空事件）
    return {"statusCode": 200, "body": ""}
