from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import generate_id, now_iso
from utils.validators import normalize_role


def _normalize_user(user):
    return {**user, "role": normalize_role(user.get("role"))}


def list_users():
    return [_normalize_user(user) for user in load_json("users")]


def get_user(user_id):
    return next((item for item in list_users() if str(item.get("id")) == str(user_id)), None)


def create_user(payload):
    user = {
        "id": str(payload.get("id") or generate_id("user_")),
        "username": payload.get("username") or payload.get("email"),
        "name": payload.get("name"),
        "email": payload.get("email") or payload.get("username"),
        "phone": payload.get("phone"),
        "role": "USER",
        "savedProperties": payload.get("savedProperties", []),
        "createdAt": now_iso(),
    }
    return append_json("users", user)


def update_user(user_id, payload):
    changes = {**payload, "updatedAt": now_iso()}
    if "role" in changes:
        changes["role"] = normalize_role(changes["role"])
    updated = update_json("users", user_id, changes)
    return _normalize_user(updated) if updated else None


def delete_user(user_id):
    return delete_json("users", user_id)
