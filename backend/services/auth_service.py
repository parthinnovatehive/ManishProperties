import random
import time

from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.security import check_password_hash, generate_password_hash

from services.json_service import append_json, find_one, load_json, save_json
from utils.helpers import generate_id
from utils.validators import normalize_role, role_matches


OTP_STORE = {}
OTP_EXPIRY_SECONDS = 5 * 60
MAX_VERIFY_ATTEMPTS = 5


def _public_account(account):
    email = account.get("email") or account.get("username")
    return {
        "id": account["id"],
        "username": account["username"],
        "email": email,
        "role": account["role"],
        "name": account.get("name"),
        "phone": account.get("phone"),
    }


def ensure_default_admin():
    admins = load_json("admins")
    if admins:
        return
    append_json(
        "admins",
        {
            "id": generate_id("admin_"),
            "username": "rootadmin",
            "passwordHash": generate_password_hash("admin123"),
            "role": "SUPER_ADMIN",
            "name": "Root Admin",
            "phone": None,
        },
    )


def authenticate(username, password, requested_role=None):
    ensure_default_admin()
    account = find_account_by_username(username)
    if not account or not check_password_hash(account.get("passwordHash", ""), password):
        return None, "Invalid credentials"

    if requested_role and not role_matches(requested_role, account.get("role")):
        return None, f"Your account role does not match the selected role: {requested_role}"

    return issue_tokens(account), None


def register_account(payload, default_role="USER"):
    ensure_default_admin()
    username = str(payload.get("email") or payload.get("username") or "").strip()
    password = str(payload.get("password", ""))
    role = normalize_role(payload.get("role") or default_role)

    if not username or not password or not role:
        return None, "Email, password, and role are required"
    if role in {"ADMIN", "SUPER_ADMIN"}:
        return None, "Admin registration is not publicly available"
    if find_account_by_username(username):
        return None, "Email already exists"

    collection = collection_for_role(role)
    account = {
        "id": generate_id(f"{role.lower()}_"),
        "username": username,
        "email": username,
        "passwordHash": generate_password_hash(password),
        "role": role,
        "name": payload.get("name"),
        "phone": payload.get("phone"),
        "savedProperties": payload.get("savedProperties", []),
    }
    append_json(collection, account)
    return issue_tokens(account), None


def google_login(payload):
    token = payload.get("token")
    if not token:
        return None, "Google ID Token is required"

    return None, "Google login requires a configured Google token verifier"


def issue_tokens(account):
    identity = account["id"]
    claims = {
        "role": normalize_role(account.get("role")),
        "username": account.get("username"),
        "name": account.get("name"),
    }
    access_token = create_access_token(identity=identity, additional_claims=claims)
    refresh_token = create_refresh_token(identity=identity, additional_claims=claims)
    return {
        "token": access_token,
        "access_token": access_token,
        "refreshToken": refresh_token,
        "refresh_token": refresh_token,
        "admin": _public_account(account),
        "user": _public_account(account),
    }


def collection_for_role(role):
    normalized = normalize_role(role)
    if normalized in {"ADMIN", "SUPER_ADMIN"}:
        return "admins"
    if normalized == "AGENT":
        return "agents"
    return "users"


def find_account_by_username(username):
    for collection in ("admins", "agents", "users"):
        found = find_one(
            collection,
            lambda item: item.get("username") == username or item.get("email") == username,
        )
        if found:
            return found
    return None


def normalize_phone(phone):
    digits = "".join(char for char in str(phone) if char.isdigit())
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    return digits


def create_and_send_otp(phone):
    normalized = normalize_phone(phone)
    if len(normalized) != 10:
        return {"success": False, "message": "Invalid phone number. Please enter a valid 10-digit Indian mobile number."}

    existing = OTP_STORE.get(normalized)
    if existing and time.time() - existing["createdAt"] < 30:
        return {"success": False, "message": "Please wait 30 seconds before requesting a new OTP."}

    otp = "".join(str(random.randint(0, 9)) for _ in range(6))
    OTP_STORE[normalized] = {
        "otp": otp,
        "expiresAt": time.time() + OTP_EXPIRY_SECONDS,
        "attempts": 0,
        "createdAt": time.time(),
    }
    print(f"[OTP DEBUG] Phone: {normalized}, OTP: {otp}")
    return {
        "success": True,
        "message": "OTP logged to server console (SMS provider not configured). Check server logs.",
        "simulated": True,
    }


def verify_otp(phone, user_otp):
    normalized = normalize_phone(phone)
    entry = OTP_STORE.get(normalized)
    if not entry:
        return {"success": False, "message": "No OTP was sent to this number. Please request a new one."}
    if time.time() > entry["expiresAt"]:
        OTP_STORE.pop(normalized, None)
        return {"success": False, "message": "OTP has expired. Please request a new one."}
    if entry["attempts"] >= MAX_VERIFY_ATTEMPTS:
        OTP_STORE.pop(normalized, None)
        return {"success": False, "message": "Too many failed attempts. Please request a new OTP."}

    entry["attempts"] += 1
    if entry["otp"] != str(user_otp).strip():
        remaining = MAX_VERIFY_ATTEMPTS - entry["attempts"]
        return {"success": False, "message": f"Incorrect OTP. {remaining} attempt(s) remaining."}

    OTP_STORE.pop(normalized, None)
    return {"success": True, "message": "Phone number verified successfully!"}
