"""結合テスト：短縮ダウンロードリンク + 一括DL + webhook 署名検証。
IT-19, IT-20, IT-21, IT-22。

handler(event, context)（HTTP 入口）を実コードで通し、
302 リダイレクト / presigned URL（moto）/ 404 / 403 を検証。
"""
import json
import urllib.parse

import pytest

from common import business, config, s3util
from handlers import line_webhook

from .conftest import kintai_serial, text_event


@pytest.fixture(autouse=True)
def fixed_period(monkeypatch):
    monkeypatch.setattr(business, "current_period", lambda: "202606")
    return "202606"


def _get_event(raw_query):
    """Function URL GET イベント（rawQueryString 付き）。"""
    return {
        "rawQueryString": raw_query,
        "requestContext": {"http": {"method": "GET"}, "domainName": "ex.execute-api"},
        "headers": {"host": "ex.execute-api"},
    }


def _post_event(body, signature="sig"):
    return {
        "body": body,
        "isBase64Encoded": False,
        "requestContext": {"http": {"method": "POST"}, "domainName": "ex"},
        "headers": {"host": "ex", "x-line-signature": signature},
    }


# ============ IT-19 テンプレDL ============

def test_it19_template_download_redirect(line_stub, monkeypatch):
    """IT-19 | FR-12 GET /dl?type=kintai → 302・Location が presigned URL。"""
    # テンプレ実体を S3 に置く（presign 対象キーが存在）
    s3util._s3.put_object(
        Bucket=config.BUCKET_NAME,
        Key=s3util.TYPE_META["kintai"]["template"], Body=b"tmpl")

    resp = line_webhook.handler(_get_event("type=kintai"), None)

    assert resp["statusCode"] == 302
    loc = resp["headers"]["Location"]
    assert loc.startswith("https://")
    assert config.BUCKET_NAME in loc
    # presigned の署名クエリが付く
    assert "X-Amz-Signature" in loc or "AWSAccessKeyId" in loc


# ============ IT-20 提出ファイルDL（HMAC 署名）============

def test_it20_signed_download_ok_and_tampered_404(line_stub, monkeypatch):
    """IT-20 | FR-14 GET /dl?key=&sig= 正当→302、改竄 sig→404。"""
    # 提出ファイルを S3 に置く
    key = "hr/2026/06/worktimes/作業時間記録簿（山田太郎）_202606.xlsx"
    s3util._s3.put_object(Bucket=config.BUCKET_NAME, Key=key, Body=b"data")

    sig = line_webhook._sign_key(key)
    q_ok = "key=%s&sig=%s" % (urllib.parse.quote(key, safe=""), sig)

    resp_ok = line_webhook.handler(_get_event(q_ok), None)
    assert resp_ok["statusCode"] == 302
    assert config.BUCKET_NAME in resp_ok["headers"]["Location"]

    # 改竄 sig → 404
    q_bad = "key=%s&sig=%s" % (urllib.parse.quote(key, safe=""), "deadbeefdeadbeef")
    resp_bad = line_webhook.handler(_get_event(q_bad), None)
    assert resp_bad["statusCode"] == 404


# ============ IT-21 一括DL 月次ZIP ============

def test_it21_bulk_download_zip(line_stub, seed, route, monkeypatch):
    """IT-21 | FR-18 複数提出→「一括DL」→exports/{period}.zip 生成・件数。"""
    hr = "line:HR1"
    seed.link("E001", "人事太郎", hr, department="人事部", role="hr")

    # 当月配下に 2 件の提出オブジェクトを置く
    s3util._s3.put_object(
        Bucket=config.BUCKET_NAME,
        Key="hr/2026/06/worktimes/k1.xlsx", Body=b"aaa")
    s3util._s3.put_object(
        Bucket=config.BUCKET_NAME,
        Key="hr/2026/06/expenses/c1.xlsx", Body=b"bbb")

    route(text_event(hr, "一括DL"))

    # exports/202606.zip が生成された
    body = s3util.read_object("exports/202606.zip")
    assert body is not None
    import io
    import zipfile
    zf = zipfile.ZipFile(io.BytesIO(body))
    assert len(zf.namelist()) == 2

    # 応答ボタンに件数（2 件）とダウンロードリンク
    msgs = line_stub.last_messages()
    tmpl = [m for m in msgs if m.get("type") == "template"]
    assert tmpl
    assert "2 件" in tmpl[0]["template"]["text"]
    assert "/dl?key=" in tmpl[0]["template"]["actions"][0]["uri"]


# ============ IT-22 webhook 署名検証 ============

def test_it22_signature_verification(seed, monkeypatch):
    """IT-22 | FR-28 不正署名で 403、正当で 200。

    本テストでは line_stub を使わず verify_signature を直接差し替えて
    正/不正の両ケースを通す。
    """
    from common import line
    from handlers import line_webhook as lw

    # SSM を叩かせない
    monkeypatch.setattr(config, "line_secret", lambda: "test-secret")

    body = json.dumps({"events": []})

    # 不正署名 → 403
    monkeypatch.setattr(line, "verify_signature", lambda b, s: False)
    monkeypatch.setattr(lw.line, "verify_signature", lambda b, s: False)
    resp_bad = lw.handler(_post_event(body, signature="WRONG"), None)
    assert resp_bad["statusCode"] == 403

    # 正当署名 → 200
    monkeypatch.setattr(line, "verify_signature", lambda b, s: True)
    monkeypatch.setattr(lw.line, "verify_signature", lambda b, s: True)
    resp_ok = lw.handler(_post_event(body, signature="OK"), None)
    assert resp_ok["statusCode"] == 200
