from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import generate_id, now_iso
from utils.validators import MODERATION_STATUSES, validate_property_payload


def _safe_int(val, default=None):
    try:
        return int(float(val)) if val is not None and str(val).strip() != "" else default
    except (ValueError, TypeError):
        return default

def _safe_float(val, default=None):
    try:
        return float(val) if val is not None and str(val).strip() != "" else default
    except (ValueError, TypeError):
        return default

def _safe_fk(val):
    """Ensure empty strings are converted to None for strict PostgreSQL Foreign Keys."""
    return val if val and str(val).strip() != "" else None


def _normalize_property(payload, status="PENDING"):
    images = payload.get("images")
    if images is None:
        images = payload.get("imgs", [])
    image = payload.get("image") or payload.get("img") or (images[0] if images else "")

    result = dict(payload)
    
    # Remove keys that do not exist in the Supabase schema
    for key in ["rera", "rejectReason", "featuredRejectionReason"]:
        result.pop(key, None)

    result.update({
        "id": str(payload.get("id") or generate_id("prop_")),
        "category": payload.get("category", "residential"),
        "title": payload.get("title"),
        "subtitle": payload.get("subtitle"),
        "description": payload.get("description"),
        "price": payload.get("price"),
        "priceNum": _safe_float(payload.get("priceNum")),
        "city": payload.get("city"),
        "city_id": _safe_fk(payload.get("city_id")),
        "sub_area_id": _safe_fk(payload.get("sub_area_id")),
        "state": payload.get("state"),
        "location": payload.get("location"),
        "fullLocation": payload.get("fullLocation"),
        "pincode": payload.get("pincode"),
        "type": payload.get("type"),
        "listingType": payload.get("listingType"),
        "beds": _safe_int(payload.get("beds")),
        "bathrooms": _safe_int(payload.get("bathrooms")),
        "baths": _safe_int(payload.get("baths") or payload.get("bathrooms")),
        "area": _safe_float(payload.get("area")),
        "furnishing": payload.get("furnishing"),
        "amenities": payload.get("amenities") if isinstance(payload.get("amenities"), list) else [],
        "images": images if isinstance(images, list) else [],
        "imgs": images if isinstance(images, list) else [],
        "image": image,
        "img": image,
        "cloudinaryImages": payload.get("cloudinaryImages") if isinstance(payload.get("cloudinaryImages"), list) else [],
        "builder": payload.get("builder") or "Manish Properties",
        "rating": _safe_float(payload.get("rating"), 0),
        "reviews": _safe_int(payload.get("reviews"), 0),
        "featured": bool(payload.get("featured", False)),
        "isNew": bool(payload.get("isNew", True)),

        # Lister / owner fields
        "lister_name": payload.get("lister_name"),

        # Views
        "views": _safe_int(payload.get("views"), 0),

        # Moderation fields
        "status": status,
        "moderationStatus": status,

        # Featured request fields
        "featuredRequested": bool(payload.get("featuredRequested", False)),
        "requested_for": _safe_int(payload.get("requested_for")),
        "granted_for": _safe_int(payload.get("granted_for")),
        "featuredRequestDate": payload.get("featuredRequestDate"),
        "featuredPaymentStatus": payload.get("featuredPaymentStatus"),
        "featuredPaymentProof": payload.get("featuredPaymentProof"),
        "featuredPaymentAmount": _safe_float(payload.get("featuredPaymentAmount")),
        "featuredApprovedBy": payload.get("featuredApprovedBy"),
        "featuredApprovedAt": payload.get("featuredApprovedAt"),
        "featuredExpiryDate": payload.get("featuredExpiryDate"),
        "featuredExpired": bool(payload.get("featuredExpired", False)),

        # Location / geo
        "coordinates": payload.get("coordinates") if isinstance(payload.get("coordinates"), dict) else {},
        "nearbyAmenities": payload.get("nearbyAmenities") if isinstance(payload.get("nearbyAmenities"), (list, dict)) else [],

        # Timestamps
        "createdAt": payload.get("createdAt") or now_iso(),
        "updatedAt": now_iso(),
    })

    if result.get("category") == "commercial":
        result["officeType"] = payload.get("officeType")
        result["pantry"] = "yes" if payload.get("pantry") else "no"
        result["washrooms"] = _safe_int(payload.get("washrooms"))
        result["powerBackup"] = "yes" if payload.get("powerBackup") else "no"
        result["cabinCount"] = _safe_int(payload.get("cabinCount"))
        result["conferenceRoom"] = "yes" if payload.get("conferenceRoom") else "no"
        result["parking"] = str(payload.get("parking")) if payload.get("parking") is not None else None

    return result


def list_properties(status=None, public_only=False):
    properties = load_json("properties")
    if public_only:
        properties = [item for item in properties if item.get("status") == "APPROVED"]
    elif status:
        normalized = status.upper()
        properties = [item for item in properties if item.get("status") == normalized]
    return sorted(properties, key=lambda item: item.get("createdAt") or "", reverse=True)


def get_property(property_id, public_only=False):
    for item in load_json("properties"):
        if str(item.get("id")) == str(property_id):
            if public_only and item.get("status") != "APPROVED":
                return None
            return item
    return None


def create_property(payload, status="PENDING"):
    validation_message = validate_property_payload(payload)
    if validation_message:
        return None, validation_message
    property_item = _normalize_property(payload, status)
    try:
        append_json("properties", property_item)
    except Exception as e:
        return None, f"Failed to save property to database: {str(e)}"
    return property_item, None


def update_property(property_id, payload):
    current = get_property(property_id)
    if not current:
        return None
    merged = {**current, **payload, "id": current["id"], "updatedAt": now_iso()}
    if "bathrooms" in merged:
        merged["baths"] = merged["bathrooms"]
    return update_json("properties", property_id, merged)


def set_property_status(property_id, status):
    normalized = status.upper()
    if normalized not in MODERATION_STATUSES:
        return None
    return update_json("properties", property_id, {"status": normalized, "moderationStatus": normalized, "updatedAt": now_iso()})


def set_featured(property_id, featured=None):
    current = get_property(property_id)
    if not current:
        return None
    next_value = (not current.get("featured", False)) if featured is None else bool(featured)
    return update_json("properties", property_id, {"featured": next_value, "updatedAt": now_iso()})


def delete_property(property_id):
    return delete_json("properties", property_id)
