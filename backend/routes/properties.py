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
from flask_jwt_extended import jwt_required 
from utils.helpers import error_response, success_response
from utils.validators import MODERATION_STATUSES
from services.cloudinary_service import upload_image, delete_image, upload_multiple_images
from services.google_places_service import get_nearby_amenities, get_address_from_coordinates


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


@properties_bp.post("/expire-featured")
def check_featured_expiry():
    """Check and expire featured properties whose tenure is over"""
    from datetime import datetime
    from services.json_service import load_json, save_json
    
    properties = load_json("properties")
    now = datetime.now().isoformat()
    expired_count = 0
    
    for prop in properties:
        # Check if property is featured and has expiry date
        if prop.get("featured") and prop.get("featuredExpiryDate"):
            expiry_date = prop.get("featuredExpiryDate")
            
            # If expiry date has passed, mark as expired
            if expiry_date and expiry_date < now:
                prop["featured"] = False
                prop["featuredExpired"] = True
                expired_count += 1
                print(f"Property {prop.get('id')} - {prop.get('title')} has expired")
    
    if expired_count > 0:
        save_json("properties", properties)
    
    return success_response(
        f"Expired {expired_count} featured properties",
        data={"expired_count": expired_count}
    )


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
@role_required(["AGENT", "ADMIN", "SUPER_ADMIN"])
def update_property_route(property_id):
    property_item = update_property(property_id, request.get_json(silent=True) or {})
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property updated", data=property_item, property=property_item)


@properties_bp.patch("/<property_id>/approve")
@properties_bp.patch("/properties/<property_id>/approve")
@role_required(["ADMIN", "SUPER_ADMIN"])
def approve_property(property_id):
    property_item = set_property_status(property_id, "APPROVED")
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property approved", data=property_item, property=property_item)


@properties_bp.patch("/<property_id>/reject")
@properties_bp.patch("/properties/<property_id>/reject")
@role_required(["ADMIN", "SUPER_ADMIN"])
def reject_property(property_id):
    property_item = set_property_status(property_id, "REJECTED")
    if not property_item:
        return error_response("Property not found", 404)
    return success_response("Property rejected", data=property_item, property=property_item)


@properties_bp.patch("/<property_id>/feature")
@properties_bp.patch("/properties/<property_id>/feature")
@role_required(["ADMIN", "SUPER_ADMIN"])
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
@role_required(["AGENT", "ADMIN", "SUPER_ADMIN"])
def delete_property_route(property_id):
    if not delete_property(property_id):
        return error_response("Property not found", 404)
    return success_response("Property deleted")


@properties_bp.post("/upload-image")
@jwt_required()
def upload_property_image():
    """Upload a single image to Cloudinary"""
    try:
        if 'image' not in request.files:
            return error_response("No image file provided", 400)
        
        file = request.files['image']
        folder = f"properties/{request.args.get('folder', 'general')}"
        
        result = upload_image(file, folder)
        
        if result['success']:
            return success_response(
                "Image uploaded successfully",
                data={
                    'url': result['url'],
                    'public_id': result['public_id'],
                    'width': result['width'],
                    'height': result['height']
                }
            )
        else:
            return error_response(result['error'], 500)
            
    except Exception as e:
        return error_response(str(e), 500)

@properties_bp.post("/upload-images")
@jwt_required()
def upload_property_images():
    """Upload multiple images to Cloudinary"""
    try:
        if 'images' not in request.files:
            return error_response("No images provided", 400)
        
        files = request.files.getlist('images')
        folder = f"properties/{request.args.get('folder', 'general')}"
        
        results = upload_multiple_images(files, folder)
        
        success_results = [r for r in results if r['success']]
        
        return success_response(
            f"Uploaded {len(success_results)} of {len(files)} images",
            data={
                'uploaded': len(success_results),
                'total': len(files),
                'images': success_results
            }
        )
        
    except Exception as e:
        return error_response(str(e), 500)

@properties_bp.delete("/delete-image")
@jwt_required()
def delete_property_image():
    """Delete an image from Cloudinary"""
    try:
        public_id = request.args.get('public_id')
        if not public_id:
            return error_response("public_id required", 400)
        
        result = delete_image(public_id)
        
        if result['success']:
            return success_response("Image deleted successfully")
        else:
            return error_response(result.get('error', 'Failed to delete'), 500)
            
    except Exception as e:
        return error_response(str(e), 500)

@properties_bp.post("/fetch-amenities")
@jwt_required()
def fetch_amenities():
    """Fetch nearby amenities for a location"""
    try:
        payload = request.get_json(silent=True) or {}
        lat = payload.get('lat')
        lng = payload.get('lng')
        radius = payload.get('radius', 2000)
        
        if not lat or not lng:
            return error_response("Latitude and longitude required", 400)
        
        amenities = get_nearby_amenities(float(lat), float(lng), int(radius))
        
        return success_response(
            "Amenities fetched successfully",
            data=amenities
        )
        
    except Exception as e:
        return error_response(str(e), 500)

@properties_bp.post("/geocode")
@jwt_required()
def geocode_address():
    """Get address from coordinates"""
    try:
        payload = request.get_json(silent=True) or {}
        lat = payload.get('lat')
        lng = payload.get('lng')
        
        if not lat or not lng:
            return error_response("Latitude and longitude required", 400)
        
        address = get_address_from_coordinates(float(lat), float(lng))
        
        return success_response(
            "Address fetched successfully",
            data={'address': address}
        )
        
    except Exception as e:
        return error_response(str(e), 500)
    
@properties_bp.route("/compare", methods=["GET"])
def compare_properties():
    """Get multiple properties by IDs for comparison"""
    from services.json_service import load_json
    
    ids_param = request.args.get("ids", "")
    if not ids_param:
        return error_response("No property IDs provided", 400)
    
    property_ids = ids_param.split(",")
    all_properties = load_json("properties")
    
    # Filter properties by IDs
    compare_properties = [
        p for p in all_properties 
        if str(p.get("id")) in property_ids
    ]
    
    return success_response(
        "Properties fetched for comparison",
        data=compare_properties,
        properties=compare_properties
    )

