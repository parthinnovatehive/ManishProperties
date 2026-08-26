"""
Supabase Data Service Adapter for EstateElite Backend.
Seamlessly routes data operations to Supabase PostgreSQL REST API.
"""
import json
import logging
import os
from typing import Any, Callable, Dict, List, Optional, Union
import requests

_logger = logging.getLogger(__name__)
_SINGLE_OBJECT_COLLECTIONS = {"categories", "settings"}


def _get_supabase_config():
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY", "")
    return url, key


def _headers():
    _, key = _get_supabase_config()
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


def is_supabase_configured() -> bool:
    url, key = _get_supabase_config()
    return bool(url and key)


def _is_single_object(collection: str) -> bool:
    return collection in _SINGLE_OBJECT_COLLECTIONS


def load_json(collection: str, default: Any = None) -> Any:
    default_value = [] if default is None else default
    url, key = _get_supabase_config()
    if not (url and key):
        return default_value

    try:
        endpoint = f"{url}/rest/v1/{collection}"
        resp = requests.get(endpoint, headers=_headers(), timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            if _is_single_object(collection):
                if data and len(data) > 0:
                    return data[0].get("data", default_value)
                return default_value if isinstance(default_value, dict) else {}
            return data
        else:
            _logger.warning(
                f"Supabase load_json({collection}) error {resp.status_code}: {resp.text}"
            )
            return default_value
    except Exception as e:
        _logger.error(f"Supabase load_json({collection}) exception: {e}")
        return default_value


def save_json(collection: str, data: Any) -> Any:
    url, key = _get_supabase_config()
    if not (url and key):
        return data

    try:
        endpoint = f"{url}/rest/v1/{collection}"
        headers = _headers()
        headers["Prefer"] = "resolution=merge-duplicates,return=representation"

        if _is_single_object(collection) or isinstance(data, dict):
            payload = {"id": "main", "data": data if isinstance(data, dict) else {}}
            requests.post(endpoint, headers=headers, json=payload, timeout=10)
        else:
            items = data if isinstance(data, list) else []
            if items:
                requests.post(endpoint, headers=headers, json=items, timeout=15)
    except Exception as e:
        _logger.error(f"Supabase save_json({collection}) exception: {e}")
    return data


def find_one(collection: str, predicate: Callable[[Dict[str, Any]], bool]) -> Optional[Dict[str, Any]]:
    items = load_json(collection)
    if isinstance(items, list):
        return next((item for item in items if predicate(item)), None)
    return None


def append_json(collection: str, item: Dict[str, Any]) -> Dict[str, Any]:
    url, key = _get_supabase_config()
    if not (url and key):
        return item

    try:
        endpoint = f"{url}/rest/v1/{collection}"
        headers = _headers()
        resp = requests.post(endpoint, headers=headers, json=item, timeout=10)
        if resp.status_code in (200, 201):
            inserted = resp.json()
            if isinstance(inserted, list) and len(inserted) > 0:
                return inserted[0]
            return inserted
        else:
            _logger.error(f"Supabase append_json({collection}) error {resp.status_code}: {resp.text}")
            raise Exception(f"Database error: {resp.text}")
    except Exception as e:
        _logger.error(f"Supabase append_json({collection}) exception: {e}")
        raise
    return item


def update_json(collection: str, item_id: Any, changes: Dict[str, Any], id_field: str = "id") -> Optional[Dict[str, Any]]:
    url, key = _get_supabase_config()
    if not (url and key):
        return None

    try:
        endpoint = f"{url}/rest/v1/{collection}?{id_field}=eq.{item_id}"
        headers = _headers()
        resp = requests.patch(endpoint, headers=headers, json=changes, timeout=10)
        if resp.status_code in (200, 204):
            updated = resp.json()
            if isinstance(updated, list) and len(updated) > 0:
                return updated[0]
            return {**changes, id_field: item_id}
    except Exception as e:
        _logger.error(f"Supabase update_json({collection}) exception: {e}")
    return None


def delete_json(collection: str, item_id: Any, id_field: str = "id") -> bool:
    url, key = _get_supabase_config()
    if not (url and key):
        return False

    try:
        endpoint = f"{url}/rest/v1/{collection}?{id_field}=eq.{item_id}"
        headers = _headers()
        resp = requests.delete(endpoint, headers=headers, timeout=10)
        return resp.status_code in (200, 204)
    except Exception as e:
        _logger.error(f"Supabase delete_json({collection}) exception: {e}")
        return False
