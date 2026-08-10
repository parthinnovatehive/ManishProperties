import csv
import json
import os
from pathlib import Path
from threading import RLock

from flask import current_app


_LOCK = RLock()

_SINGLE_OBJECT_COLLECTIONS = {"categories", "settings"}


import logging

_logger = logging.getLogger(__name__)


def _resolve_data_dir():
    configured_dir = "database"
    try:
        from flask import has_app_context
        if has_app_context() and "JSON_DATA_DIR" in current_app.config:
            configured_dir = current_app.config["JSON_DATA_DIR"]
        else:
            configured_dir = os.getenv("JSON_DATA_DIR", "database")
    except Exception:
        configured_dir = os.getenv("JSON_DATA_DIR", "database")

    configured = Path(configured_dir)
    if configured.exists():
        return configured

    candidates = [
        configured,
        Path.cwd() / "database",
        Path(__file__).resolve().parent.parent.parent / "database",
        Path(__file__).resolve().parent.parent / "database",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate

    configured.mkdir(parents=True, exist_ok=True)
    return configured


def _data_dir():
    try:
        return _resolve_data_dir()
    except Exception as e:
        _logger.error(f"_resolve_data_dir failed: {e}")
        raise


def _path(collection):
    safe_name = collection.replace("/", "_")
    return _data_dir() / f"{safe_name}.csv"


def _is_single_object(collection):
    return collection in _SINGLE_OBJECT_COLLECTIONS


def _serialize_cell(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def _deserialize_cell(value):
    if value is None or value == "":
        return None
    try:
        parsed = json.loads(value)
        if isinstance(parsed, (list, dict)):
            return parsed
    except (json.JSONDecodeError, ValueError):
        pass
    if value.lower() == "true":
        return True
    if value.lower() == "false":
        return False
    return value


def _collect_headers(items):
    seen = []
    seen_set = set()
    for item in items:
        for key in item:
            if key not in seen_set:
                seen.append(key)
                seen_set.add(key)
    return seen


def _row_to_dict(row):
    result = {}
    for k, v in row.items():
        if k is None:
            continue
        deserialized = _deserialize_cell(v)
        if deserialized is not None:
            result[k] = deserialized
    return result


def _write_csv(path, items):
    if not items:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8", newline="") as f:
            f.write("")
        return
    headers = _collect_headers(items)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        for item in items:
            serialized = {k: _serialize_cell(v) for k, v in item.items()}
            writer.writerow(serialized)


def _read_csv_rows(path):
    with path.open("r", encoding="utf-8", newline="") as f:
        content = f.read().strip()
        if not content:
            return []
        f.seek(0)
        reader = csv.DictReader(f)
        return [_row_to_dict(row) for row in reader]


def load_json(collection, default=None):
    default_value = [] if default is None else default
    try:
        path = _path(collection)
    except Exception as e:
        _logger.error(f"load_json({collection}) - path resolution failed: {e}")
        return default_value
    if not path.exists():
        save_json(collection, default_value)
        return default_value

    with _LOCK:
        try:
            if _is_single_object(collection):
                rows = _read_csv_rows(path)
                if not rows:
                    return default_value if isinstance(default_value, dict) else {}
                raw = rows[0].get("_data", "")
                if isinstance(raw, str):
                    try:
                        return json.loads(raw)
                    except (json.JSONDecodeError, ValueError):
                        pass
                return raw if isinstance(raw, dict) else default_value
            else:
                rows = _read_csv_rows(path)
                return rows if isinstance(default_value, list) else rows
        except Exception:
            return default_value


def save_json(collection, data):
    path = _path(collection)
    with _LOCK:
        try:
            if _is_single_object(collection) or isinstance(data, dict):
                obj = data if isinstance(data, dict) else {}
                wrapper = [{"_data": json.dumps(obj, ensure_ascii=False)}]
                _write_csv(path, wrapper)
            else:
                items = data if isinstance(data, list) else []
                _write_csv(path, items)
        except Exception:
            pass
    return data


def find_one(collection, predicate):
    return next((item for item in load_json(collection) if predicate(item)), None)


def update_json(collection, item_id, changes, id_field="id"):
    items = load_json(collection)
    for index, item in enumerate(items):
        if str(item.get(id_field)) == str(item_id):
            updated = {**item, **changes}
            items[index] = updated
            save_json(collection, items)
            return updated
    return None


def delete_json(collection, item_id, id_field="id"):
    items = load_json(collection)
    remaining = [item for item in items if str(item.get(id_field)) != str(item_id)]
    if len(remaining) == len(items):
        return False
    save_json(collection, remaining)
    return True


def append_json(collection, item):
    items = load_json(collection)
    items.append(item)
    save_json(collection, items)
    return item
