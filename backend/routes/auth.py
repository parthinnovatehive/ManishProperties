from flask import Blueprint, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required

from services.auth_service import (
    authenticate,
    create_and_send_otp,
    google_login,
    register_account,
    verify_otp,
)
from utils.helpers import error_response, success_response
from utils.validators import validate_login_payload


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    validation_error = validate_login_payload(payload)
    if validation_error:
        return error_response(validation_error, 400)

    result, error = authenticate(payload["username"], payload["password"], payload.get("role"))
    if error:
        return error_response(error, 401)
    return success_response("Login successful", data=result, token=result["token"], refreshToken=result["refreshToken"], admin=result["admin"], user=result["user"])


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    result, error = register_account(payload)
    if error:
        return error_response(error, 400)
    return success_response("Registration successful", data=result, status_code=201, token=result["token"], refreshToken=result["refreshToken"], admin=result["admin"], user=result["user"])


@auth_bp.post("/google-login")
def google():
    result, error = google_login(request.get_json(silent=True) or {})
    if error:
        status = 400 if "required" in error else 401
        return error_response(error, status)
    return success_response("Login successful", data=result, token=result["token"], refreshToken=result["refreshToken"], admin=result["admin"], user=result["user"])


@auth_bp.post("/otp/send")
def send_otp():
    payload = request.get_json(silent=True) or {}
    phone = payload.get("phone")
    if not phone:
        return error_response("Phone number is required", 400)
    result = create_and_send_otp(phone)
    if not result["success"]:
        return error_response(result["message"], 400)
    return success_response(result["message"], simulated=result.get("simulated", False))


@auth_bp.post("/otp/verify")
def check_otp():
    payload = request.get_json(silent=True) or {}
    if not payload.get("phone") or not payload.get("otp"):
        return error_response("Phone number and OTP code are required", 400)
    result = verify_otp(payload["phone"], payload["otp"])
    if not result["success"]:
        return error_response(result["message"], 400)
    return success_response(result["message"])


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    claims = get_jwt()
    token = create_access_token(
        identity=get_jwt_identity(),
        additional_claims={
            "role": claims.get("role"),
            "username": claims.get("username"),
            "name": claims.get("name"),
        },
    )
    return success_response("Token refreshed", data={"token": token}, token=token)


@auth_bp.post("/logout")
@jwt_required(optional=True)
def logout():
    return success_response("Logout successful")


@auth_bp.get("/dashboard")
@jwt_required()
def dashboard():
    claims = get_jwt()
    admin = {
        "id": get_jwt_identity(),
        "role": claims.get("role"),
        "username": claims.get("username"),
        "name": claims.get("name"),
    }
    return success_response("Welcome Admin Dashboard", admin=admin, data=admin)
