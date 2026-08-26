from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import generate_id, now_iso


def _safe_fk(val):
    return val if val and str(val).strip() != "" else None

def list_appointments():
    return load_json("appointments")


def get_appointment(appointment_id):
    return next((item for item in list_appointments() if str(item.get("id")) == str(appointment_id)), None)


def create_appointment(payload):
    appointment = {
        "id": str(payload.get("id") or generate_id("apt_")),
        **payload,
        "propertyId": _safe_fk(payload.get("propertyId")),
        "userId": _safe_fk(payload.get("userId")),
        "agent_id": _safe_fk(payload.get("agent_id")),
        "createdAt": now_iso(),
    }
    return append_json("appointments", appointment)


def update_appointment(appointment_id, payload):
    updates = {**payload, "updatedAt": now_iso()}
    if "propertyId" in updates: updates["propertyId"] = _safe_fk(updates["propertyId"])
    if "userId" in updates: updates["userId"] = _safe_fk(updates["userId"])
    if "agent_id" in updates: updates["agent_id"] = _safe_fk(updates["agent_id"])
    return update_json("appointments", appointment_id, updates)


def delete_appointment(appointment_id):
    return delete_json("appointments", appointment_id)
