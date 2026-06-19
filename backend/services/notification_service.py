from services.json_service import append_json, load_json, update_json
from utils.helpers import generate_id, now_iso


def list_notifications():
    return load_json("notifications")


def get_user_notifications(user_id, user_type):
    all_notifs = list_notifications()
    return [
        n for n in all_notifs
        if str(n.get("userId")) == str(user_id) and n.get("userType") == user_type
    ]


def add_notification(payload):
    notification = {
        "id": f"notif_{generate_id()}",
        "userId": payload["userId"],
        "userType": payload["userType"],
        "title": payload["title"],
        "message": payload["message"],
        "type": payload.get("type", "appointment"),
        "relatedId": payload.get("relatedId"),
        "actionUrl": payload.get("actionUrl"),
        "icon": payload.get("icon"),
        "isRead": False,
        "createdAt": now_iso(),
    }
    return append_json("notifications", notification)


def mark_notification_read(notification_id):
    return update_json("notifications", notification_id, {"isRead": True})


def mark_all_notifications_read(user_id, user_type):
    all_notifs = list_notifications()
    count = 0
    for n in all_notifs:
        if str(n.get("userId")) == str(user_id) and n.get("userType") == user_type and not n.get("isRead"):
            n["isRead"] = True
            count += 1
    if count:
        from services.json_service import save_json
        save_json("notifications", all_notifs)
    return count


def get_unread_count(user_id, user_type):
    notifs = get_user_notifications(user_id, user_type)
    return sum(1 for n in notifs if not n.get("isRead"))
