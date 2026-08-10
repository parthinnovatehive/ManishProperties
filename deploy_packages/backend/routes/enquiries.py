from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from services.enquiry_service import (
    create_enquiry,
    delete_enquiry,
    get_enquiry,
    list_enquiries,
    update_enquiry,
)
from utils.helpers import error_response, generate_id, now_iso, success_response


enquiries_bp = Blueprint("enquiries", __name__)


@enquiries_bp.get("/")
@enquiries_bp.get("")
@jwt_required()
def index():
    enquiries = list_enquiries()
    return success_response("Enquiries fetched", data=enquiries, enquiries=enquiries)


@enquiries_bp.post("/")
@enquiries_bp.post("")
def create():
    payload = request.get_json(silent=True) or {}
    enquiry = create_enquiry(payload)
    return success_response("Enquiry submitted", data=enquiry, status_code=201)


@enquiries_bp.get("/<enquiry_id>")
@jwt_required()
def show(enquiry_id):
    enquiry = get_enquiry(enquiry_id)
    if not enquiry:
        return error_response("Enquiry not found", 404)
    return success_response("Enquiry fetched", data=enquiry)


@enquiries_bp.patch("/<enquiry_id>")
@enquiries_bp.put("/<enquiry_id>")
@jwt_required()
def update(enquiry_id):
    payload = request.get_json(silent=True) or {}
    updated = update_enquiry(enquiry_id, payload)
    if not updated:
        return error_response("Enquiry not found", 404)
    return success_response("Enquiry updated", data=updated)


@enquiries_bp.delete("/<enquiry_id>")
@jwt_required()
def destroy(enquiry_id):
    if not delete_enquiry(enquiry_id):
        return error_response("Enquiry not found", 404)
    return success_response("Enquiry deleted")
