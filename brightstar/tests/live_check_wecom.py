"""对【已部署的真实接口】做企业微信加密链路验证（自己加密模拟企业微信）。

用法：
  WECOM_CORP_ID=.. WECOM_TOKEN=.. WECOM_AES_KEY=.. python tests/live_check_wecom.py <url>
"""
import os
import re
import sys
import time
import urllib.request
import uuid
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from common import wecom_crypto  # noqa: E402

URL = sys.argv[1]
CORP = os.environ["WECOM_CORP_ID"]
RUN = uuid.uuid4().hex[:6]


def _q(ts, nonce, encrypt):
    sig = wecom_crypto.msg_signature(ts, nonce, encrypt)
    return f"msg_signature={sig}&timestamp={ts}&nonce={nonce}"


def get_verify():
    echo = f"echo_{RUN}"
    enc = wecom_crypto.encrypt(echo, CORP)
    ts, nonce = str(int(time.time())), "n" + RUN
    from urllib.parse import quote
    url = f"{URL}?{_q(ts, nonce, enc)}&echostr={quote(enc)}"
    with urllib.request.urlopen(url, timeout=15) as r:
        return r.read().decode(), echo


def post(userid, text):
    inner = (
        f"<xml><ToUserName><![CDATA[{CORP}]]></ToUserName>"
        f"<FromUserName><![CDATA[{userid}]]></FromUserName>"
        f"<CreateTime>{int(time.time())}</CreateTime>"
        f"<MsgType><![CDATA[text]]></MsgType><Content><![CDATA[{text}]]></Content>"
        f"<AgentID>1000002</AgentID></xml>"
    )
    enc = wecom_crypto.encrypt(inner, CORP)
    body = f"<xml><ToUserName><![CDATA[{CORP}]]></ToUserName><Encrypt><![CDATA[{enc}]]></Encrypt></xml>"
    ts, nonce = str(int(time.time())), "n" + uuid.uuid4().hex[:6]
    req = urllib.request.Request(
        f"{URL}?{_q(ts, nonce, enc)}", data=body.encode("utf-8"),
        headers={"Content-Type": "application/xml"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        resp = r.read().decode()
    if not resp.strip():
        return "(空回复)"
    out_enc = ET.fromstring(resp).find("Encrypt").text
    plain, _ = wecom_crypto.decrypt(out_enc)
    m = re.search(r"<Content><!\[CDATA\[(.*?)\]\]></Content>", plain, re.S)
    return m.group(1) if m else plain


def reg(uid, name):
    post(uid, "你好")
    return post(uid, name)


def main():
    S, T = f"stu_{RUN}", "TeacherTest"
    course = f"客服课_{RUN}"

    body, echo = get_verify()
    assert body == echo, f"GET 验签/解密失败: got {body!r} want {echo!r}"
    print("[1] GET 验签+echostr 解密 OK ->", body)

    r = reg(S, "客服张三")
    assert "注册成功" in r, r
    print("[2] 注册 OK ->", r.split(chr(10))[0])

    r = post(T, f"建课 {course}|2026-12-09 14:00|60|2|压测")
    assert "已创建草稿" in r, r
    r = post(T, f"发布 {course}")
    assert "已发布" in r, r
    print("[3] 老师建课+发布 OK ->", r.split(chr(10))[0])

    r = post(S, "有哪些课")
    assert course in r, r
    r = post(S, f"报名 {course}")
    assert "报名成功" in r, r
    print("[4] 列课+报名 OK ->", r.split(chr(10))[0])

    r = post(S, "下节课")
    assert course in r and "JST" in r, r
    print("[5] 下节课 OK ->", r.replace(chr(10), " | "))

    print("\n[OK] 企业微信加密链路 LIVE 验证通过")


if __name__ == "__main__":
    main()
