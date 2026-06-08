"""集中读取环境变量与业务常量。"""
import os

APP_NAME = os.environ.get("APP_NAME", "brightstar")
STAGE = os.environ.get("STAGE", "dev")

STUDENTS_TABLE = os.environ.get("STUDENTS_TABLE", "brightstar-dev-students")
COURSES_TABLE = os.environ.get("COURSES_TABLE", "brightstar-dev-courses")
ENROLLMENTS_TABLE = os.environ.get("ENROLLMENTS_TABLE", "brightstar-dev-enrollments")
GROUPS_TABLE = os.environ.get("GROUPS_TABLE", "brightstar-dev-groups")
ENROLLMENTS_GSI1 = os.environ.get("ENROLLMENTS_GSI1", "GSI1")

# 退课截止：开课前 N 小时（可配置常量）
CANCEL_DEADLINE_HOURS = int(os.environ.get("CANCEL_DEADLINE_HOURS", "2"))

# 企业微信（自建应用 + 被动回复）
WECOM_CORP_ID = os.environ.get("WECOM_CORP_ID", "")
WECOM_TOKEN = os.environ.get("WECOM_TOKEN", "")
WECOM_AES_KEY = os.environ.get("WECOM_AES_KEY", "")  # EncodingAESKey(43 位)
WECOM_AGENT_ID = os.environ.get("WECOM_AGENT_ID", "")

# 老师 userid 白名单（逗号分隔；企业微信成员 UserId）
TEACHER_OPENIDS = [
    o.strip() for o in os.environ.get("TEACHER_OPENIDS", "").split(",") if o.strip()
]

# Bedrock 意图解析
BEDROCK_ENABLED = os.environ.get("BEDROCK_ENABLED", "true").lower() == "true"
BEDROCK_MODEL_ID = os.environ.get(
    "BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0"
)

# Zoom
ZOOM_ENABLED = os.environ.get("ZOOM_ENABLED", "false").lower() == "true"
ZOOM_SECRET_NAME = os.environ.get("ZOOM_SECRET_NAME", f"{APP_NAME}/{STAGE}/zoom")
ZOOM_USER_ID = os.environ.get("ZOOM_USER_ID", "me")

# 时区：存储 UTC，展示 JST
TIMEZONE = "Asia/Tokyo"
