from flask import Blueprint, request

from middleware.permissions import role_required, super_admin_required
from services.json_service import append_json, delete_json, load_json, update_json
from services.property_service import list_properties
from utils.helpers import error_response, generate_id, now_iso, success_response
from utils.validators import normalize_role


admins_bp = Blueprint("admins", __name__)


@admins_bp.get("/")
@admins_bp.get("")
@super_admin_required
def index():
    admins = load_json("admins")
    return success_response("Admins fetched", data=admins, admins=admins)


@admins_bp.post("/")
@admins_bp.post("")
@super_admin_required
def create():
    payload = request.get_json(silent=True) or {}
    admin = {
        "id": str(payload.get("id") or generate_id("admin_")),
        "username": payload.get("username"),
        "name": payload.get("name"),
        "phone": payload.get("phone"),
        "role": normalize_role(payload.get("role", "ADMIN")),
        "createdAt": now_iso(),
    }
    append_json("admins", admin)
    return success_response("Admin created", data=admin, admin=admin, status_code=201)


@admins_bp.get("/dashboard")
@role_required("ADMIN", "SUPER_ADMIN")
def dashboard():
    properties = list_properties()
    users = load_json("users")
    agents = load_json("agents")
    complaints = load_json("complaints")
    data = {
        "properties": properties,
        "users": users,
        "agents": agents,
        "complaints": complaints,
        "appointments": load_json("appointments"),
        "stats": {
            "properties": len(properties),
            "users": len(users),
            "agents": len(agents),
            "complaints": len(complaints),
        },
    }
    return success_response("Admin dashboard fetched", data=data)


@admins_bp.get("/<admin_id>")
@super_admin_required
def show(admin_id):
    admin = next((item for item in load_json("admins") if str(item.get("id")) == str(admin_id)), None)
    if not admin:
        return error_response("Admin not found", 404)
    return success_response("Admin fetched", data=admin, admin=admin)


@admins_bp.put("/<admin_id>")
@admins_bp.patch("/<admin_id>")
@super_admin_required
def update(admin_id):
    changes = {**(request.get_json(silent=True) or {}), "updatedAt": now_iso()}
    if "role" in changes:
        changes["role"] = normalize_role(changes["role"])
    admin = update_json("admins", admin_id, changes)
    if not admin:
        return error_response("Admin not found", 404)
    return success_response("Admin updated", data=admin, admin=admin)


@admins_bp.delete("/<admin_id>")
@super_admin_required
def destroy(admin_id):
    if not delete_json("admins", admin_id):
        return error_response("Admin not found", 404)
    return success_response("Admin deleted")
