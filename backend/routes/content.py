from flask import Blueprint

from services.json_service import load_json
from services.property_service import list_properties
from utils.helpers import success_response


content_bp = Blueprint("content", __name__)


@content_bp.get("/cities")
def cities():
    data = load_json("cities")
    return success_response("Cities fetched", data=data, cities=data)


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
