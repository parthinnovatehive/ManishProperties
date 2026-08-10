"""
Unified Data Service Router.
Automatically routes queries to Supabase when configured, or falls back to the CSV engine.
"""
import os
from services import csv_service, supabase_service


def _use_supabase() -> bool:
    mode = os.getenv("DATA_BACKEND", "").lower()
    if mode == "supabase":
        return True
    if mode == "csv":
        return False
    return supabase_service.is_supabase_configured()


def load_json(collection, default=None):
    if _use_supabase():
        return supabase_service.load_json(collection, default)
    return csv_service.load_json(collection, default)


def save_json(collection, data):
    if _use_supabase():
        return supabase_service.save_json(collection, data)
    return csv_service.save_json(collection, data)


def find_one(collection, predicate):
    if _use_supabase():
        return supabase_service.find_one(collection, predicate)
    return csv_service.find_one(collection, predicate)


def update_json(collection, item_id, changes, id_field="id"):
    if _use_supabase():
        return supabase_service.update_json(collection, item_id, changes, id_field)
    return csv_service.update_json(collection, item_id, changes, id_field)


def delete_json(collection, item_id, id_field="id"):
    if _use_supabase():
        return supabase_service.delete_json(collection, item_id, id_field)
    return csv_service.delete_json(collection, item_id, id_field)


def append_json(collection, item):
    if _use_supabase():
        return supabase_service.append_json(collection, item)
    return csv_service.append_json(collection, item)
