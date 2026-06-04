MODERATION_STATUSES = {"PENDING", "APPROVED", "REJECTED"}

REQUIRED_PROPERTY_FIELDS = [
    "title",
    "subtitle",
    "description",
    "price",
    "priceNum",
    "city",
    "location",
    "type",
    "beds",
    "bathrooms",
    "area",
]

NUMERIC_PROPERTY_FIELDS = ["priceNum", "beds", "bathrooms", "area"]


def validate_login_payload(payload):
    username = str(payload.get("username", "")).strip()
    password = str(payload.get("password", ""))

    if len(username) < 3:
        return "Username too short"
    if len(username) > 50:
        return "Username too long"
    if len(password) < 6:
        return "Password too short"
    if len(password) > 100:
        return "Password too long"
    return None


def validate_property_payload(payload):
    missing = [
        field
        for field in REQUIRED_PROPERTY_FIELDS
        if payload.get(field) is None or payload.get(field) == ""
    ]
    if missing:
        return f"Missing required fields: {', '.join(missing)}"

    invalid = []
    for field in NUMERIC_PROPERTY_FIELDS:
        try:
            float(payload.get(field))
        except (TypeError, ValueError):
            invalid.append(field)

    if invalid:
        return f"Invalid numeric fields: {', '.join(invalid)}"
    return None


def normalize_role(role):
    if not role:
        return "USER"
    return str(role).upper().replace("-", "_")


def role_matches(requested_role, stored_role):
    if not requested_role:
        return True

    requested = normalize_role(requested_role)
    stored = normalize_role(stored_role)
    return requested == stored or (requested == "ADMIN" and stored in {"ADMIN", "SUPER_ADMIN"})
