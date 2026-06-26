import json
from pathlib import Path
import os
import traceback
from threading import RLock
from pathlib import Path
from flask import current_app


_LOCK = RLock()


def _resolve_data_dir():
    configured = Path(current_app.config["JSON_DATA_DIR"])
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
        current_app.logger.error(f"_resolve_data_dir failed: {e}")
        raise


def _path(collection):
    safe_name = collection.replace("/", "_")
    return _data_dir() / f"{safe_name}.json"


def load_json(collection, default=None):
    default_value = [] if default is None else default
    try:
        path = _path(collection)
    except Exception as e:
        current_app.logger.error(f"load_json({collection}) - path resolution failed: {e}")
        return default_value
    if not path.exists():
        save_json(collection, default_value)
        return default_value

    with _LOCK:
        with path.open("r", encoding="utf-8") as file:
            try:
                return json.load(file)
            except json.JSONDecodeError:
                return default_value


def save_json(collection, data):
    path = _path(collection)
    with _LOCK:
        with path.open("w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=False)
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
