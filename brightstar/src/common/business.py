"""学员业务逻辑（基于微信 openid）。每个函数返回要回复给用户的中文文本。"""
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from . import config, db
from .timeutils import fmt_jst, iso_utc, now_utc, parse_iso

MENU = (
    "📚 BrightStar 培训助手\n"
    "你可以直接打字，或回复对应数字：\n"
    "1️⃣ 课程列表\n"
    "2️⃣ 我的课程\n"
    "3️⃣ 下节课（时间+Zoom）\n"
    "报名请说：报名 课程名\n"
    "取消请说：取消 课程名"
)

NUM_TO_INTENT = {"1": "list_courses", "2": "my_courses", "3": "next_class"}


# ------------------------------- 学员档案 -------------------------------
def get_student(openid: str):
    return db.students().get_item(Key={"openid": openid}).get("Item")


def start_registration(openid: str) -> str:
    """新用户：建占位档案，等待回复姓名。"""
    db.students().put_item(
        Item={
            "openid": openid,
            "status": "awaiting_name",
            "role": "student",
            "createdAt": iso_utc(),
        }
    )
    return "👋 欢迎加入 BrightStar 培训助手！\n请回复你的【姓名】完成注册。"


def promote_teacher(openid: str):
    """把已注册学员升级为老师（兼具学员身份）。"""
    db.students().update_item(
        Key={"openid": openid},
        UpdateExpression="SET #r = :t",
        ExpressionAttributeNames={"#r": "role"},
        ExpressionAttributeValues={":t": "teacher"},
    )


# 不能当姓名的问候语/指令词
_NAME_BLOCKLIST = {
    "你好", "您好", "hi", "hello", "在吗", "注册", "重新注册", "报名", "取消",
    "课程", "课程列表", "有哪些课", "下节课", "我的课", "我的课程", "菜单",
    "帮助", "help", "老师", "老师认证", "老师帮助", "改名",
}


def valid_name(name: str) -> bool:
    name = (name or "").strip()
    if not (2 <= len(name) <= 20):
        return False
    if name.lower() in _NAME_BLOCKLIST or name in _NAME_BLOCKLIST:
        return False
    if name.isdigit():
        return False
    return True


def complete_registration(openid: str, name: str) -> str:
    name = (name or "").strip()
    if not valid_name(name):
        return "请回复你的【真实姓名】（2-20 个字，不要发问候语或指令）完成注册。"
    db.students().update_item(
        Key={"openid": openid},
        UpdateExpression="SET #n = :n, #s = :a",
        ExpressionAttributeNames={"#n": "name", "#s": "status"},
        ExpressionAttributeValues={":n": name, ":a": "active"},
    )
    return f"✅ 注册成功，{name}！\n\n" + MENU


def rename(openid: str, new_name: str) -> str:
    new_name = (new_name or "").strip()
    if not valid_name(new_name):
        return "格式：改名 你的真实姓名（2-20 个字）"
    db.students().update_item(
        Key={"openid": openid},
        UpdateExpression="SET #n = :n",
        ExpressionAttributeNames={"#n": "name"},
        ExpressionAttributeValues={":n": new_name},
    )
    return f"✅ 已改名为：{new_name}"


# ------------------------------- 课程 -------------------------------
def _published_courses():
    items = [c for c in db.courses().scan().get("Items", []) if c.get("status") == "published"]
    items.sort(key=lambda c: c.get("startTime", ""))
    return items


def list_courses() -> str:
    courses = _published_courses()
    if not courses:
        return "目前还没有已发布的课程，请稍后再来看看～"
    lines = ["📚 可报名课程："]
    for i, c in enumerate(courses, 1):
        left = int(c.get("capacity", 0)) - int(c.get("enrolledCount", 0))
        lines.append(
            f"{i}. {c['title']}｜{fmt_jst(c.get('startTime',''))}｜余 {left} 位"
        )
    lines.append("\n报名请说：报名 课程名")
    return "\n".join(lines)


def _find_published_by_kw(kw: str):
    kw = (kw or "").strip()
    courses = _published_courses()
    if not kw:
        return courses, None
    matches = [c for c in courses if kw in c.get("title", "")]
    return matches, kw


# ------------------------------- 报名 -------------------------------
def enroll(openid: str, course_kw: str) -> str:
    matches, kw = _find_published_by_kw(course_kw)
    if not kw:
        return "请告诉我课程名，例如：报名 Python 入门\n\n" + list_courses()
    if not matches:
        return f"没找到包含「{kw}」的已发布课程。\n\n" + list_courses()
    if len(matches) > 1:
        names = "、".join(c["title"] for c in matches[:5])
        return f"找到多门匹配课程：{names}\n请说得更具体一些。"

    course = matches[0]
    course_id = course["courseId"]

    ex = db.enrollments().get_item(Key={"openid": openid, "courseId": course_id}).get("Item")
    if ex and ex.get("status") == "enrolled":
        return f"你已经报名「{course['title']}」啦。"

    try:
        db.courses().update_item(
            Key={"courseId": course_id},
            UpdateExpression="SET enrolledCount = enrolledCount + :one",
            ConditionExpression="enrolledCount < #cap",  # capacity 是 DynamoDB 保留字
            ExpressionAttributeNames={"#cap": "capacity"},
            ExpressionAttributeValues={":one": 1},
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            return f"很抱歉，「{course['title']}」名额已满。"
        raise

    db.enrollments().put_item(
        Item={
            "openid": openid,
            "courseId": course_id,
            "enrolledAt": iso_utc(),
            "status": "enrolled",
        }
    )
    join = course.get("zoomJoinUrl", "（待发布 Zoom 链接）")
    return (
        f"✅ 报名成功：{course['title']}\n"
        f"🕒 时间：{fmt_jst(course.get('startTime',''))}\n"
        f"🔗 Zoom：{join}\n\n"
        "随时回复「下节课」可再次查看时间与链接。"
    )


# ------------------------------- 取消 -------------------------------
def cancel(openid: str, course_kw: str) -> str:
    kw = (course_kw or "").strip()
    mine = _my_enrolled(openid)
    if not mine:
        return "你目前没有已报名的课程。"
    if kw:
        mine = [x for x in mine if kw in x["course"].get("title", "")]
    if not mine:
        return f"没找到你报名的、包含「{kw}」的课程。"
    if len(mine) > 1:
        names = "、".join(x["course"]["title"] for x in mine[:5])
        return f"你报名的多门课匹配：{names}\n请说得更具体：取消 课程名"

    item = mine[0]
    course = item["course"]
    course_id = course["courseId"]

    if course.get("startTime"):
        hours_left = (parse_iso(course["startTime"]) - now_utc()).total_seconds() / 3600.0
        if hours_left < config.CANCEL_DEADLINE_HOURS:
            return f"已过退课截止（开课前 {config.CANCEL_DEADLINE_HOURS} 小时），无法取消。"

    db.enrollments().update_item(
        Key={"openid": openid, "courseId": course_id},
        UpdateExpression="SET #s = :c",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":c": "cancelled"},
    )
    try:
        db.courses().update_item(
            Key={"courseId": course_id},
            UpdateExpression="SET enrolledCount = enrolledCount - :one",
            ConditionExpression="enrolledCount > :zero",
            ExpressionAttributeValues={":one": 1, ":zero": 0},
        )
    except ClientError as e:
        if e.response["Error"]["Code"] != "ConditionalCheckFailedException":
            raise
    return f"已取消报名：{course['title']}"


# ------------------------------- 我的课/下节课 -------------------------------
def _my_enrolled(openid: str):
    rows = db.enrollments().query(
        KeyConditionExpression=Key("openid").eq(openid)
    ).get("Items", [])
    out = []
    for e in rows:
        if e.get("status") != "enrolled":
            continue
        c = db.courses().get_item(Key={"courseId": e["courseId"]}).get("Item")
        if c:
            out.append({"enrollment": e, "course": c})
    out.sort(key=lambda x: x["course"].get("startTime", ""))
    return out


def my_courses(openid: str) -> str:
    mine = _my_enrolled(openid)
    if not mine:
        return "你还没有报名任何课程。回复「课程列表」看看吧～"
    lines = ["🎒 我的课程："]
    for i, x in enumerate(mine, 1):
        c = x["course"]
        lines.append(f"{i}. {c['title']}｜{fmt_jst(c.get('startTime',''))}")
    return "\n".join(lines)


def next_class(openid: str) -> str:
    mine = _my_enrolled(openid)
    upcoming = [x for x in mine if x["course"].get("startTime") and parse_iso(x["course"]["startTime"]) > now_utc()]
    if not upcoming:
        return "你没有即将开始的课程。回复「课程列表」看看新课吧～"
    c = upcoming[0]["course"]
    join = c.get("zoomJoinUrl", "（待发布 Zoom 链接）")
    return (
        f"⏰ 你的下节课：{c['title']}\n"
        f"🕒 时间：{fmt_jst(c.get('startTime',''))}\n"
        f"🔗 Zoom：{join}"
    )
