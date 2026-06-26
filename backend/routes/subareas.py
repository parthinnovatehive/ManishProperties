from flask import Blueprint, request, current_app, jsonify
from services.json_service import load_json, update_json
from utils.helpers import success_response, error_response
from pathlib import Path
import jwt
from ..config import Config

subareas_bp = Blueprint("subareas", __name__)


@subareas_bp.route("", methods=["GET", "OPTIONS"])
@subareas_bp.route("/", methods=["GET", "OPTIONS"])
def list_subareas():
    """Get all subareas"""
    if request.method == "OPTIONS":
        return "", 200
    
    subareas = load_json("sub_areas")
    
    # ✅ Ensure all subareas have agent_ids (migration from agent_id to agent_ids)
    updated = False
    for subarea in subareas:
        if "agent_id" in subarea and "agent_ids" not in subarea:
            # Migrate from single agent to multiple
            subarea["agent_ids"] = [subarea["agent_id"]] if subarea.get("agent_id") else []
            del subarea["agent_id"]
            updated = True
        elif "agent_ids" not in subarea:
            subarea["agent_ids"] = []
            updated = True
    
    if updated:
        from services.json_service import save_json
        save_json("sub_areas", subareas)
    
    return success_response(
        "Subareas fetched successfully",
        data=subareas,
        subareas=subareas
    )


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
        data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
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
        print(f"🔍 DEBUG: Updating subarea {subarea_id} with payload: {payload}")
        
        # ✅ Load existing subareas
        from services.json_service import save_json
        subareas = load_json("sub_areas")
        subarea_index = None
        for i, s in enumerate(subareas):
            if str(s.get("id")) == str(subarea_id):
                subarea_index = i
                break
        
        if subarea_index is None:
            return error_response("Subarea not found", 404)
        
        subarea = subareas[subarea_index]
        
        # ✅ Ensure agent_ids exists
        if "agent_ids" not in subarea:
            subarea["agent_ids"] = []
        
        # ✅ Handle different update scenarios
        if "agent_id" in payload:
            # Backward compatibility: convert single agent to array
            agent_id = payload["agent_id"]
            if agent_id is None:
                subarea["agent_ids"] = []
            elif agent_id not in subarea.get("agent_ids", []):
                subarea["agent_ids"] = subarea.get("agent_ids", []) + [agent_id]
        
        elif "agent_ids" in payload:
            # ✅ New format: array of agent IDs (replace all)
            agent_ids = payload["agent_ids"]
            if agent_ids is None:
                subarea["agent_ids"] = []
            elif isinstance(agent_ids, list):
                # Remove duplicates and None values
                subarea["agent_ids"] = [aid for aid in agent_ids if aid]
        
        elif "add_agent" in payload:
            # ✅ Add a single agent to existing list
            agent_id = payload["add_agent"]
            if agent_id:
                current_ids = subarea.get("agent_ids", [])
                if agent_id not in current_ids:
                    subarea["agent_ids"] = current_ids + [agent_id]
        
        elif "remove_agent" in payload:
            # ✅ Remove a single agent from list
            agent_id = payload["remove_agent"]
            if agent_id:
                subarea["agent_ids"] = [aid for aid in subarea.get("agent_ids", []) if aid != agent_id]
        
        # ✅ Update other fields if provided
        allowed_fields = ["name", "city_id", "status", "slug", "description"]
        for field in allowed_fields:
            if field in payload:
                subarea[field] = payload[field]
        
        # ✅ Save updated subarea
        subareas[subarea_index] = subarea
        save_json("sub_areas", subareas)
        
        print(f"✅ Subarea {subarea_id} updated: {subarea}")
        
        # ✅ Also update agent's sub_area_ids (synchronization)
        update_agent_subareas_sync(subarea_id, subarea.get("agent_ids", []))
        
        return success_response(
            "Subarea updated successfully",
            data=subarea,
            subarea=subarea
        )
        
    except Exception as e:
        print(f"❌ ERROR updating subarea: {str(e)}")
        return error_response(f"Failed to update subarea: {str(e)}", 500)


def update_agent_subareas_sync(subarea_id, agent_ids):
    """✅ Synchronize agent's sub_area_ids based on subarea assignments"""
    from services.json_service import save_json
    
    agents = load_json("agents")
    updated = False
    
    for agent in agents:
        agent_subareas = agent.get("sub_area_ids", [])
        
        # If agent is in the subarea's agent_ids, ensure subarea is in agent's list
        if agent["id"] in agent_ids:
            if subarea_id not in agent_subareas:
                agent["sub_area_ids"] = agent_subareas + [subarea_id]
                updated = True
        # If agent is not in subarea's agent_ids, remove subarea from agent's list
        else:
            if subarea_id in agent_subareas:
                agent["sub_area_ids"] = [sid for sid in agent_subareas if sid != subarea_id]
                updated = True
    
    if updated:
        save_json("agents", agents)


@subareas_bp.route("/debug", methods=["GET"])
def debug():
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
    sub_areas_in_current = (current_dir / "sub_areas.json").exists()
    result["sub_areas_in_current_dir"] = sub_areas_in_current
    
    return result