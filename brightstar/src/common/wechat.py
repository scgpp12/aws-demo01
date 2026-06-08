"""微信公众号接入：Webhook 验签、消息解析、被动回复 XML、客服消息(stub)。

⚠️ DEMO 说明 ⚠️
本次为 demo，未提供微信公众号凭证。
- 验签用环境变量 WECHAT_TOKEN（上线在公众平台「服务器配置」里填同一个 Token）。
- 回复采用【被动回复 XML】（同步在 HTTP 响应里返回，无需 access_token，最适合 demo）。
- 主动「客服消息接口」需 appid/appsecret 换 access_token —— 已留 send_customer_message() 空壳。
"""
import hashlib
import time
import xml.etree.ElementTree as ET

from . import config


# ------------------------------- 验签 -------------------------------
def verify_signature(signature: str, timestamp: str, nonce: str) -> bool:
    """微信签名校验：sort([token,timestamp,nonce]) -> sha1 -> 比对。"""
    if not signature:
        return False
    token = config.WECHAT_TOKEN
    arr = sorted([token, timestamp or "", nonce or ""])
    sha1 = hashlib.sha1("".join(arr).encode("utf-8")).hexdigest()
    return sha1 == signature


# ----------------------------- 消息解析 -----------------------------
def parse_message(xml_body: str) -> dict:
    """解析微信推送的 XML，返回统一 dict。"""
    root = ET.fromstring(xml_body)

    def g(tag):
        el = root.find(tag)
        return el.text if el is not None and el.text is not None else ""

    return {
        "fromUser": g("FromUserName"),   # openid
        "toUser": g("ToUserName"),       # 公众号原始ID
        "msgType": g("MsgType"),         # text | event | ...
        "content": (g("Content") or "").strip(),
        "event": g("Event"),             # subscribe | CLICK | VIEW ...
        "eventKey": g("EventKey"),       # 菜单 key
    }


# ----------------------------- 被动回复 -----------------------------
def build_text_reply(to_openid: str, from_account: str, content: str) -> str:
    """构造被动回复文本 XML。"""
    return (
        "<xml>"
        f"<ToUserName><![CDATA[{to_openid}]]></ToUserName>"
        f"<FromUserName><![CDATA[{from_account}]]></FromUserName>"
        f"<CreateTime>{int(time.time())}</CreateTime>"
        "<MsgType><![CDATA[text]]></MsgType>"
        f"<Content><![CDATA[{content}]]></Content>"
        "</xml>"
    )


# ----------------------------- HTTP 响应 -----------------------------
def http(status: int, body: str, content_type: str = "text/plain; charset=utf-8") -> dict:
    return {
        "statusCode": status,
        "headers": {"Content-Type": content_type},
        "body": body,
    }


def text_xml(body: str) -> dict:
    return http(200, body, "application/xml; charset=utf-8")


# --------------------- 客服消息接口（主动推送，stub） ---------------------
def send_customer_message(openid: str, content: str) -> dict:
    """主动给用户发消息（demo 空壳）。

    真实实现：
      1) 用 appid/appsecret 调 /cgi-bin/token 拿 access_token（建议缓存）
      2) POST /cgi-bin/message/custom/send
         {"touser": openid, "msgtype":"text", "text":{"content": content}}
    """
    return {"stub": True, "openid": openid, "content": content}
