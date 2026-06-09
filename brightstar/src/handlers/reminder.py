"""开课前 1 小时提醒：定时扫描，给报名学员经微信客服推送提醒。

由 EventBridge 每 10 分钟触发。命中开课时间落在 [now+55min, now+65min] 的已发布课程，
对其报名学员发提醒，并把课程标记 remind1hSent 防重复。

⚠️ 微信客服限制：只能给「最近 48 小时内有发过消息」的用户主动推送；
超窗用户会发送失败（记日志），这是企业微信平台规则，无法绕过。
"""
import logging
from datetime import timedelta

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

from common import config, db, kf
from common.timeutils import fmt_jst, now_utc, parse_iso

log = logging.getLogger()
log.setLevel(logging.INFO)


def handler(event, context):
    now = now_utc()
    lo, hi = now + timedelta(minutes=55), now + timedelta(minutes=65)
    okf = config.WECOM_KF_OPEN_KFID
    sent = failed = 0

    for c in db.courses().scan().get("Items", []):
        if c.get("status") != "published" or not c.get("startTime"):
            continue
        try:
            start = parse_iso(c["startTime"])
        except Exception:  # noqa: BLE001
            continue
        if not (lo <= start <= hi) or c.get("remind1hSent"):
            continue

        # 幂等占位：抢到才发（防多实例/多次触发重复）
        try:
            db.courses().update_item(
                Key={"courseId": c["courseId"]},
                UpdateExpression="SET remind1hSent = :t",
                ConditionExpression="attribute_not_exists(remind1hSent) OR remind1hSent = :f",
                ExpressionAttributeValues={":t": True, ":f": False},
            )
        except ClientError:
            continue

        msg = (
            "⏰ 上课提醒\n"
            f"你报名的「{c['title']}」将在 1 小时后开始\n"
            f"🕒 {fmt_jst(c['startTime'])}\n"
            f"🔗 Zoom：{c.get('zoomJoinUrl', '(见课程详情)')}"
        )
        rows = db.enrollments().query(
            IndexName=config.ENROLLMENTS_GSI1,
            KeyConditionExpression=Key("courseId").eq(c["courseId"]),
        ).get("Items", [])
        for e in rows:
            if e.get("status") != "enrolled":
                continue
            r = kf.send_text(okf, e["openid"], msg)
            if r.get("errcode") == 0:
                sent += 1
            else:
                failed += 1
                log.warning("reminder send failed uid=%s: %s", e["openid"], r)

    log.info("reminder tick: sent=%s failed=%s", sent, failed)
    return {"sent": sent, "failed": failed}
