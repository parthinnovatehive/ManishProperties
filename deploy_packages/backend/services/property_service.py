from services.json_service import append_json, delete_json, load_json, update_json
from utils.helpers import generate_id, now_iso
from utils.validators import MODERATION_STATUSES, validate_property_payload


def _normalize_property(payload, status="PENDING"):
    images = payload.get("images")
    if images is None:
        images = payload.get("imgs", [])
    image = payload.get("image") or payload.get("img") or (images[0] if images else "")

    result = dict(payload)
    result.update({
        "id": str(payload.get("id") or generate_id("prop_")),
        "category": payload.get("category", "residential"),
        "title": payload.get("title"),
        "subtitle": payload.get("subtitle"),
        "description": payload.get("description"),
        "price": payload.get("price"),
        "priceNum": float(payload.get("priceNum")) if payload.get("priceNum") else 0,
        "city": payload.get("city"),
        "city_id": payload.get("city_id"),
        "sub_area_id": payload.get("sub_area_id"),
        "location": payload.get("location"),
        "pincode": payload.get("pincode"),
        "type": payload.get("type"),
        "listingType": payload.get("listingType"),
        "beds": int(float(payload.get("beds"))),
        "bathrooms": int(float(payload.get("bathrooms"))),
        "baths": int(float(payload.get("bathrooms"))),
        "area": int(float(payload.get("area"))),
        "furnishing": payload.get("furnishing"),
        "amenities": payload.get("amenities") if isinstance(payload.get("amenities"), list) else [],
        "images": images if isinstance(images, list) else [],
        "imgs": images if isinstance(images, list) else [],
        "image": image,
        "img": image,
        "builder": payload.get("builder") or "Manish Properties",
        "rating": float(payload.get("rating") or 0),
        "reviews": int(float(payload.get("reviews") or 0)),
        "featured": bool(payload.get("featured", False)),
        "isNew": bool(payload.get("isNew", True)),

        # Lister / owner fields
        "lister_id": payload.get("lister_id"),
        "lister_type": payload.get("lister_type"),
        "lister_name": payload.get("lister_name"),

        # Views & RERA
        "views": int(float(payload.get("views") or 0)),
        "rera": payload.get("rera"),

        # Moderation fields
        "status": status,
        "moderationStatus": status,
        "rejectReason": payload.get("rejectReason"),

        # Featured request fields
        "featuredRequested": bool(payload.get("featuredRequested", False)),
        "requested_for": payload.get("requested_for"),
        "granted_for": payload.get("granted_for"),
        "featuredRequestDate": payload.get("featuredRequestDate"),
        "featuredPaymentStatus": payload.get("featuredPaymentStatus"),
        "featuredPaymentProof": payload.get("featuredPaymentProof"),
        "featuredPaymentAmount": payload.get("featuredPaymentAmount"),
        "featuredApprovedBy": payload.get("featuredApprovedBy"),
        "featuredApprovedAt": payload.get("featuredApprovedAt"),
        "featuredExpiryDate": payload.get("featuredExpiryDate"),
        "featuredExpired": bool(payload.get("featuredExpired", False)),
        "featuredRejectionReason": payload.get("featuredRejectionReason"),

        # Location / geo
        "coordinates": payload.get("coordinates"),
        "nearbyAmenities": payload.get("nearbyAmenities"),

        # Timestamps
        "createdAt": payload.get("createdAt") or now_iso(),
        "updatedAt": now_iso(),
    })

    if result.get("category") == "commercial":
        result["officeType"] = payload.get("officeType")
        result["pantry"] = bool(payload.get("pantry", False))
        result["washrooms"] = int(float(payload.get("washrooms", 0)))
        result["powerBackup"] = bool(payload.get("powerBackup", False))
        result["cabinCount"] = int(float(payload.get("cabinCount", 0)))
        result["conferenceRoom"] = bool(payload.get("conferenceRoom", False))
        result["parking"] = int(float(payload.get("parking", 0)))

    return result


def list_properties(status=None, public_only=False):
    properties = load_json("properties")
    if public_only:
        properties = [item for item in properties if item.get("status") == "APPROVED"]
    elif status:
        normalized = status.upper()
        properties = [item for item in properties if item.get("status") == normalized]
    return sorted(properties, key=lambda item: item.get("createdAt", ""), reverse=True)


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
    append_json("properties", property_item)
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
