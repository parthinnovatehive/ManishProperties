from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request


def current_identity():
    verify_jwt_in_request()
    claims = get_jwt()
    return {
        "id": get_jwt_identity(),
        "role": claims.get("role"),
        "username": claims.get("username"),
        "name": claims.get("name"),
    }
