# 受託開発 SDLC 成果物一式（サンプル）

実装済みシステムから**逆生成**した、日本の受託開発で通用する全工程ドキュメント一式と、
**実行可能な単体・結合テスト**およびその**実行エビデンス**です。受託開発のケーススタディ／営業ポートフォリオ用。

- **対象システム**：BrightStar 社内システム（勤怠・通勤費 提出 LINE Bot）＝ リポジトリ平級の [`../brightstar-hr`](../brightstar-hr)（AWS Serverless / CDK(TS) + Lambda(Python)）
- **作成方針**：コードを唯一の正とし、機能を創作しない。テスト結果は**実行値**（捏造なし、JUnit XML が真実）。

## 成果物（`docs/`）

| # | ドキュメント | 内容 |
|---|---|---|
| 01 | 要件定義書 | 機能要件 FR-01〜28 / 非機能 NFR-01〜15（実装根拠つき） |
| 02 | 基本設計書 | システム構成・DB論理設計・外部I/F（BD/IF/TBL、Mermaid） |
| 03 | 詳細設計書 | 関数仕様 DD-01〜36 + シーケンス図（Mermaid） |
| 04 / 05 | 単体テスト 仕様書 / 結果報告書 | UT-001〜069 |
| 06 / 07 | 結合テスト 仕様書 / 結果報告書 | IT-01〜23 |
| 08 | トレーサビリティマトリクス | 要件↔設計↔単体↔結合 の全トレース（RTM） |
| 09 | 品質保証総括報告書 | カバレッジ集計・指摘統合・リリース可否 |

各ドキュメントは `.md`（原稿）と `.pdf`（Chrome 無頭印刷、Mermaid 描画済）の両方を収録。

## テスト（`tests/`）と実行エビデンス（`docs/test-evidence/`）

- **単体テスト 69 件**：純粋関数中心（openpyxl で入力 xlsx を自作）。AWS 非依存。
- **結合テスト 24 件**：`moto` で DynamoDB/S3 をモック、LINE/SSM は monkeypatch。ハンドラ跨ぎのフローを実コードで検証。
- **実績：合計 93 件 全 PASS**（エビデンス＝ `docs/test-evidence/{unit,integration}-junit.xml` / `*-console.txt`）。

### 実行方法

```bash
# リポジトリ直下で（本ディレクトリの親に brightstar-hr/ がある前提）
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements-test.txt   # Windows
# .venv/bin/python -m pip install -r requirements-test.txt     # macOS/Linux
.venv/Scripts/python -m pytest tests -v
```

テストは `conftest.py` で `../brightstar-hr/lambda` を `sys.path` に追加して実装を import します
（コードは複製せず、平級の `brightstar-hr` を参照）。

## PDF の再生成

```bash
python docs/md2pdf_mermaid.py docs/01_要件定義書.md docs/01.html "要件定義書"
# → Chrome 無頭で印刷： --headless=new --no-sandbox --print-to-pdf ...
```
