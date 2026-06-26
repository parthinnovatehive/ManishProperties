"""
Migration script: Add category field to existing properties.

Residential types: Apartment, Villa, Penthouse, Studio, Row House, Farmhouse, Builder Floor, Plot
Commercial types: Commercial, Office, Shop, Warehouse

Run: python -m backend.scripts.migrate_property_category
"""

import json
from pathlib import Path


RESIDENTIAL_TYPES = {
    "Apartment", "Villa", "Penthouse", "Studio",
    "Row House", "Farmhouse", "Builder Floor", "Plot",
}

COMMERCIAL_TYPES = {
    "Commercial", "Office", "Shop", "Warehouse",
    "Retail Space", "Showroom", "Industrial", "Coworking",
}


def migrate_property_category():
    data_dir = Path(__file__).resolve().parent.parent / "json_data"
    properties_file = data_dir / "properties.json"

    if not properties_file.exists():
        print(f"❌ properties.json not found at {properties_file}")
        return

    with open(properties_file, "r", encoding="utf-8") as f:
        properties = json.load(f)

    updated = 0
    for prop in properties:
        if "category" not in prop:
            prop_type = prop.get("type", "")
            if prop_type in COMMERCIAL_TYPES:
                prop["category"] = "commercial"
            else:
                prop["category"] = "residential"
            updated += 1

    with open(properties_file, "w", encoding="utf-8") as f:
        json.dump(properties, f, indent=2, ensure_ascii=False)

    print(f"✅ Updated {updated} properties with category field")


if __name__ == "__main__":
    migrate_property_category()
