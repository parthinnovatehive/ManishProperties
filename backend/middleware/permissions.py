from functools import wraps

from flask_jwt_extended import get_jwt, verify_jwt_in_request

from utils.helpers import error_response
from utils.validators import normalize_role


def role_required(*allowed_roles):
    normalized_allowed = {normalize_role(role) for role in allowed_roles}

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = normalize_role(claims.get("role"))
            if role not in normalized_allowed:
                return error_response("Access denied. Required role missing.", 403)
            return fn(*args, **kwargs)

        return wrapper

    return decorator


admin_required = role_required("ADMIN", "SUPER_ADMIN")
super_admin_required = role_required("SUPER_ADMIN")
