from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from middleware.permissions import role_required
from services.user_service import create_user, delete_user, get_user, list_users, update_user
from services.json_service import update_json, load_json
from utils.helpers import error_response, now_iso, success_response


users_bp = Blueprint("users", __name__)


@users_bp.get("/")
@users_bp.get("")
@role_required(["ADMIN", "SUPER_ADMIN"])
def index():
    users = list_users()
    return success_response("Users fetched", data=users, users=users)


@users_bp.get("/me")
@jwt_required()
def me():
    """Return the currently authenticated user's own profile."""
    current_user_id = get_jwt_identity()
    # Search across users collection
    user = get_user(current_user_id)
    if not user:
        # Fallback: search agents collection too
        from services.json_service import find_one
        user = find_one("agents", lambda item: str(item.get("id")) == str(current_user_id))
    if not user:
        return error_response("User not found", 404)
    # Strip passwordHash from response
    safe = {k: v for k, v in user.items() if k != "passwordHash"}
    return success_response("User fetched", data=safe, user=safe)


@users_bp.patch("/me/saved-properties")
@jwt_required()
def toggle_saved_property():
    """Toggle a property in the current user's savedProperties list."""
    current_user_id = get_jwt_identity()
    payload = request.get_json(silent=True) or {}
    property_id = str(payload.get("propertyId", "")).strip()
    if not property_id:
        return error_response("propertyId is required", 400)

    user = get_user(current_user_id)
    if not user:
        return error_response("User not found", 404)

    saved = [str(pid) for pid in (user.get("savedProperties") or [])]
    if property_id in saved:
        saved.remove(property_id)
        action = "removed"
    else:
        saved.append(property_id)
        action = "saved"

    updated = update_json("users", current_user_id, {"savedProperties": saved, "updatedAt": now_iso()})
    safe = {k: v for k, v in (updated or user).items() if k != "passwordHash"}
    return success_response(f"Property {action}", data=safe, user=safe, saved=(action == "saved"))


@users_bp.post("/")
@users_bp.post("")
def create():
    user = create_user(request.get_json(silent=True) or {})
    return success_response("User created", data=user, user=user, status_code=201)


@users_bp.get("/<user_id>")
@jwt_required()
def show(user_id):
    """Get a single user by ID - accessible by authenticated users (including agents)"""
    user = get_user(user_id)
    if not user:
        return error_response("User not found", 404)
    safe = {k: v for k, v in user.items() if k != "passwordHash"}
    return success_response("User fetched", data=safe, user=safe)


@users_bp.put("/<user_id>")
@users_bp.patch("/<user_id>")
@role_required(["USER", "ADMIN", "SUPER_ADMIN"])
def update(user_id):
    user = update_user(user_id, request.get_json(silent=True) or {})
    if not user:
        return error_response("User not found", 404)
    return success_response("User updated", data=user, user=user)


@users_bp.delete("/<user_id>")
@role_required(["ADMIN", "SUPER_ADMIN"])
def destroy(user_id):
    if not delete_user(user_id):
        return error_response("User not found", 404)
    return success_response("User deleted")