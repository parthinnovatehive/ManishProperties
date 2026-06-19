from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

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


@appointments_bp.get("/my")
@jwt_required()
def my_appointments():
    """Return only appointments belonging to the current user."""
    current_user_id = get_jwt_identity()
    all_appointments = list_appointments()
    user_appointments = [
        apt for apt in all_appointments
        if str(apt.get("userId")) == str(current_user_id)
    ]
    return success_response("User appointments fetched", data=user_appointments, appointments=user_appointments)


@appointments_bp.post("/")
@appointments_bp.post("")
@jwt_required()
def create():
    """Create an appointment — available to all authenticated users."""
    current_user_id = get_jwt_identity()
    payload = request.get_json(silent=True) or {}
    # Stamp the current user as the owner of this appointment
    if not payload.get("userId"):
        payload["userId"] = current_user_id
    appointment = create_appointment(payload)
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
@jwt_required()
def update(appointment_id):
    """Update an appointment.
    - Agents/Admins can update any appointment.
    - A USER may only cancel (set status=Cancelled) their own appointment.
    """
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    role = str(claims.get("role", "USER")).upper()
    current_user_id = get_jwt_identity()

    appointment = get_appointment(appointment_id)
    if not appointment:
        return error_response("Appointment not found", 404)

    payload = request.get_json(silent=True) or {}

    # Allow users to cancel only their own appointment
    if role not in {"AGENT", "ADMIN", "SUPER_ADMIN"}:
        if str(appointment.get("userId")) != str(current_user_id):
            return error_response("You can only modify your own appointments", 403)
        # Users may only update status to Cancelled
        allowed_fields = {"status"}
        if not set(payload.keys()).issubset(allowed_fields):
            return error_response("Users may only update appointment status", 403)
        if payload.get("status") not in {"Cancelled"}:
            return error_response("Users may only cancel appointments", 403)

    updated = update_appointment(appointment_id, payload)
    if not updated:
        return error_response("Appointment not found", 404)
    return success_response("Appointment updated", data=updated, appointment=updated)


@appointments_bp.delete("/<appointment_id>")
@role_required(["ADMIN", "SUPER_ADMIN"])
def destroy(appointment_id):
    if not delete_appointment(appointment_id):
        return error_response("Appointment not found", 404)
    return success_response("Appointment deleted")
