import random
import time

import requests
from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.security import check_password_hash, generate_password_hash

from config import Config
from services.json_service import append_json, find_one, load_json, save_json
from utils.helpers import generate_id
from utils.validators import normalize_role, role_matches


OTP_STORE = {}
OTP_EXPIRY_SECONDS = 5 * 60
MAX_VERIFY_ATTEMPTS = 5
SUSPENDED_ACCOUNT_MESSAGE = "Your account has been suspended. Please contact support."
SUSPENDED_STATUS_VALUES = {"SUSPENDED", "INACTIVE", "DISABLED", "DEACTIVATED", "BLOCKED"}


def _public_account(account):
    email = account.get("email") or account.get("username")
    return {
        "id": account["id"],
        "username": account["username"],
        "email": email,
        "role": normalize_role(account.get("role")),
        "name": account.get("name"),
        "phone": account.get("phone"),
        "status": normalize_status(account.get("status")),
        "city_id": account.get("city_id"),
        "sub_area_ids": account.get("sub_area_ids", []),  # Changed to array
    }


def normalize_status(status):
    return str(status or "ACTIVE").upper()


def is_false_flag(value):
    if value is False:
        return True
    if isinstance(value, str):
        return value.strip().lower() in {"false", "0", "no", "inactive", "disabled", "suspended"}
    return False


def is_suspended(account):
    if not account:
        return False

    if is_false_flag(account.get("isActive")):
        return True

    if is_false_flag(account.get("active")):
        return True

    return normalize_status(account.get("status")) in SUSPENDED_STATUS_VALUES


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
    if not account or not account.get("passwordHash") or not check_password_hash(account.get("passwordHash"), password):
        return None, "Invalid credentials", 401

    if requested_role and not role_matches(requested_role, account.get("role")):
        return None, f"Your account role does not match the selected role: {requested_role}", 401

    if is_suspended(account):
        return None, SUSPENDED_ACCOUNT_MESSAGE, 403

    return issue_tokens(account), None, None


def register_account(payload, default_role="USER"):
    ensure_default_admin()
    username = str(payload.get("email") or payload.get("username") or "").strip()
    password = str(payload.get("password", ""))
    role = normalize_role(payload.get("role") or default_role)

    # 🔍 DEBUG: Log incoming data
    print(f"🔍 DEBUG: register_account called with:")
    print(f"  - role: {role}")
    print(f"  - username: {username}")
    print(f"  - sub_area_ids from payload: {payload.get('sub_area_ids')}")
    print(f"  - sub_area_ids type: {type(payload.get('sub_area_ids'))}")

    if not username or not password or not role:
        return None, "Email, password, and role are required"
    if role in ["ADMIN", "SUPER_ADMIN"]:
        return None, "Admin accounts can only be created by platform owners."
    if find_account_by_username(username):
        return None, "Email already exists"

    # Set status based on role
    if role == "AGENT":
        status = "PENDING"
    else:
        status = "ACTIVE"

    collection = collection_for_role(role)
    account = {
        "id": generate_id(f"{role.lower()}_"),
        "username": username,
        "email": username,
        "passwordHash": generate_password_hash(password),
        "role": role,
        "name": payload.get("name"),
        "phone": payload.get("phone"),
        "status": status,
        "savedProperties": payload.get("savedProperties", []),
        "createdAt": __import__('datetime').datetime.now().isoformat(),
    }

    # ✅ Add city and subarea IDs for AGENT role
    if role == "AGENT":
        city_id = payload.get("city_id")
        sub_area_ids = payload.get("sub_area_ids", [])
        
        # ✅ Handle different formats of sub_area_ids
        if isinstance(sub_area_ids, str):
            # Try to parse as JSON array if it looks like one
            if sub_area_ids.startswith('['):
                try:
                    import json
                    sub_area_ids = json.loads(sub_area_ids)
                except:
                    # If parsing fails, treat as single string
                    sub_area_ids = [sub_area_ids]
            else:
                # Treat as single string
                sub_area_ids = [sub_area_ids]
        
        # ✅ Ensure it's a list of strings
        if not isinstance(sub_area_ids, list):
            sub_area_ids = []
        else:
            # Filter out empty values and ensure strings
            sub_area_ids = [str(sid) for sid in sub_area_ids if sid]
        
        if city_id:
            account["city_id"] = str(city_id)
        
        if sub_area_ids:
            account["sub_area_ids"] = sub_area_ids
            
        print(f"🔍 DEBUG: Agent account data: {account}")
        print(f"🔍 DEBUG: sub_area_ids to save: {account.get('sub_area_ids')}")

    append_json(collection, account)
    
    # ✅ After saving, verify it was saved correctly
    saved_account = find_account_by_username(username)
    if saved_account:
        print(f"🔍 DEBUG: Account saved successfully: {saved_account.get('id')}")
        print(f"🔍 DEBUG: Saved sub_area_ids: {saved_account.get('sub_area_ids')}")
    else:
        print(f"❌ ERROR: Failed to save account")
    
    return issue_tokens(account), None


def _verify_google_token(token):
    """Verify a Google access token and return user info."""
    response = requests.get(
        "https://www.googleapis.com/oauth2/v1/userinfo",
        params={"access_token": token},
        timeout=10,
    )
    if response.status_code != 200:
        return None, "Invalid or expired Google token"
    return response.json(), None


def google_login(payload):
    token = payload.get("token")
    if not token:
        return None, "Google access token is required"

    user_info, error = _verify_google_token(token)
    if error:
        return None, error

    email = user_info.get("email")
    if not email:
        return None, "Google account has no email associated"

    existing = find_account_by_username(email)
    if existing:
        if is_suspended(existing):
            return None, SUSPENDED_ACCOUNT_MESSAGE

        requested_role = payload.get("role")
        if requested_role and not role_matches(requested_role, existing.get("role")):
            return None, f"Account exists with a different role"

        return issue_tokens(existing), None

    return {
        "requiresRegistration": True,
        "googleUser": {
            "email": email,
            "name": user_info.get("name"),
        },
    }, None


def google_register(payload):
    token = payload.get("token")
    if not token:
        return None, "Google access token is required"

    user_info, error = _verify_google_token(token)
    if error:
        return None, error

    email = user_info.get("email")
    if not email:
        return None, "Google account has no email"

    if find_account_by_username(email):
        return None, "An account with this email already exists. Please sign in."

    name = payload.get("name") or user_info.get("name")
    phone = payload.get("phone")
    role = normalize_role(payload.get("role", "USER"))

    if not phone:
        return None, "Phone number is required"
    if role not in ("USER", "AGENT"):
        return None, "Invalid role. Must be USER or AGENT."

    status = "PENDING" if role == "AGENT" else "ACTIVE"
    collection = collection_for_role(role)

    account = {
        "id": generate_id(f"{role.lower()}_"),
        "username": email,
        "email": email,
        "passwordHash": None,
        "role": role,
        "name": name,
        "phone": phone,
        "status": status,
        "savedProperties": [],
        "createdAt": __import__("datetime").datetime.now().isoformat(),
    }

    if role == "AGENT":
        city_id = payload.get("city_id")
        sub_area_ids = payload.get("sub_area_ids", [])
        if isinstance(sub_area_ids, str):
            if sub_area_ids.startswith("["):
                try:
                    import json
                    sub_area_ids = json.loads(sub_area_ids)
                except Exception:
                    sub_area_ids = [sub_area_ids]
            else:
                sub_area_ids = [sub_area_ids]
        if not isinstance(sub_area_ids, list):
            sub_area_ids = []
        else:
            sub_area_ids = [str(sid) for sid in sub_area_ids if sid]
        if city_id:
            account["city_id"] = str(city_id)
        if sub_area_ids:
            account["sub_area_ids"] = sub_area_ids

    append_json(collection, account)
    return issue_tokens(account), None


def issue_tokens(account):
    identity = account["id"]
    claims = {
        "role": normalize_role(account.get("role")),
        "username": account.get("username"),
        "name": account.get("name"),
        "status": normalize_status(account.get("status")),
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


def find_account_by_id(account_id):
    for collection in ("admins", "agents", "users"):
        found = find_one(
            collection,
            lambda item: str(item.get("id")) == str(account_id),
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