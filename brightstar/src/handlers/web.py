"""课程网站登录校验 API（供 Vercel/Cloudflare 静态站调用）。

POST /web/login  {"code": "ABC12345"} → 校验微信下发的登录码
  成功: {ok:true, name, role}
  失败: {ok:false, message}
跨域开放(CORS *)，仅做登录码校验，不返回敏感信息。
"""
import json

from common import business

_CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
}


def _resp(status, body):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json", **_CORS},
        "body": json.dumps(body, ensure_ascii=False),
    }


def handler(event, context):
    method = event["requestContext"]["http"]["method"]
    if method == "OPTIONS":
        return _resp(200, {"ok": True})
    if method != "POST":
        return _resp(405, {"ok": False, "message": "method not allowed"})

    try:
        data = json.loads(event.get("body") or "{}")
    except (ValueError, TypeError):
        data = {}
    code = (data.get("code") or "").strip()
    student = business.find_by_login_code(code)
    if not student:
        return _resp(401, {"ok": False, "message": "登录码无效，请在微信发「登录码」获取"})
    return _resp(200, {
        "ok": True,
        "name": student.get("name", ""),
        "role": student.get("role", "student"),
    })
