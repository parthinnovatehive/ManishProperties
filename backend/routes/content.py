from flask import Blueprint, current_app, request
from pathlib import Path

from services.json_service import load_json, append_json, update_json, delete_json
from services.property_service import list_properties
from utils.helpers import success_response, error_response


content_bp = Blueprint("content", __name__)


@content_bp.get("/cities")
def cities():
    try:
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
    except Exception as e:
        current_app.logger.exception(f"Error in cities endpoint: {e}")
        return error_response(str(e), 500)


@content_bp.get("/categories")
def categories():
    try:
        data = load_json("categories", default={"categories": [], "homeStats": []})
        return success_response("Categories fetched", data=data)
    except Exception as e:
        current_app.logger.exception(f"Error in categories endpoint: {e}")
        return error_response(str(e), 500)


@content_bp.get("/testimonials")
def testimonials():
    try:
        data = load_json("testimonials")
        return success_response("Testimonials fetched", data=data, testimonials=data)
    except Exception as e:
        current_app.logger.exception(f"Error in testimonials endpoint: {e}")
        return error_response(str(e), 500)


@content_bp.get("/properties/featured")
def featured_properties():
    try:
        data = [item for item in list_properties(public_only=True) if item.get("featured")]
        return success_response("Featured properties fetched", data=data, properties=data)
    except Exception as e:
        current_app.logger.exception(f"Error in featured properties endpoint: {e}")
        return error_response(str(e), 500)


@content_bp.route("/featured-plans", methods=["GET"])
def get_featured_plans():
    """Get featured plans"""
    try:
        plans = load_json("featured_plans")
        return success_response(
            "Featured plans fetched successfully",
            data=plans,
            plans=plans
        )
    except Exception as e:
        current_app.logger.exception(f"Error loading featured plans: {e}")
        return error_response(str(e), 500)


@content_bp.route("/featured-plans", methods=["POST"])
def create_featured_plan():
    """Create a new featured plan"""
    try:
        data = request.json
        if not data:
            return error_response("No data provided", 400)
            
        required_fields = ["id", "name"]
        for field in required_fields:
            if not data.get(field):
                return error_response(f"Missing required field: {field}", 400)
                
        # Make sure requested_for, duration, and price are stored properly
        plan = {
            "id": str(data.get("id")),
            "name": str(data.get("name")),
            "requested_for": int(data.get("requested_for")) if data.get("requested_for") is not None and data.get("requested_for") != "" else None,
            "duration": int(data.get("duration")) if data.get("duration") is not None and data.get("duration") != "" else None,
            "price": float(data.get("price")) if data.get("price") is not None and data.get("price") != "" else None,
            "description": data.get("description", ""),
            "features": data.get("features", []),
            "qr_code_image": data.get("qr_code_image", "")
        }
        
        result = append_json("featured_plans", plan)
        return success_response(
            "Featured plan created successfully",
            data=result,
            plan=result,
            status_code=201
        )
    except Exception as e:
        current_app.logger.exception(f"Error creating featured plan: {e}")
        return error_response(str(e), 500)


@content_bp.route("/featured-plans/<plan_id>", methods=["PATCH", "PUT"])
def update_featured_plan(plan_id):
    """Update an existing featured plan"""
    try:
        data = request.json
        if not data:
            return error_response("No data provided", 400)
            
        plan = {}
        if "name" in data:
            plan["name"] = str(data["name"])
        if "requested_for" in data:
            plan["requested_for"] = int(data["requested_for"]) if data["requested_for"] is not None and data["requested_for"] != "" else None
        if "duration" in data:
            plan["duration"] = int(data["duration"]) if data["duration"] is not None and data["duration"] != "" else None
        if "price" in data:
            plan["price"] = float(data["price"]) if data["price"] is not None and data["price"] != "" else None
        if "description" in data:
            plan["description"] = str(data["description"])
        if "features" in data:
            plan["features"] = data["features"]
        if "qr_code_image" in data:
            plan["qr_code_image"] = data["qr_code_image"]
            
        result = update_json("featured_plans", plan_id, plan)
        if not result:
            return error_response("Plan not found or failed to update", 404)
            
        return success_response(
            "Featured plan updated successfully",
            data=result,
            plan=result
        )
    except Exception as e:
        current_app.logger.exception(f"Error updating featured plan: {e}")
        return error_response(str(e), 500)


@content_bp.route("/featured-plans/<plan_id>", methods=["DELETE"])
def delete_featured_plan(plan_id):
    """Delete a featured plan"""
    try:
        result = delete_json("featured_plans", plan_id)
        if not result:
            return error_response("Plan not found or failed to delete", 404)
            
        return success_response("Featured plan deleted successfully")
    except Exception as e:
        current_app.logger.exception(f"Error deleting featured plan: {e}")
        return error_response(str(e), 500)


@content_bp.get("/debug/files")
def debug_files():
    import os
    if os.getenv("FLASK_ENV") != "development":
        from utils.helpers import error_response
        return error_response("Not available in production", 403)
        
    """Debug endpoint to inspect file locations on the server"""
    result = {
        "cwd": str(Path.cwd()),
        "data_dir": str(current_app.config.get("JSON_DATA_DIR")),
        "project_root": None,
        "files": {},
        "alternative_paths": {}
    }

    try:
        import config as cfg
        result["project_root"] = str(cfg.PROJECT_ROOT) if hasattr(cfg, 'PROJECT_ROOT') else None
    except Exception as e:
        result["project_root_error"] = str(e)

    data_dir = Path(str(current_app.config.get("JSON_DATA_DIR", "")))
    if data_dir.exists():
        result["files"]["data_dir_exists"] = True
        result["files"]["data_dir_is_dir"] = data_dir.is_dir()
        result["files"]["contents"] = sorted([f.name for f in data_dir.iterdir() if f.is_file()])
    else:
        result["files"]["data_dir_exists"] = False

    db_dir = Path("database")
    if db_dir.exists():
        result["alternative_paths"]["database_relative_cwd"] = True
        result["alternative_paths"]["database_relative_contents"] = sorted([f.name for f in db_dir.iterdir() if f.is_file()])
    else:
        result["alternative_paths"]["database_relative_cwd"] = False

    backend_dir = Path(__file__).resolve().parent.parent
    for candidate_name in ["database", "../database", "../../database"]:
        candidate = (backend_dir / candidate_name).resolve()
        result["alternative_paths"][f"via_backend_{candidate_name.replace('/', '_')}"] = {
            "path": str(candidate),
            "exists": candidate.exists()
        }

    import sys
    result["python_path"] = sys.path[:5]

    return result