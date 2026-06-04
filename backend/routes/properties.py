from flask import Blueprint, request

from middleware.permissions import admin_required, role_required
from services.property_service import (
    create_property,
    delete_property,
    get_property,
    list_properties,
    set_featured,
    set_property_status,
    update_property,
)
from utils.helpers import error_response, success_response
from utils.validators import MODERATION_STATUSES


properties_bp = Blueprint("properties", __name__)


def _is_public_request():
    return request.path.startswith("/api/public")


def _is_admin_request():
    return request.path.startswith("/api/admin")


@properties_bp.get("/")
@properties_bp.get("")
@properties_bp.get("/properties")
def get_properties():
    status = request.args.get("status")
    if status and status.upper() not in MODERATION_STATUSES:
        return error_response("Invalid property status", 400)
    properties = list_properties(status=status, public_only=_is_public_request())
    return success_response("Properties fetched", data=properties, properties=properties)


@properties_bp.get("/<property_id>")
@properties_bp.get("/properties/<property_id>")
def get_property_detail(property_id):
    property_item = get_property(property_id, public_only=_is_public_request())
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property fetched", data=property_item, property=property_item)


@properties_bp.post("/")
@properties_bp.post("")
@properties_bp.post("/properties")
@properties_bp.post("/properties/create")
@properties_bp.post("/properties/submit")
def create_property_route():
    if _is_admin_request():
        protected = role_required("AGENT", "ADMIN", "SUPER_ADMIN")(lambda: None)
        auth_result = protected()
        if auth_result is not None:
            return auth_result

    status = "PENDING"
    property_item, error = create_property(request.get_json(silent=True) or {}, status=status)
    if error:
        return error_response(error, 400)
    return success_response("Property created", data=property_item, property=property_item, status_code=201)


@properties_bp.put("/<property_id>")
@properties_bp.patch("/<property_id>")
@properties_bp.put("/properties/<property_id>")
@properties_bp.patch("/properties/<property_id>")
@role_required("AGENT", "ADMIN", "SUPER_ADMIN")
def update_property_route(property_id):
    property_item = update_property(property_id, request.get_json(silent=True) or {})
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property updated", data=property_item, property=property_item)


@properties_bp.patch("/<property_id>/approve")
@properties_bp.patch("/properties/<property_id>/approve")
@admin_required
def approve_property(property_id):
    property_item = set_property_status(property_id, "APPROVED")
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property approved", data=property_item, property=property_item)


@properties_bp.patch("/<property_id>/reject")
@properties_bp.patch("/properties/<property_id>/reject")
@admin_required
def reject_property(property_id):
    property_item = set_property_status(property_id, "REJECTED")
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property rejected", data=property_item, property=property_item)


@properties_bp.patch("/<property_id>/feature")
@properties_bp.patch("/properties/<property_id>/feature")
@admin_required
def feature_property(property_id):
    payload = request.get_json(silent=True) or {}
    requested = payload.get("featured")
    if requested is not None and not isinstance(requested, bool):
        return error_response("featured must be a boolean", 400)
    property_item = set_featured(property_id, requested)
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property feature updated", data=property_item, property=property_item)


@properties_bp.delete("/<property_id>")
@properties_bp.delete("/properties/<property_id>")
@role_required("AGENT", "ADMIN", "SUPER_ADMIN")
def delete_property_route(property_id):
    if not delete_property(property_id):
        return error_response("Property not found", 404)
    return success_response("Property deleted")
