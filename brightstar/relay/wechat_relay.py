"""WeChat Work message relay (跑在固定可信IP的服务器上).

Lambda → 本服务(POST /kf/xxx 或 / ) → 企业微信 qyapi。
优化点：复用一个 requests.Session（HTTP keep-alive + 连接池），
避免每次调用都重做 TCP+TLS 握手（实测每次省 ~0.46s）。
部署到 /opt/wechat_relay.py，由 systemd wechat-relay.service 托管。
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
import json
import logging
import threading
import time

import requests
from requests.adapters import HTTPAdapter

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)

# 复用连接：keep-alive + 连接池，跨请求重用同一条到 qyapi 的 TLS 连接
_session = requests.Session()
_adapter = HTTPAdapter(pool_connections=4, pool_maxsize=8, max_retries=0)
_session.mount("https://", _adapter)
_session.headers.update({"Connection": "keep-alive"})

_token_cache = {"token": "", "expires_at": 0}
_token_lock = threading.Lock()
_last_creds = {"corp_id": "", "secret": ""}  # 供保活线程刷新 token 用

WX = "https://qyapi.weixin.qq.com/cgi-bin"


def _keep_warm():
    """每 40 秒 ping 一次企业微信，保持到 qyapi 的 TLS 长连接不被空闲回收，
    让偶发请求也走热连接(~0.34s)而非冷握手(~1.2s)。"""
    while True:
        time.sleep(40)
        try:
            cid, sec = _last_creds["corp_id"], _last_creds["secret"]
            if not cid:
                continue
            tok = get_access_token(cid, sec)
            if tok:
                _session.get(f"{WX}/kf/account/list?access_token={tok}", timeout=8)
        except Exception:  # noqa: BLE001
            pass


def get_access_token(corp_id, secret):
    _last_creds["corp_id"], _last_creds["secret"] = corp_id, secret
    with _token_lock:
        now = time.time()
        if _token_cache["token"] and now < _token_cache["expires_at"] - 60:
            return _token_cache["token"]
        r = _session.get(f"{WX}/gettoken",
                         params={"corpid": corp_id, "corpsecret": secret}, timeout=10)
        data = r.json()
        if data.get("errcode", 0) != 0:
            logger.error("gettoken failed: %s", data)
            return ""
        _token_cache["token"] = data["access_token"]
        _token_cache["expires_at"] = now + data.get("expires_in", 7200)
        logger.info("access_token refreshed, expires_in=%s", data.get("expires_in"))
        return _token_cache["token"]


class RelayHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        t0 = time.time()
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            return self._reply(400, {"error": "invalid json"})

        path = self.path
        if path.startswith("/kf/"):
            return self._handle_kf_api(path, payload, t0)

        corp_id = payload.get("corp_id", "")
        secret = payload.get("secret", "")
        agent_id = payload.get("agent_id", "")
        to_user = payload.get("to_user", "")
        to_party = payload.get("to_party", "")
        chat_id = payload.get("chat_id", "")
        content = payload.get("content", "")
        if not corp_id or not secret or not content:
            return self._reply(400, {"error": "missing corp_id, secret, or content"})

        token = get_access_token(corp_id, secret)
        if not token:
            return self._reply(500, {"error": "failed to get access_token"})

        if chat_id:
            msg = {"chatid": chat_id, "msgtype": "text", "text": {"content": content}, "safe": 0}
            url = f"{WX}/appchat/send?access_token={token}"
        else:
            msg = {"msgtype": "text", "agentid": int(agent_id), "text": {"content": content}}
            if to_user:
                msg["touser"] = to_user
            if to_party:
                msg["toparty"] = to_party
            url = f"{WX}/message/send?access_token={token}"

        result = self._post_with_retry(url, msg, corp_id, secret)
        logger.info("send done in %.0fms: %s", (time.time() - t0) * 1000, result.get("errcode"))
        self._reply(200, result)

    def _handle_kf_api(self, path, payload, t0):
        corp_id = payload.pop("_corp_id", "")
        secret = payload.pop("_secret", "")
        method = payload.pop("_method", "POST")
        if not corp_id or not secret:
            return self._reply(400, {"error": "missing _corp_id or _secret"})
        token = get_access_token(corp_id, secret)
        if not token:
            return self._reply(500, {"error": "failed to get access_token"})

        wx_url = f"{WX}{path}?access_token={token}"
        try:
            r = _session.get(wx_url, timeout=10) if method == "GET" else _session.post(wx_url, json=payload, timeout=10)
            result = r.json()
            if result.get("errcode") == 42001:  # token 过期重试
                _token_cache["token"] = ""
                token = get_access_token(corp_id, secret)
                wx_url = f"{WX}{path}?access_token={token}"
                r = _session.get(wx_url, timeout=10) if method == "GET" else _session.post(wx_url, json=payload, timeout=10)
                result = r.json()
            logger.info("kf %s done in %.0fms: errcode=%s", path, (time.time() - t0) * 1000, result.get("errcode"))
            self._reply(200, result)
        except Exception as e:
            logger.error("KF relay error: %s", str(e))
            self._reply(500, {"error": str(e)})

    def _post_with_retry(self, url, msg, corp_id, secret):
        r = _session.post(url, json=msg, timeout=10)
        result = r.json()
        if result.get("errcode") == 42001:
            _token_cache["token"] = ""
            token = get_access_token(corp_id, secret)
            if token:
                r = _session.post(url.split("?")[0] + f"?access_token={token}", json=msg, timeout=10)
                result = r.json()
        return result

    def _reply(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass  # 静音默认访问日志


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


if __name__ == "__main__":
    threading.Thread(target=_keep_warm, daemon=True).start()
    port = 5005
    server = ThreadingHTTPServer(("0.0.0.0", port), RelayHandler)
    logger.info("WeChat relay (keep-alive + warmer) listening on port %d", port)
    server.serve_forever()
