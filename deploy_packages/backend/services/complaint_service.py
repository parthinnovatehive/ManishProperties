from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import generate_id, now_iso


def list_complaints():
    return load_json("complaints")


def get_complaint(complaint_id):
    return next((item for item in list_complaints() if str(item.get("id")) == str(complaint_id)), None)


def create_complaint(payload):
    complaint = {
        "id": str(payload.get("id") or generate_id("comp_")),
        "status": payload.get("status") or "Open",
        "priority": payload.get("priority") or "Medium",
        **payload,
        "createdAt": now_iso(),
    }
    return append_json("complaints", complaint)


def update_complaint(complaint_id, payload):
    return update_json("complaints", complaint_id, {**payload, "updatedAt": now_iso()})


def delete_complaint(complaint_id):
    return delete_json("complaints", complaint_id)
