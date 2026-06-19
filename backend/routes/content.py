from flask import Blueprint

from services.json_service import load_json
from services.property_service import list_properties
from utils.helpers import success_response, error_response 


content_bp = Blueprint("content", __name__)


@content_bp.get("/cities")
def cities():
    cities = load_json("cities")
    admins = load_json("admins")
    admin_map = {a["id"]: a for a in admins}
    for city in cities:
        aid = city.get("admin_id")
        if aid and aid in admin_map:
            city["admin_phone"] = admin_map[aid].get("phone") or ""
            city["admin_name"] = admin_map[aid].get("name") or ""
        else:
            city["admin_phone"] = ""
            city["admin_name"] = ""
    return success_response("Cities fetched", data=cities, cities=cities)


@content_bp.get("/categories")
def categories():
    data = load_json("categories", default={"categories": [], "homeStats": []})
    return success_response("Categories fetched", data=data)


@content_bp.get("/testimonials")
def testimonials():
    data = load_json("testimonials")
    return success_response("Testimonials fetched", data=data, testimonials=data)


@content_bp.get("/properties/featured")
def featured_properties():
    data = [item for item in list_properties(public_only=True) if item.get("featured")]
    return success_response("Featured properties fetched", data=data, properties=data)


@content_bp.route("/featured-plans", methods=["GET"])
def get_featured_plans():
    """Get featured plans"""
    try:
        # Since JSON_DATA_DIR points to PROJECT_ROOT / "database"
        # we just need the filename without extension
        plans = load_json("featured_plans")
        return success_response(
            "Featured plans fetched successfully",
            data=plans,
            plans=plans
        )
    except Exception as e:
        print(f"❌ Error loading featured plans: {str(e)}")
        return error_response(str(e), 500)