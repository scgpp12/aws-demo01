# ブライトスター (BrightStar) 培训助手 v2.0（微信 agent 版）

公司内部培训课程管理 —— 学员入口为**微信公众号/客服 agent**，AWS Serverless（东京区 ap-northeast-1）。

```
微信(公众号/agent) → 微信 Webhook → API Gateway(HTTP API) → Lambda(路由+业务+Bedrock意图) → DynamoDB
                                                                  ├── 菜单/数字/命令 → 直接路由（无 LLM）
                                                                  ├── 自由打字 → Bedrock 意图解析 → 路由（失败回退菜单）
                                                                  └── Zoom(Server-to-Server OAuth) 发布课程时建会议
```

> 身份以**微信 openid** 为唯一键；老师 = openid 白名单。时间存 UTC，展示转 JST。
> **不做** 网页前端 / Cognito / .ics 日历 / 自动提醒 —— 改为学员主动「查下节课」。

---

## ⚠️ Demo 说明：哪些是空壳 / 需你补凭证

| 依赖 | demo 现状 | 上线怎么做 |
|---|---|---|
| **微信公众号** | 未提供凭证。验签用 `WeChatToken` 参数；回复走**被动回复 XML**（同步返回，无需 access_token，最适合 demo）。主动「客服消息接口」是空壳 | 认证公众号后在「服务器配置」填 Webhook URL + 同一个 Token；如需主动推送，在 [`wechat.py`](src/common/wechat.py) 的 `send_customer_message` 接 access_token |
| **Zoom API** | `ZOOM_ENABLED=false`，返回**模拟**会议（`DEMO-xxxx`，`isStub=true`） | Secrets Manager 写 `brightstar/<stage>/zoom`，`ZOOM_ENABLED=true`。真实逻辑已在 [`zoom_client.py`](src/common/zoom_client.py) |
| **Bedrock** | 默认 `BEDROCK_ENABLED=true` 走东京区 Bedrock；**无权限/调用失败会自动退化为关键词解析**，所以没开通也能跑 | 在东京区开通模型 access（默认 `claude-3-haiku`）|

---

## 目录结构

```
brightstar/
├── template.yaml            # SAM：DynamoDB×4(按需) / HTTP API / 1×Lambda(webhook)
├── samconfig.toml
├── src/
│   ├── handlers/webhook.py  # 微信入口：验签 / 注册流程 / 菜单 / 老师命令 / AI 意图
│   └── common/
│       ├── wechat.py        # 验签、解析、被动回复 XML、客服消息(stub)
│       ├── bedrock.py       # 意图解析 + 关键词兜底
│       ├── business.py      # 学员业务（注册/列课/报名/取消/我的课/下节课）
│       ├── teacher.py       # 老师命令（建课/发布/删课/改课/名单/分组/学员）
│       ├── auth.py          # 老师 openid 白名单判定
│       └── config / db / timeutils / zoom_client
└── tests/test_flow.py       # 端到端对话流程测试（内存 DynamoDB 假实现）
```

---

## 部署

需要：AWS 账号、AWS CLI、SAM CLI、Python 3.12。

```bash
cd brightstar
sam build
sam deploy --guided \
  --parameter-overrides \
    Stage=dev \
    WeChatToken=你的微信Token \
    TeacherOpenids=老师openid1,老师openid2 \
    BedrockEnabled=true
```

部署后记下 Output **`WeChatWebhookUrl`**，填到微信公众平台「开发 → 服务器配置」的 URL，Token 填上面同一个值，提交后微信会 GET 验签（本服务会回 echostr）。

> **首位老师**：把你的 openid 放进 `TeacherOpenids`，或在 Students 表把对应记录 `role` 改成 `teacher`。

---

## 交互命令

### 学员（菜单点击 / 数字 / 自由打字 都可）
| 功能 | 数字 | 自由文字示例 |
|---|---|---|
| 课程列表 | `1` | 有哪些课 |
| 我的课程 | `2` | 我报了哪些课 |
| 下节课（时间+Zoom） | `3` | 我下节课几点 / Zoom链接 |
| 报名 | — | `报名 Python入门` |
| 取消报名 | — | `取消 Python入门` |
| 首次注册 | — | （新用户自动引导填姓名） |

### 老师（openid 白名单，文本命令）
```
建课 标题|开课时间|时长|容量|简介      例：建课 Python入门|2026-09-10 14:00|90|20|零基础
发布 课程名                              （创建一次性 Zoom 会议并发布）
改课 课程名|容量=30;开课时间=2026-09-11 10:00
删课 课程名
学员列表
名单 课程名
分组 课程名|组数=4        或        分组 课程名|每组=5
```

---

## 本地测试（无需 AWS）

```bash
python tests/test_flow.py
```

用内存 DynamoDB 假实现跑通：注册流程 → 老师建课/发布(Zoom 桩) → 学员列课/报名/容量满员拒绝/下节课/退课 → 随机分组 → 老师命令鉴权。

---

## 关键实现要点

- **微信接入**：`wechat.verify_signature`（token+timestamp+nonce 排序 sha1）；GET 回 echostr；POST 解析 XML、被动回复 XML。
- **注册流程**：openid 无档案 → 建占位（`status=awaiting_name`）→ 下一条文本作为姓名 → `active`。
- **报名防超额**：对 Courses 条件写入 `enrolledCount < capacity` 才 +1。
- **退课截止**：默认开课前 `2` 小时（`CancelDeadlineHours` 参数，可改）。
- **查下节课**：按 openid 查 Enrollments，取最近一节未开始课程，回时间(JST)+Zoom join。
- **AI 兜底**：低置信度/解析失败/缺参数 → 回退菜单，绝不臆测。
- **合规**：Bedrock 在东京区、提示不含 PII；DynamoDB 静态加密；最小权限 IAM；Zoom 凭证走 Secrets Manager。

---

## 成本控制与一键删除

- **绝不固定容量**：4 张 DynamoDB 表均 `PAY_PER_REQUEST`，模板无任何 `ProvisionedThroughput`。闲置 ≈ $0。
- **统一标签**：所有资源带 `Project=brightstar` / `ManagedBy=sam` / `Stage`；`samconfig.toml` 的 `tags=` 让 CloudFormation 自动给栈内每个资源打标。
- **删除**：
  ```bash
  sam delete --stack-name brightstar-dev --region ap-northeast-1
  # 按标签核查残留
  aws resourcegroupstaggingapi get-resources \
    --tag-filters Key=Project,Values=brightstar --region ap-northeast-1
  ```

---

## 限制与风险（务必知晓，见技术文档第 9 节）

1. **无自动提醒**：系统不主动推送，学员需自行查询「下节课」。
2. **微信主动推送限制**：未来若要「开课前提醒」，只能走微信一次性订阅消息（学员每次需授权）。
3. **微信侧前提**：需已认证公众号/企业微信；注意客服消息回复时限。
4. **AI 误解风险**：自由打字可能被误解，已有「回退菜单」兜底。
5. **个人信息合规（APPI + ISO 27001）**：勿将 PII 发往境外免费 LLM；自由文字理解用东京区 Bedrock。
6. **学员群体**：当前面向微信用户；日本人学员场景以后另评估（入口可能改 LINE/网页，后端可复用）。
