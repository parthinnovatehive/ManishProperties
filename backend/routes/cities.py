from flask import Blueprint, request, current_app
from middleware.permissions import super_admin_required
from services.json_service import load_json, update_json, append_json
from utils.helpers import success_response, error_response
import uuid
import traceback

cities_bp = Blueprint("cities", __name__)


@cities_bp.get("/")
@cities_bp.get("")
def list_cities():
    cities = load_json("cities")
    return success_response(
        "Cities fetched",
        data=cities,
        cities=cities,
    )


@cities_bp.post("/")
@cities_bp.post("")
@super_admin_required
def create_city():
    """Create a new city"""
    try:
        payload = request.get_json(silent=True) or {}
        
        # Validate required fields
        if not payload.get("name"):
            return {"success": False, "message": "City name is required"}, 400
        
        cities = load_json("cities")
        
        # Check if city already exists
        existing_city = next(
            (c for c in cities if c.get("name", "").lower() == payload["name"].lower()),
            None
        )
        
        if existing_city:
            return {"success": False, "message": f"City '{payload['name']}' already exists"}, 400
        
        # Generate new city ID
        import uuid
        new_id = f"city_{uuid.uuid4().hex[:12]}"
        
        # Create new city object
        new_city = {
            "id": new_id,
            "name": payload["name"],
            "image": payload.get("image", ""),
            "count": payload.get("count", 0),
            "admin_id": payload.get("admin_id"),
            "status": payload.get("status", "active")
        }
        
        # Use existing append_json function
        append_json("cities", new_city)
        
        # Return a clean response
        return {
            "success": True,
            "message": "City created successfully",
            "city": new_city,
            "data": new_city
        }, 201
        
    except Exception as e:
        import traceback
        print(f"ERROR in create_city: {str(e)}")
        print(traceback.format_exc())
        return {"success": False, "message": str(e)}, 500

@cities_bp.patch("/<city_id>")
@super_admin_required
def update_city(city_id):
    try:
        payload = request.get_json(silent=True) or {}

        if "admin_id" in payload:
            cities = load_json("cities")

            existing_city = next(
                (
                    c for c in cities
                    if c.get("admin_id") == payload["admin_id"]
                    and str(c.get("id")) != str(city_id)
                ),
                None,
            )

            if existing_city:
                return error_response(
                    "This admin is already assigned to another city",
                    400,
                )

        city = update_json("cities", city_id, payload)

        if not city:
            return error_response("City not found", 404)

        return success_response(
            "City updated",
            data=city,
            city=city,
        )
    except Exception as e:
        current_app.logger.error(f"ERROR updating city: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return error_response(f"Internal server error: {str(e)}", 500)