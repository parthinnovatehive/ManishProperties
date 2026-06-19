from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from services.notification_service import (
    add_notification,
    get_unread_count,
    get_user_notifications,
    mark_all_notifications_read,
    mark_notification_read,
)
from utils.helpers import error_response, success_response


notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("/my")
@jwt_required()
def my_notifications():
    user_id = request.args.get("userId") or get_jwt_identity()
    user_type = request.args.get("userType", "")
    if not user_type:
        return error_response("userType is required", 400)
    notifs = get_user_notifications(user_id, user_type)
    return success_response("Notifications fetched", data=notifs, notifications=notifs)


@notifications_bp.get("/unread-count")
@jwt_required()
def unread_count():
    user_id = request.args.get("userId") or get_jwt_identity()
    user_type = request.args.get("userType", "")
    if not user_type:
        return error_response("userType is required", 400)
    count = get_unread_count(user_id, user_type)
    return success_response("Unread count fetched", data={"count": count}, count=count)


@notifications_bp.post("/")
@notifications_bp.post("")
@jwt_required()
def create():
    payload = request.get_json(silent=True) or {}
    required = ["userId", "userType", "title", "message"]
    for field in required:
        if field not in payload:
            return error_response(f"{field} is required", 400)
    notif = add_notification(payload)
    return success_response("Notification created", data=notif, notification=notif, status_code=201)


@notifications_bp.patch("/<notification_id>/read")
@jwt_required()
def mark_read(notification_id):
    result = mark_notification_read(notification_id)
    if not result:
        return error_response("Notification not found", 404)
    return success_response("Notification marked as read", data=result)


@notifications_bp.post("/read-all")
@jwt_required()
def mark_read_all():
    user_id = request.args.get("userId") or get_jwt_identity()
    user_type = request.args.get("userType", "")
    if not user_type:
        return error_response("userType is required", 400)
    count = mark_all_notifications_read(user_id, user_type)
    return success_response(f"{count} notifications marked as read", data={"count": count})
