from flask import Blueprint, request

from middleware.permissions import role_required
from services.user_service import create_user, delete_user, get_user, list_users, update_user
from utils.helpers import error_response, success_response


users_bp = Blueprint("users", __name__)


@users_bp.get("/")
@users_bp.get("")
@role_required("ADMIN", "SUPER_ADMIN")
def index():
    users = list_users()
    return success_response("Users fetched", data=users, users=users)


@users_bp.post("/")
@users_bp.post("")
def create():
    user = create_user(request.get_json(silent=True) or {})
    return success_response("User created", data=user, user=user, status_code=201)


@users_bp.get("/<user_id>")
@role_required("USER", "ADMIN", "SUPER_ADMIN")
def show(user_id):
    user = get_user(user_id)
    if not user:
        return error_response("User not found", 404)
    return success_response("User fetched", data=user, user=user)


@users_bp.put("/<user_id>")
@users_bp.patch("/<user_id>")
@role_required("USER", "ADMIN", "SUPER_ADMIN")
def update(user_id):
    user = update_user(user_id, request.get_json(silent=True) or {})
    if not user:
        return error_response("User not found", 404)
    return success_response("User updated", data=user, user=user)


@users_bp.delete("/<user_id>")
@role_required("ADMIN", "SUPER_ADMIN")
def destroy(user_id):
    if not delete_user(user_id):
        return error_response("User not found", 404)
    return success_response("User deleted")
