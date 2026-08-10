from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from middleware.permissions import role_required
from services.complaint_service import create_complaint, delete_complaint, get_complaint, list_complaints, update_complaint
from utils.helpers import error_response, success_response


complaints_bp = Blueprint("complaints", __name__)


@complaints_bp.get("/")
@complaints_bp.get("")
@jwt_required()
def index():
    complaints = list_complaints()
    return success_response("Complaints fetched", data=complaints, complaints=complaints)


@complaints_bp.post("/")
@complaints_bp.post("")
@role_required(["USER", "ADMIN", "SUPER_ADMIN"])
def create():
    complaint = create_complaint(request.get_json(silent=True) or {})
    return success_response("Complaint created", data=complaint, complaint=complaint, status_code=201)


@complaints_bp.get("/<complaint_id>")
@jwt_required()
def show(complaint_id):
    complaint = get_complaint(complaint_id)
    if not complaint:
        return error_response("Complaint not found", 404)
    return success_response("Complaint fetched", data=complaint, complaint=complaint)


@complaints_bp.put("/<complaint_id>")
@complaints_bp.patch("/<complaint_id>")
@role_required(["ADMIN", "SUPER_ADMIN"])
def update(complaint_id):
    complaint = update_complaint(complaint_id, request.get_json(silent=True) or {})
    if not complaint:
        return error_response("Complaint not found", 404)
    return success_response("Complaint updated", data=complaint, complaint=complaint)


@complaints_bp.delete("/<complaint_id>")
@role_required(["ADMIN", "SUPER_ADMIN"])
def destroy(complaint_id):
    if not delete_complaint(complaint_id):
        return error_response("Complaint not found", 404)
    return success_response("Complaint deleted")
