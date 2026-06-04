from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from middleware.permissions import role_required
from services.json_service import append_json, delete_json, load_json, update_json
from services.property_service import list_properties
from utils.helpers import error_response, generate_id, now_iso, success_response


agents_bp = Blueprint("agents", __name__)


@agents_bp.get("/")
@agents_bp.get("")
@role_required("ADMIN", "SUPER_ADMIN")
def index():
    agents = load_json("agents")
    return success_response("Agents fetched", data=agents, agents=agents)


@agents_bp.post("/")
@agents_bp.post("")
@role_required("ADMIN", "SUPER_ADMIN")
def create():
    payload = request.get_json(silent=True) or {}
    agent = {
        "id": str(payload.get("id") or generate_id("agent_")),
        "username": payload.get("username") or payload.get("email"),
        "name": payload.get("name"),
        "email": payload.get("email") or payload.get("username"),
        "phone": payload.get("phone"),
        "role": "AGENT",
        "createdAt": now_iso(),
    }
    append_json("agents", agent)
    return success_response("Agent created", data=agent, agent=agent, status_code=201)


@agents_bp.get("/dashboard")
@role_required("AGENT", "ADMIN", "SUPER_ADMIN")
def dashboard():
    appointments = load_json("appointments")
    messages = load_json("messages")
    properties = list_properties()
    data = {
        "properties": properties,
        "appointments": appointments,
        "messages": messages,
        "leads": load_json("leads"),
        "stats": {
            "properties": len(properties),
            "appointments": len(appointments),
            "messages": len(messages),
        },
    }
    return success_response("Agent dashboard fetched", data=data)


@agents_bp.get("/<agent_id>")
@jwt_required()
def show(agent_id):
    agent = next((item for item in load_json("agents") if str(item.get("id")) == str(agent_id)), None)
    if not agent:
        return error_response("Agent not found", 404)
    return success_response("Agent fetched", data=agent, agent=agent)


@agents_bp.put("/<agent_id>")
@agents_bp.patch("/<agent_id>")
@role_required("AGENT", "ADMIN", "SUPER_ADMIN")
def update(agent_id):
    agent = update_json("agents", agent_id, {**(request.get_json(silent=True) or {}), "updatedAt": now_iso()})
    if not agent:
        return error_response("Agent not found", 404)
    return success_response("Agent updated", data=agent, agent=agent)


@agents_bp.delete("/<agent_id>")
@role_required("ADMIN", "SUPER_ADMIN")
def destroy(agent_id):
    if not delete_json("agents", agent_id):
        return error_response("Agent not found", 404)
    return success_response("Agent deleted")
