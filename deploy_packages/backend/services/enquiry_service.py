from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import generate_id, now_iso


def list_enquiries():
    return load_json("enquiries")


def get_enquiry(enquiry_id):
    return next((item for item in list_enquiries() if str(item.get("id")) == str(enquiry_id)), None)


def create_enquiry(payload):
    enquiry = {
        "id": str(payload.get("id") or generate_id("enq_")),
        **payload,
        "createdAt": now_iso(),
    }
    return append_json("enquiries", enquiry)


def update_enquiry(enquiry_id, payload):
    return update_json("enquiries", enquiry_id, {**payload, "updatedAt": now_iso()})


def delete_enquiry(enquiry_id):
    return delete_json("enquiries", enquiry_id)
