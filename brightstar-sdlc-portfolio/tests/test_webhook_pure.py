"""line_webhook.py 純粋部分の単体テスト（DD-25 _sign_key）。

_sign_key は config.line_secret()(SSM)に依存するため、
config._cache に対象パラメータ名で固定 secret を注入し SSM 呼び出しを回避する。
（line_secret() → _get_param(LINE_SECRET_PARAM) は cache ヒットで即返す）
"""
import re

import pytest

from common import config
from handlers import line_webhook


@pytest.fixture
def fixed_secret(monkeypatch):
    """LINE secret を固定値に（SSM を呼ばせない）。"""
    monkeypatch.setitem(config._cache, config.LINE_SECRET_PARAM, "test-secret-123")
    return "test-secret-123"


def test_sign_key_deterministic(fixed_secret):
    """UT-066 | DD-25/FR-14 _sign_key: 同一keyで決定的(同値)"""
    a = line_webhook._sign_key("submissions/202606/kintai/u1.xlsx")
    b = line_webhook._sign_key("submissions/202606/kintai/u1.xlsx")
    assert a == b


def test_sign_key_16_hex(fixed_secret):
    """UT-067 | DD-25/NFR-03 _sign_key: 16桁hex文字列"""
    sig = line_webhook._sign_key("any/key")
    assert len(sig) == 16
    assert re.fullmatch(r"[0-9a-f]{16}", sig)


def test_sign_key_differs_by_key(fixed_secret):
    """UT-068 | DD-25 _sign_key: 異なるkeyは異なる署名"""
    a = line_webhook._sign_key("key-a")
    b = line_webhook._sign_key("key-b")
    assert a != b


def test_sign_key_depends_on_secret(monkeypatch):
    """UT-069 | DD-25/NFR-03 _sign_key: secret依存(secretを変えると署名も変わる)"""
    monkeypatch.setitem(config._cache, config.LINE_SECRET_PARAM, "secret-A")
    sig_a = line_webhook._sign_key("same-key")
    monkeypatch.setitem(config._cache, config.LINE_SECRET_PARAM, "secret-B")
    sig_b = line_webhook._sign_key("same-key")
    assert sig_a != sig_b
