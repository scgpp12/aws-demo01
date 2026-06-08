"""对【已部署的真实 AWS 接口】做端到端验证（模拟微信公众号请求）。

用法：python tests/live_check.py <webhook_url> <token>
"""
import hashlib
import re
import sys
import urllib.parse
import urllib.request
import uuid

URL = sys.argv[1]
TOKEN = sys.argv[2]
RUN = uuid.uuid4().hex[:6]  # 每次运行用唯一后缀，避免真实表里的历史数据干扰
TS, NONCE = "1700000000", "abcd1234"
SIG = hashlib.sha1("".join(sorted([TOKEN, TS, NONCE])).encode()).hexdigest()
Q = f"signature={SIG}&timestamp={TS}&nonce={NONCE}"


def get_verify(echostr="HELLO_WECHAT"):
    url = f"{URL}?{Q}&echostr={echostr}"
    with urllib.request.urlopen(url, timeout=15) as r:
        return r.read().decode()


def post(openid, text):
    xml = (
        f"<xml><ToUserName><![CDATA[gh_demo]]></ToUserName>"
        f"<FromUserName><![CDATA[{openid}]]></FromUserName>"
        f"<MsgType><![CDATA[text]]></MsgType><Content><![CDATA[{text}]]></Content></xml>"
    )
    req = urllib.request.Request(
        f"{URL}?{Q}", data=xml.encode("utf-8"),
        headers={"Content-Type": "application/xml"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        body = r.read().decode()
    m = re.search(r"<Content><!\[CDATA\[(.*?)\]\]></Content>", body, re.S)
    return m.group(1) if m else body


def reg(openid, name):
    post(openid, "你好")
    return post(openid, name)


def main():
    S = f"oS_{RUN}"            # 唯一学员
    T = "oTEST_TEACHER"        # 必须是白名单里的老师 openid
    course = f"云课程_{RUN}"    # 唯一课程名，避免与历史数据重名

    # 1) GET 验签
    echo = get_verify("ABC12345")
    assert echo == "ABC12345", f"验签失败: {echo!r}"
    print("[1] GET 验签 OK ->", echo)

    # 2) 学员注册
    r = reg(S, "云端张三")
    assert "注册成功" in r, r
    print("[2] 注册 OK ->", r.split(chr(10))[0])

    # 3) 老师建课 + 发布(Zoom 桩)；老师走白名单，无需注册
    r = post(T, f"建课 {course}|2026-12-01 14:00|60|2|压测")
    assert "已创建草稿" in r, r
    r = post(T, f"发布 {course}")
    assert "已发布" in r, r
    print("[3] 老师建课+发布 OK ->", r.split(chr(10))[0])

    # 4) 学员列课 + 报名 + 下节课
    r = post(S, "有哪些课")
    assert course in r, r
    r = post(S, f"报名 {course}")
    assert "报名成功" in r, r
    print("[4] 列课+报名 OK ->", r.split(chr(10))[0])
    r = post(S, "下节课")
    assert course in r and "JST" in r, r
    print("[5] 下节课 OK ->", r.replace(chr(10), " | "))

    # 6) 满员拒绝（容量=2：再来两人）
    r = reg(f"oSb_{RUN}", "B"); r = post(f"oSb_{RUN}", f"报名 {course}"); assert "报名成功" in r, r
    r = reg(f"oSc_{RUN}", "C"); r = post(f"oSc_{RUN}", f"报名 {course}"); assert "名额已满" in r, r
    print("[6] 条件容量满员拒绝 OK ->", r)

    # 7) 老师名单 + 分组
    r = post(T, f"名单 {course}")
    assert "报名名单（2）" in r, r
    r = post(T, f"分组 {course}|组数=2")
    assert "随机分组（2 组）" in r, r
    print("[7] 名单+分组 OK")

    print("\n[OK] LIVE AWS 全链路验证通过")


if __name__ == "__main__":
    main()
