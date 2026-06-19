from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from middleware.permissions import role_required, super_admin_required
from services.json_service import append_json, delete_json, load_json, update_json
from services.property_service import list_properties
from utils.helpers import error_response, generate_id, now_iso, success_response
from utils.validators import normalize_role
import jwt
from config import Config


admins_bp = Blueprint("admins", __name__)


@admins_bp.get("/")
@admins_bp.get("")
@role_required(["ADMIN", "SUPER_ADMIN"])
def index():
    admins = load_json("admins")
    return success_response("Admins fetched", data=admins, admins=admins)


@admins_bp.post("/")
@admins_bp.post("")
@super_admin_required
def create():
    payload = request.get_json(silent=True) or {}

    email = str(payload.get("email") or "").strip()
    password = str(payload.get("password") or "").strip()

    if not email:
        return error_response("Email is required", 400)

    if not password:
        return error_response("Password is required", 400)

    admins = load_json("admins")

    existing = next(
        (
            item
            for item in admins
            if item.get("email") == email
            or item.get("username") == email
        ),
        None,
    )

    if existing:
        return error_response("Admin already exists", 400)

    admin = {
        "id": str(payload.get("id") or generate_id("admin_")),
        "username": email,
        "email": email,
        "passwordHash": generate_password_hash(password),
        "name": payload.get("name"),
        "phone": payload.get("phone"),
        "role": normalize_role(payload.get("role", "ADMIN")),
        "status": payload.get("status", "active"),
        "createdAt": now_iso(),
    }

    append_json("admins", admin)

    return success_response(
        "Admin created",
        data=admin,
        admin=admin,
        status_code=201,
    )

@admins_bp.get("/dashboard")
@role_required(["ADMIN", "SUPER_ADMIN"])  # ✅ Pass as a list
def dashboard():
    properties = list_properties()
    users = load_json("users")
    agents = load_json("agents")
    complaints = load_json("complaints")
    data = {
        "properties": properties,
        "users": users,
        "agents": agents,
        "complaints": complaints,
        "appointments": load_json("appointments"),
        "stats": {
            "properties": len(properties),
            "users": len(users),
            "agents": len(agents),
            "complaints": len(complaints),
        },
    }
    return success_response("Admin dashboard fetched", data=data)


@admins_bp.get("/<admin_id>")
@role_required(["ADMIN", "SUPER_ADMIN"])
def show(admin_id):
    token = request.headers.get('Authorization', '').split(' ')[-1]
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        requester_id = payload.get("sub") or payload.get("identity")
        requester_role = (payload.get("role") or "").upper()
        if requester_role != "SUPER_ADMIN" and requester_id != admin_id:
            return jsonify({"message": "Insufficient permissions!"}), 403
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token!"}), 401

    admin = next((item for item in load_json("admins") if str(item.get("id")) == str(admin_id)), None)
    if not admin:
        return error_response("Admin not found", 404)
    return success_response("Admin fetched", data=admin, admin=admin)


@admins_bp.put("/<admin_id>")
@admins_bp.patch("/<admin_id>")
@role_required(["ADMIN", "SUPER_ADMIN"])
def update(admin_id):
    token = request.headers.get('Authorization', '').split(' ')[-1]
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        requester_id = payload.get("sub") or payload.get("identity")
        requester_role = (payload.get("role") or "").upper()
        if requester_role != "SUPER_ADMIN" and requester_id != admin_id:
            return jsonify({"message": "Insufficient permissions!"}), 403
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token!"}), 401

    changes = {**(request.get_json(silent=True) or {}), "updatedAt": now_iso()}

    if "role" in changes:
        changes["role"] = normalize_role(changes["role"])

    if "password" in changes:
        changes["passwordHash"] = generate_password_hash(changes["password"])
        del changes["password"]

    admin = update_json("admins", admin_id, changes)

    if not admin:
        return error_response("Admin not found", 404)

    return success_response(
        "Admin updated",
        data=admin,
        admin=admin,
    )

@admins_bp.delete("/<admin_id>")
@super_admin_required
def destroy(admin_id):
    if not delete_json("admins", admin_id):
        return error_response("Admin not found", 404)
    return success_response("Admin deleted")
