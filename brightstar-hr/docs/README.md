# BrightStar 社内システム（勤怠・通勤費 LINE Bot）

員工通过 LINE 提交每月「勤怠（考勤）」「通勤費」两个固定 Excel；人事通过 LINE
查看全员提交情况、筛选未提交者；Bot 自动/手动提醒未提交者。后端 AWS Serverless，
**CDK(TypeScript)** 部署，Lambda 为 **Python（零依赖）**。Region: ap-northeast-1。

## 架构
```
LINE OA ──webhook──▶ Lambda Function URL ──▶ webhook(Py3.12 arm64)
   ├ 文件(Excel) → 下载 → S3 → 记 submissions
   ├ 文本指令   → 注册/履历/人事查询/催办/模板
EventBridge(cron) ─┐
人事「催办」───────┴▶ reminder Lambda ─push→ 仅未提交者
S3: submissions/ + templates/(空白样式)
DynamoDB: employees / submissions(+GSI1)
SSM SecureString: LINE secret/token（不入 git）
```

## 目录
- `cdk/` —— CDK(TypeScript) 工程（栈定义、Function URL、定时规则、IAM）
- `lambda/` —— Python 业务代码（`common/` + `handlers/`）
- `templates/` —— 放 `kintai.xlsx` / `commute.xlsx` 空白样式

## 权限模型
- `employees.role`：`employee`（仅看自己）/ `hr`（看全员、可催办）
- HR 兜底白名单：部署上下文 `hrUserIds`（逗号分隔 LINE userId）

## 指令速查
- 员工：发 Excel 文件提交；`模板`/`テンプレ` 取空白样式；`履历`/`履歴` 看自己
- 人事：`未提出 [月]`、`一覧 [月]`、`催办`（也可带「勤怠/通勤費」筛类型）

## 部署
```bash
cd brightstar-hr/cdk
npm install
# 首次：引导环境
npx cdk bootstrap aws://<account>/ap-northeast-1
# 写入 LINE 凭证（值不入 git；用户提供新 OA 凭证后执行）
aws ssm put-parameter --name /brightstar-hr/dev/line/secret --type SecureString --value '<channel secret>' --region ap-northeast-1
aws ssm put-parameter --name /brightstar-hr/dev/line/token  --type SecureString --value '<channel access token>' --region ap-northeast-1
# 审阅 & 部署
npx cdk diff
npx cdk deploy
```
部署后把输出的 `LineWebhookUrl` 填到 LINE Developers > Messaging API > Webhook URL
（开启 Use webhook，关闭自动回复）。把 `kintai.xlsx`/`commute.xlsx` 放进 `templates/` 再 deploy。

## 定时提醒
默认 `cron(0 0 25,28 * ? *)`（UTC）= 每月 25、28 日 09:00 JST。改 `cdk.json` 的
`reminderCron` 或 `cdk deploy -c reminderCron="cron(...)"`。

## 清理（dev/staging）
非 prod 栈数据资源 RemovalPolicy=DESTROY、S3 autoDeleteObjects。`npx cdk destroy` 即可；
prod 为 RETAIN，需人工确认后删。SSM 参数需单独 `aws ssm delete-parameter`。
