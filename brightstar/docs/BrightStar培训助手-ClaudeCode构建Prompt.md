# 交给 Claude Code 的构建 Prompt — ブライトスター培训助手（微信 agent 版）

> 用法：把下面整段发给 Claude Code，分阶段构建，每阶段完成后你确认再进下一阶段。
> 配套《技术说明文档 v2.0》一并提供给 Code 作为权威规格（冲突时以文档为准）。

---

```
你是资深 AWS Serverless 架构师 + 全栈工程师。请为「ブライトスター(BrightStar)培训助手」构建后端系统。这是面向公司内部培训（学员=员工）的轻量课程管理应用，学员入口为微信公众号/客服 agent。请严格按我提供的《技术说明文档 v2.0》实现；冲突时以文档为准。

【总体约束】
- 区域 ap-northeast-1（东京）；时区一律 JST（存储 UTC，展示转 JST）。
- 架构：微信 Webhook → API Gateway(HTTP API) → Lambda（路由+业务）→ DynamoDB。
- 身份：以微信 openid 为唯一键；首次交互引导注册。老师为 openid 白名单，管理功能仅老师可用。
- 学员交互同时支持：菜单/按钮式（直接路由，无 LLM）+ AI 对话式（自由打字，经 Bedrock 解析意图后路由）。
- 不使用 Dify、不使用 SES、不做日历 .ics、不做任何定时提醒。系统为"主动查询"模式。
- 自由文字理解用 Amazon Bedrock（东京区），不得使用境外模型；解析提示中尽量不含 PII。
- 基础设施用 AWS SAM（template.yaml）。Lambda 运行时 Python 3.12。
- Zoom 凭证存 Secrets Manager 或 SSM，严禁硬编码。DynamoDB 启用静态加密；最小权限 IAM。

【数据模型】按文档第 4 节实现四张表：
- Students(PK openid)、Courses(PK courseId)、Enrollments(PK openid / SK courseId，GSI1: courseId/openid)、Groups(PK courseId / SK groupId)。
- 报名对 Courses 条件写入（enrolledCount < capacity 才 +1），防止超额并发。

【功能】按文档第 5 节实现：
- 学员：首次注册、浏览课程、报名、取消报名、我的课程、查下节课（返回时间 JST + Zoom 链接）。
- 老师（openid 白名单）：建课（调 Zoom 建一次性会议）、改课、删课、发布、学员查/改/删、查报名名单、随机分组。

【关键实现要点】
1. 微信接入：Webhook 验签、解析消息、提取 openid、通过客服消息接口回复；区分"事件/菜单点击"与"文本消息"。
2. 首次注册：openid 未知则引导填写姓名+基本信息写入 Students。
3. 报名：条件容量检查 → 写 Enrollment → 回复成功 + 课程 JST 时间 + Zoom 链接。
4. 查下节课：按 openid 查 Enrollments，取最近一节未开始课程，回复 JST 时间 + Zoom join 链接。
5. Zoom：发布课程时用 Server-to-Server OAuth 建一次性会议(type=2, timezone=Asia/Tokyo)，存 id/join_url/start_url；start_url 仅老师可见。
6. 随机分组：按 GSI 拉报名名单，随机打散切分为 N 组（支持指定组数或每组人数），写 Groups。
7. 退课截止：默认开课前 2 小时（做成可配置常量）。
8. AI 对话层：文本 → Bedrock 解析为 {intent, params} → 路由到业务函数；低置信度/缺参数时回退菜单或反问一次澄清，严禁臆测乱答。

【分阶段构建 — 每阶段完成后停下等我确认】
Phase 1：SAM 模板 + 四张表(含 GSI) + 微信 Webhook 接入骨架（验签、openid 提取、收发消息）。输出目录结构、template.yaml、本地部署/测试步骤。
Phase 2：学员业务（注册、列课、报名条件容量、取消、我的课、查下节课）+ 菜单交互。
Phase 3：Zoom 集成（发布课程建一次性会议，凭证走 Secrets Manager）。
Phase 4：老师后台（课程 CRUD、发布、学员管理、随机分组）+ openid 白名单鉴权。
Phase 5：AI 对话层（Bedrock 意图解析 + 路由 + 兜底回菜单/反问）。

请从 Phase 1 开始，先输出项目目录结构与 template.yaml，并说明本地部署/测试步骤。完成 Phase 1 后停下等我确认。
```

---

## 给你（非 Code）的备忘

- **微信侧准备**：已认证的公众号或企业微信；配置服务器 Webhook（URL、Token、EncodingAESKey）；开通客服消息接口；如用菜单，配好自定义菜单。
- **Zoom 准备**：Server-to-Server OAuth 应用（account_id / client_id / client_secret），权限 `meeting:write`。
- **Bedrock 准备**：在东京区开通所需模型访问权限（model access）。
- **首位老师**：部署后把你自己的 openid 加入老师白名单（建议放 SSM 参数或 Students 表 role=teacher）。
- **退课截止 / 容量默认值**：以常量出现，按需调整。
- **未来若要"开课前提醒"**：只能走微信一次性订阅消息（学员每次需授权），需评估体验后再加。
- **日本人学员场景**：以后另接 LINE 或网页入口，后端可直接复用，无需重做。
