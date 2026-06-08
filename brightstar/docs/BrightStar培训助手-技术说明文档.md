# ブライトスター(BrightStar)培训助手 — 技术说明文档

> 版本：v2.0（微信 agent 版）｜ 区域：AWS 东京 (ap-northeast-1) ｜ 时区：JST (Asia/Tokyo)

---

## 1. 项目概述

面向公司内部培训（学员=员工）的轻量课程管理助手。学员通过**微信**（公众号/客服 agent）进入：完成首次注册后，可浏览/报名/取消课程、查询已报名课程、**主动查询"下节课时间 + Zoom 链接"**。老师在 agent 内管理学员与课程、发布课程（自动创建一次性 Zoom 会议）、对报名学员随机分组。

学员入口同时支持**菜单/按钮式**与**AI 对话式（自由打字）**两种交互，共用同一套后端业务逻辑。

**不做自动提醒**：受微信主动推送限制，系统不主动推送开课提醒，改为学员随时在 agent 内主动查询。

后端不使用 Dify；纯 AWS Lambda 做路由与业务，DynamoDB 存储，全 Serverless。

---

## 2. 已确认的关键设计决策

| 决策点 | 结论 | 理由 |
|---|---|---|
| 学员入口 | 微信公众号/客服 agent | 用户要求，最终形态走微信 |
| 交互方式 | 菜单式 + AI 对话式 并存 | 两者都要；按钮稳定，打字灵活 |
| 自由文字理解 | 东京区 **Amazon Bedrock** | 不用 LongCat，避免学员 PII 出境的合规问题（APPI / ISO 27001） |
| AI 兜底 | 理解失败时回退到菜单 | 避免 agent 卡死或乱答 |
| 提醒方式 | **不做自动提醒**，改主动查询 | 微信主动推送受限；最省事且无推送限制 |
| 日历 .ics / 邮件 / EventBridge 定时 | **全部不做** | 既然不自动推送，整个通知子系统取消 |
| Zoom 会议 | 一次性会议 (scheduled, type=2) | 每节课独立 |
| 老师端鉴权 | 老师 userId 白名单（微信 openid 映射）| 管理操作必须受控 |
| 后端编排 | 纯 Lambda 路由，无 Dify | 业务为确定性 CRUD + 排程 |
| 区域/时区 | 东京区；JST（存 UTC，展示转 JST） | 合规与一致性 |

> 注：日本人学员场景以后再评估（届时入口可能改 LINE 或网页，后端复用）。

---

## 3. 系统架构

```
学员/老师 在微信 → 公众号/客服 agent
        │  (微信 Webhook，含 openid)
        ▼
   API Gateway (HTTP API)
        ▼
   AWS Lambda (路由层)
        ├── 菜单/按钮点击 → 直接路由到业务函数（无需 LLM）
        └── 自由打字 → Bedrock 解析意图 → 路由到业务函数
                         └─ 解析失败 → 回退菜单
        ▼
   业务函数（注册/课程/报名/查询/分组）
        ├── DynamoDB (Students / Courses / Enrollments / Groups)
        ├── Zoom API (Server-to-Server OAuth) — 发布课程时建一次性会议
        └── Secrets Manager / SSM — Zoom 凭证
        ▼
   通过微信客服消息接口回复学员
```

- 身份以微信 **openid** 为唯一键；首次交互引导注册。
- 老师身份通过 openid 白名单识别，放开管理功能。
- 所有时间存 UTC，展示转 JST。

---

## 4. 数据模型 (DynamoDB，多表 + 1 GSI)

### 4.1 Students
| 字段 | 说明 |
|---|---|
| `openid` (PK) | 微信 openid（唯一身份）|
| `name` | 姓名（首次注册填写）|
| `phone` / `dept` / `level` | 基本信息 |
| `role` | `student` \| `teacher` |
| `createdAt` | ISO8601 (UTC) |

### 4.2 Courses
| 字段 | 说明 |
|---|---|
| `courseId` (PK) | UUID |
| `title` / `description` | 标题/简介 |
| `startTime` | 开课时间 (UTC ISO8601) |
| `durationMin` | 时长（分钟）|
| `capacity` / `enrolledCount` | 容量 / 已报名数 |
| `status` | `draft` \| `published` \| `cancelled` |
| `teacherId` | 创建老师 openid |
| `zoomMeetingId` / `zoomJoinUrl` / `zoomStartUrl` | Zoom 信息（start_url 仅老师可见）|
| `createdAt` / `updatedAt` | 时间戳 |

### 4.3 Enrollments
| 字段 | 说明 |
|---|---|
| `openid` (PK) | 学员 |
| `courseId` (SK) | 课程 → 支持"查我报的课" |
| **GSI1**: `courseId`(PK) + `openid`(SK) | 支持"查某课报名名单"（分组、计数）|
| `enrolledAt` | 时间戳 |
| `status` | `enrolled` \| `cancelled` |

### 4.4 Groups
| 字段 | 说明 |
|---|---|
| `courseId` (PK) | 课程 |
| `groupId` (SK) | 组 ID |
| `groupName` / `members`（openid 列表）| 分组信息 |
| `createdAt` | 时间戳 |

**并发与容量**：报名时对 Courses 条件写入（`enrolledCount < capacity` 才 +1），防止超额。

---

## 5. 功能与意图清单

学员（菜单项 = AI 对话需识别的意图）：
| 功能 | 菜单项 | 对应自由文字示例 |
|---|---|---|
| 首次注册 | （自动触发）| "我要加入" |
| 浏览课程 | 课程列表 | "有哪些课" |
| 报名课程 | 报名课程 | "我要报XX课" |
| 取消报名 | 取消报名 | "取消XX课" |
| 我的课程 | 我的课程 | "我报了哪些课" |
| 查下节课 | 下节课 | "我下节课几点 / Zoom链接" |

老师（白名单 openid）：
| 功能 | 说明 |
|---|---|
| 建课 | 创建课程，调 Zoom API 建一次性会议 |
| 改课 / 删课 | 更新 / 删除课程 |
| 发布课程 | 状态置 published，学员可见 |
| 学员管理 | 查 / 改 / 删学员信息 |
| 报名名单 | 查看某课报名学员 |
| 随机分组 | 按报名名单随机切分为 N 组 |

---

## 6. 核心流程

### 6.1 首次加入
学员在微信首次交互 → 系统按 openid 判断为新用户 → 引导填写姓名+基本信息 → 写入 Students → 进入菜单。

### 6.2 报名
点"报名"或说"报名XX课" → 条件写入 Enrollment、容量 +1 → 回复成功 + 课程时间(JST) + Zoom 链接。

### 6.3 查下节课（替代自动提醒）
学员随时问"下节课" → 按 openid 查 Enrollments → 找最近一节未开始课程 → 回复时间(JST) + Zoom join 链接。

### 6.4 老师发布课程
填写课程信息 → 调 Zoom API 建一次性会议(type=2, timezone=Asia/Tokyo) → 存 join_url/start_url → 置 published。

### 6.5 随机分组
老师选课程 → 按 GSI 拉报名名单 → 随机打散切分为 N 组 → 写 Groups → 返回结果。

---

## 7. AI 对话层（Bedrock 意图解析）

- 仅用于"自由打字"入口；菜单点击不经过 LLM。
- 流程：用户文本 → Bedrock（东京区）解析为结构化意图 `{intent, params}` → 路由到对应业务函数。
- **兜底**：低置信度 / 无法解析 / 缺参数时，不臆测，回退菜单或反问澄清（一次为限），避免乱答。
- **合规**：解析提示中尽量不传 PII；学员姓名等敏感信息不外发境外模型。Bedrock 在东京区，数据不出境。

---

## 8. Zoom 集成

- 应用类型：Server-to-Server OAuth App（account_id + client_id + client_secret）。
- 权限：`meeting:write`。凭证存 Secrets Manager / SSM，不硬编码。
- 创建：`POST /users/{userId}/meetings`，`type=2`、`start_time`(JST)、`duration`、`timezone=Asia/Tokyo`。
- 保存 `id` / `join_url` / `start_url`（start_url 仅老师可见）。

---

## 9. 限制与风险（务必知晓）

1. **无自动提醒**：系统不主动推送，学员需自行在 agent 内查询"下节课"。这是按你的选择（选项3）确定的。
2. **微信主动推送限制**：未来若想加"开课前提醒"，只能走微信一次性订阅消息（学员每次需手动授权），需已认证公众号/小程序。
3. **微信侧前提**：需已认证的公众号或企业微信；注意客服消息的回复时限。
4. **AI 误解风险**：自由打字可能被误解，必须有"兜底回菜单/反问"机制。
5. **个人信息合规（APPI + ISO 27001）**：存姓名等属个人信息；DynamoDB 静态加密、最小权限 IAM、明确保留/删除策略；**不得**将 PII 发往境外免费 LLM；自由文字理解用东京区 Bedrock。
6. **时区**：全程 JST 计算与展示，存储 UTC。
7. **退课规则**：建议设退课截止（如开课前 2 小时），可配置。
8. **学员群体**：当前面向使用微信的学员；日本人学员场景以后另评估（入口可能改 LINE/网页，后端复用）。

---

## 10. 技术栈与部署

- **IaC**：AWS SAM（template.yaml）定义 Lambda / HTTP API / DynamoDB。
- **运行时**：Lambda Python 3.12。
- **区域**：ap-northeast-1。
- **AI**：Amazon Bedrock（东京区，自由文字意图解析）。
- **成本**：本规模（数百学员）月成本约数美元级 + Bedrock 按调用计费（菜单交互不计），整体很低。

---

## 11. 建议实施阶段（交给 Claude Code 时分阶段）

1. **Phase 1**：SAM 基础设施 + 数据模型（四表 + GSI）+ 微信 Webhook 接入骨架（验签、openid 提取、消息收发）。
2. **Phase 2**：学员业务（首次注册、列课、报名条件容量、取消、我的课、查下节课）+ 菜单交互。
3. **Phase 3**：Zoom 集成（发布课程建一次性会议）。
4. **Phase 4**：老师后台（课程 CRUD、发布、学员管理、随机分组）+ openid 白名单鉴权。
5. **Phase 5**：AI 对话层（Bedrock 意图解析 + 路由 + 兜底回菜单）。
