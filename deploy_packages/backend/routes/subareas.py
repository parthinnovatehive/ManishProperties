from flask import Blueprint, request, current_app, jsonify
from services.json_service import load_json, update_json
from utils.helpers import success_response, error_response, generate_id
from pathlib import Path
import jwt
from config import Config

subareas_bp = Blueprint("subareas", __name__)


@subareas_bp.route("", methods=["GET", "OPTIONS"])
@subareas_bp.route("/", methods=["GET", "OPTIONS"])
def list_subareas():
    """Get all subareas"""
    if request.method == "OPTIONS":
        return "", 200
    
    try:
        subareas = load_json("sub_areas")
        sub_area_agents = load_json("sub_area_agents") or []
        
        # Inject agent_ids for frontend compatibility
        for subarea in subareas:
            subarea["agent_ids"] = [
                saa["agent_id"] for saa in sub_area_agents
                if str(saa.get("sub_area_id")) == str(subarea.get("id"))
            ]
        
        return success_response(
            "Subareas fetched successfully",
            data=subareas,
            subareas=subareas
        )
    except Exception as e:
        current_app.logger.exception(f"Error in list_subareas: {e}")
        return error_response(str(e), 500)


@subareas_bp.route("", methods=["POST", "OPTIONS"])
@subareas_bp.route("/", methods=["POST", "OPTIONS"])
def create_subarea():
    """Create a new subarea"""
    if request.method == "OPTIONS":
        return "", 200
        
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 401
    
    try:
        token = token.split(' ')[1]
        data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        role = data.get('role', '').upper()
        if role not in ['ADMIN', 'SUPER_ADMIN']:
            return jsonify({'message': 'Admin access required!'}), 403
    except Exception as e:
        return jsonify({'message': f'Authentication error: {str(e)}'}), 401

    try:
        payload = request.get_json(silent=True) or {}
        if not payload.get("name") or not payload.get("city_id"):
            return error_response("Name and city_id are required", 400)
            
        import uuid
        from services.json_service import save_json
        
        subareas = load_json("sub_areas")
        
        # Generate slug if not provided
        slug = payload.get("slug")
        if not slug:
            slug = payload.get("name", "").lower().replace(" ", "-")
            
        new_subarea = {
            "id": str(uuid.uuid4()),
            "name": payload.get("name"),
            "city_id": payload.get("city_id"),
            "status": payload.get("status", "active"),
            "slug": slug,
        }
        
        from services.json_service import append_json
        append_json("sub_areas", new_subarea)
        
        # Insert assignments to sub_area_agents
        agent_ids = payload.get("agent_ids", [])
        if agent_ids:
            for aid in agent_ids:
                if aid and str(aid).strip() != "":
                    append_json("sub_area_agents", {
                        "id": generate_id("saa_"),
                        "sub_area_id": new_subarea["id"], 
                        "agent_id": aid,
                        "createdAt": __import__('datetime').datetime.now().isoformat()
                    })
        
        # Inject agent_ids in response for compatibility
        new_subarea["agent_ids"] = agent_ids
            
        return success_response(
            "Subarea created successfully",
            data=new_subarea,
            subarea=new_subarea
        )
    except Exception as e:
        print(f"ERROR creating subarea: {str(e)}")
        return error_response(f"Failed to create subarea: {str(e)}", 500)


@subareas_bp.route("/<subarea_id>", methods=["PATCH", "OPTIONS"])
def update_subarea(subarea_id):
    """Update a subarea (assign/unassign agents)"""
    # ✅ CRITICAL: Handle OPTIONS preflight FIRST before authentication
    if request.method == "OPTIONS":
        return "", 200
    
    # ✅ Manual authentication (since we removed @admin_required)
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing!'}), 401
    
    try:
        token = token.split(' ')[1]
        data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        role = data.get('role', '').upper()
        if role not in ['ADMIN', 'SUPER_ADMIN']:
            return jsonify({'message': 'Admin access required!'}), 403
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token!'}), 401
    except Exception as e:
        return jsonify({'message': f'Authentication error: {str(e)}'}), 401
    
    # ✅ Process the update
    try:
        payload = request.get_json(silent=True) or {}
        from services.json_service import load_json, update_json, append_json
        
        subareas = load_json("sub_areas")
        subarea = next((s for s in subareas if str(s.get("id")) == str(subarea_id)), None)
        if not subarea:
            return error_response("Subarea not found", 404)
        
        # Update scalar fields
        allowed_fields = ["name", "city_id", "status", "slug"]
        changes = {f: payload[f] for f in allowed_fields if f in payload}
        if changes:
            update_json("sub_areas", subarea_id, changes)
            subarea.update(changes)
        
        # Handle agent assignments if present in payload
        if any(k in payload for k in ["agent_id", "agent_ids", "add_agent", "remove_agent"]):
            current_sa_agents = load_json("sub_area_agents") or []
            current_agent_ids = [
                saa["agent_id"] for saa in current_sa_agents 
                if str(saa.get("sub_area_id")) == str(subarea_id)
            ]
            
            new_agent_ids = list(current_agent_ids)
            
            if "agent_id" in payload:
                aid = payload["agent_id"]
                if aid is None:
                    new_agent_ids = []
                elif aid not in current_agent_ids:
                    new_agent_ids.append(aid)
            elif "agent_ids" in payload:
                aids = payload["agent_ids"]
                if aids is None:
                    new_agent_ids = []
                elif isinstance(aids, list):
                    new_agent_ids = [str(a) for a in aids if a and str(a).strip() != ""]
            elif "add_agent" in payload:
                aid = payload["add_agent"]
                if aid and aid not in current_agent_ids:
                    new_agent_ids.append(aid)
            elif "remove_agent" in payload:
                aid = payload["remove_agent"]
                if aid in new_agent_ids:
                    new_agent_ids.remove(aid)
            
            # Compute diffs and apply
            to_add = set(new_agent_ids) - set(current_agent_ids)
            to_remove = set(current_agent_ids) - set(new_agent_ids)
            
            import requests
            from services.supabase_service import _get_supabase_config, _headers
            url, key = _get_supabase_config()
            
            if url and key:
                if to_remove:
                    for aid in to_remove:
                        endpoint = f"{url}/rest/v1/sub_area_agents?sub_area_id=eq.{subarea_id}&agent_id=eq.{aid}"
                        requests.delete(endpoint, headers=_headers(), timeout=10)
                if to_add:
                    for aid in to_add:
                        append_json("sub_area_agents", {
                            "id": generate_id("saa_"),
                            "sub_area_id": subarea_id, 
                            "agent_id": aid,
                            "createdAt": __import__('datetime').datetime.now().isoformat()
                        })
            
            subarea["agent_ids"] = list(set(new_agent_ids))
        else:
            # If no agent updates, fetch current just for the response
            current_sa_agents = load_json("sub_area_agents") or []
            subarea["agent_ids"] = [
                saa["agent_id"] for saa in current_sa_agents 
                if str(saa.get("sub_area_id")) == str(subarea_id)
            ]
            
        print(f"Subarea {subarea_id} updated")
        
        return success_response(
            "Subarea updated successfully",
            data=subarea,
            subarea=subarea
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR updating subarea: {str(e)}")
        return error_response(f"Failed to update subarea: {str(e)}", 500)


@subareas_bp.route("/debug", methods=["GET"])
def debug():
    import os
    if os.getenv("FLASK_ENV") != "development":
        from utils.helpers import error_response
        return error_response("Not available in production", 403)
        
    """Debug endpoint to check file location"""
    data_dir = Path(current_app.config.get("JSON_DATA_DIR", "data"))
    
    result = {
        "data_dir": str(data_dir.absolute()),
        "data_dir_exists": data_dir.exists(),
        "files": []
    }
    
    if data_dir.exists():
        result["files"] = [f.name for f in data_dir.iterdir() if f.is_file()]
    
    current_dir = Path.cwd()
    result["current_dir"] = str(current_dir)
    sub_areas_in_current = (current_dir / "sub_areas.csv").exists()
    result["sub_areas_in_current_dir"] = sub_areas_in_current
    
    return result