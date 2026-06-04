from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import generate_id, now_iso


def list_appointments():
    return load_json("appointments")


def get_appointment(appointment_id):
    return next((item for item in list_appointments() if str(item.get("id")) == str(appointment_id)), None)


def create_appointment(payload):
    appointment = {
        "id": str(payload.get("id") or generate_id("apt_")),
        **payload,
        "createdAt": now_iso(),
    }
    return append_json("appointments", appointment)


def update_appointment(appointment_id, payload):
    return update_json("appointments", appointment_id, {**payload, "updatedAt": now_iso()})


def delete_appointment(appointment_id):
    return delete_json("appointments", appointment_id)
