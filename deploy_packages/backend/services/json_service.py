"""
Unified Data Service Router.
Enforced to use Supabase exclusively.
"""
from services import supabase_service

def load_json(collection, default=None):
    return supabase_service.load_json(collection, default)

def save_json(collection, data):
    return supabase_service.save_json(collection, data)

def find_one(collection, predicate):
    return supabase_service.find_one(collection, predicate)

def update_json(collection, item_id, changes, id_field="id"):
    return supabase_service.update_json(collection, item_id, changes, id_field)

def delete_json(collection, item_id, id_field="id"):
    return supabase_service.delete_json(collection, item_id, id_field)

def append_json(collection, item):
    return supabase_service.append_json(collection, item)
