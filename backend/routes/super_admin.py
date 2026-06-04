from flask import Blueprint

from middleware.permissions import super_admin_required
from services.json_service import load_json
from services.property_service import list_properties
from utils.helpers import success_response


super_admin_bp = Blueprint("super_admin", __name__)


@super_admin_bp.get("/dashboard")
@super_admin_required
def dashboard():
    data = {
        "admins": load_json("admins"),
        "agents": load_json("agents"),
        "users": load_json("users"),
        "properties": list_properties(),
        "appointments": load_json("appointments"),
        "complaints": load_json("complaints"),
        "messages": load_json("messages"),
        "settings": load_json("settings", default={}),
    }
    data["stats"] = {key: len(value) for key, value in data.items() if isinstance(value, list)}
    return success_response("Super admin dashboard fetched", data=data)


@super_admin_bp.get("/monitoring")
@super_admin_required
def monitoring():
    data = {
        "status": "healthy",
        "storage": "json",
        "services": ["auth", "properties", "users", "agents", "appointments", "complaints", "messages"],
    }
    return success_response("Platform monitoring fetched", data=data)


@super_admin_bp.get("/settings")
@super_admin_required
def settings():
    return success_response("System settings fetched", data=load_json("settings", default={}))
