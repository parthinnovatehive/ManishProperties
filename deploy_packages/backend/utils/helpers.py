from datetime import datetime, timezone
from uuid import uuid4

from flask import jsonify


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def generate_id(prefix=""):
    value = uuid4().hex
    return f"{prefix}{value}" if prefix else value


def success_response(message="Operation successful", data=None, status_code=200, **extra):
    payload = {
        "success": True,
        "message": message,
    }
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return jsonify(payload), status_code


def error_response(message="Error description", status_code=400, **extra):
    payload = {
        "success": False,
        "message": message,
    }
    payload.update(extra)
    return jsonify(payload), status_code
