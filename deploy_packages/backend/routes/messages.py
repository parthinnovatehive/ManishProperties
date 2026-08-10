from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import error_response, generate_id, now_iso, success_response


messages_bp = Blueprint("messages", __name__)


@messages_bp.get("/")
@messages_bp.get("")
@jwt_required()
def index():
    messages = load_json("messages")
    return success_response("Messages fetched", data=messages, messages=messages)


@messages_bp.post("/")
@messages_bp.post("")
@jwt_required()
def create():
    payload = request.get_json(silent=True) or {}
    message = {
        "id": str(payload.get("id") or generate_id("msg_")),
        **payload,
        "createdAt": now_iso(),
    }
    append_json("messages", message)
    return success_response("Message created", data=message, status_code=201)


@messages_bp.get("/<message_id>")
@jwt_required()
def show(message_id):
    message = next((item for item in load_json("messages") if str(item.get("id")) == str(message_id)), None)
    if not message:
        return error_response("Message not found", 404)
    return success_response("Message fetched", data=message)


@messages_bp.put("/<message_id>")
@messages_bp.patch("/<message_id>")
@jwt_required()
def update(message_id):
    message = update_json("messages", message_id, {**(request.get_json(silent=True) or {}), "updatedAt": now_iso()})
    if not message:
        return error_response("Message not found", 404)
    return success_response("Message updated", data=message)


@messages_bp.delete("/<message_id>")
@jwt_required()
def destroy(message_id):
    if not delete_json("messages", message_id):
        return error_response("Message not found", 404)
    return success_response("Message deleted")
