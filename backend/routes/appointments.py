from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from middleware.permissions import role_required
from services.appointment_service import (
    create_appointment,
    delete_appointment,
    get_appointment,
    list_appointments,
    update_appointment,
)
from utils.helpers import error_response, success_response


appointments_bp = Blueprint("appointments", __name__)


@appointments_bp.get("/")
@appointments_bp.get("")
@jwt_required()
def index():
    appointments = list_appointments()
    return success_response("Appointments fetched", data=appointments, appointments=appointments)


@appointments_bp.post("/")
@appointments_bp.post("")
@role_required("USER", "ADMIN", "SUPER_ADMIN")
def create():
    appointment = create_appointment(request.get_json(silent=True) or {})
    return success_response("Appointment created", data=appointment, appointment=appointment, status_code=201)


@appointments_bp.get("/<appointment_id>")
@jwt_required()
def show(appointment_id):
    appointment = get_appointment(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)
    return success_response("Appointment fetched", data=appointment, appointment=appointment)


@appointments_bp.put("/<appointment_id>")
@appointments_bp.patch("/<appointment_id>")
@role_required("AGENT", "ADMIN", "SUPER_ADMIN")
def update(appointment_id):
    appointment = update_appointment(appointment_id, request.get_json(silent=True) or {})
    if not appointment:
        return error_response("Appointment not found", 404)
    return success_response("Appointment updated", data=appointment, appointment=appointment)


@appointments_bp.delete("/<appointment_id>")
@role_required("ADMIN", "SUPER_ADMIN")
def destroy(appointment_id):
    if not delete_appointment(appointment_id):
        return error_response("Appointment not found", 404)
    return success_response("Appointment deleted")
