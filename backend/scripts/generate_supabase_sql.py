"""
Generate complete PostgreSQL / Supabase SQL DDL and Seed Data from existing CSV database.
"""
import csv
import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_DIR = BASE_DIR / "database"
OUTPUT_SQL = BASE_DIR / "supabase_schema_and_data.sql"

def sql_quote(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (dict, list)):
        s = json.dumps(val, ensure_ascii=False)
        s_escaped = s.replace("'", "''")
        return f"'{s_escaped}'::jsonb"
    # String - strip and sanitize
    s = str(val).replace("\r\n", "\\n").replace("\r", "\\n").replace("\n", "\\n")
    s_escaped = s.replace("'", "''")
    return f"'{s_escaped}'"

def deserialize_val(v):
    if v is None or v == "":
        return None
    try:
        parsed = json.loads(v)
        if isinstance(parsed, (dict, list)):
            return parsed
    except Exception:
        pass
    if v.lower() == "true":
        return True
    if v.lower() == "false":
        return False
    return v

def generate_sql():
    sql_lines = [
        "-- ============================================================================",
        "-- EstateElite - Complete Supabase PostgreSQL Schema and Data Migration Script",
        "-- Compatible with Supabase SQL Editor / Standard PostgreSQL 14+",
        "-- Generated automatically from database CSV collections",
        "-- ============================================================================",
        "",
        "-- Enable UUID & Crypto extensions",
        "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";",
        "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";",
        "",
    ]

    # Tables definitions - Robust, nullable schema mapping to prevent constraint failures with legacy data
    table_defs = {
        "admins": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('username', 'TEXT'),
                ('email', 'TEXT'),
                ('passwordHash', 'TEXT'),
                ('role', "TEXT DEFAULT 'ADMIN'"),
                ('name', 'TEXT'),
                ('phone', 'TEXT'),
                ('savedProperties', "JSONB DEFAULT '[]'::jsonb"),
                ('status', "TEXT DEFAULT 'active'"),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "agents": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('username', 'TEXT'),
                ('email', 'TEXT'),
                ('passwordHash', 'TEXT'),
                ('role', "TEXT DEFAULT 'AGENT'"),
                ('name', 'TEXT'),
                ('phone', 'TEXT'),
                ('status', "TEXT DEFAULT 'active'"),
                ('savedProperties', "JSONB DEFAULT '[]'::jsonb"),
                ('sub_area_ids', "JSONB DEFAULT '[]'::jsonb"),
                ('city_id', 'TEXT'),
                ('sub_area_id', 'TEXT'),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "users": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('username', 'TEXT'),
                ('name', 'TEXT'),
                ('email', 'TEXT'),
                ('phone', 'TEXT'),
                ('role', "TEXT DEFAULT 'USER'"),
                ('savedProperties', "JSONB DEFAULT '[]'::jsonb"),
                ('status', "TEXT DEFAULT 'active'"),
                ('passwordHash', 'TEXT'),
                ('agentRatings', "JSONB DEFAULT '[]'::jsonb"),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "cities": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('name', 'TEXT'),
                ('image', 'TEXT'),
                ('admin_id', 'TEXT'),
                ('status', "TEXT DEFAULT 'active'"),
                ('count', 'TEXT'),
            ]
        },
        "sub_areas": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('name', 'TEXT'),
                ('city_id', 'TEXT'),
                ('status', "TEXT DEFAULT 'active'"),
                ('slug', 'TEXT'),
                ('agent_ids', "JSONB DEFAULT '[]'::jsonb"),
            ]
        },
        "properties": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('lister_type', 'TEXT'),
                ('lister_id', 'TEXT'),
                ('lister_name', 'TEXT'),
                ('title', 'TEXT'),
                ('subtitle', 'TEXT'),
                ('description', 'TEXT'),
                ('price', 'TEXT'),
                ('priceNum', 'NUMERIC'),
                ('city', 'TEXT'),
                ('city_id', 'TEXT'),
                ('sub_area_id', 'TEXT'),
                ('state', 'TEXT'),
                ('location', 'TEXT'),
                ('fullLocation', 'TEXT'),
                ('category', 'TEXT'),
                ('type', 'TEXT'),
                ('listingType', 'TEXT'),
                ('beds', 'INTEGER'),
                ('bathrooms', 'INTEGER'),
                ('baths', 'INTEGER'),
                ('area', 'NUMERIC'),
                ('amenities', "JSONB DEFAULT '[]'::jsonb"),
                ('images', "JSONB DEFAULT '[]'::jsonb"),
                ('imgs', "JSONB DEFAULT '[]'::jsonb"),
                ('image', 'TEXT'),
                ('img', 'TEXT'),
                ('cloudinaryImages', "JSONB DEFAULT '[]'::jsonb"),
                ('coordinates', "JSONB DEFAULT '{}'::jsonb"),
                ('nearbyAmenities', "JSONB DEFAULT '[]'::jsonb"),
                ('builder', 'TEXT'),
                ('rating', 'NUMERIC DEFAULT 0'),
                ('reviews', 'INTEGER DEFAULT 0'),
                ('featured', 'BOOLEAN DEFAULT FALSE'),
                ('featuredRequested', 'BOOLEAN DEFAULT FALSE'),
                ('requested_for', 'INTEGER'),
                ('granted_for', 'INTEGER'),
                ('featuredRequestDate', 'TEXT'),
                ('featuredPaymentStatus', 'TEXT'),
                ('featuredPaymentProof', 'TEXT'),
                ('featuredPaymentAmount', 'NUMERIC'),
                ('featuredApprovedBy', 'TEXT'),
                ('featuredApprovedAt', 'TEXT'),
                ('featuredExpiryDate', 'TEXT'),
                ('featuredExpired', 'BOOLEAN DEFAULT FALSE'),
                ('isNew', 'BOOLEAN DEFAULT FALSE'),
                ('status', "TEXT DEFAULT 'approved'"),
                ('moderationStatus', "TEXT DEFAULT 'approved'"),
                ('views', 'INTEGER DEFAULT 0'),
                ('pincode', 'TEXT'),
                ('furnishing', 'TEXT'),
                ('officeType', 'TEXT'),
                ('pantry', 'TEXT'),
                ('washrooms', 'INTEGER'),
                ('parking', 'TEXT'),
                ('powerBackup', 'TEXT'),
                ('cabinCount', 'INTEGER'),
                ('conferenceRoom', 'TEXT'),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "appointments": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('propertyId', 'TEXT'),
                ('propertyName', 'TEXT'),
                ('userId', 'TEXT'),
                ('userName', 'TEXT'),
                ('agent_id', 'TEXT'),
                ('agentId', 'TEXT'),
                ('agentName', 'TEXT'),
                ('agentEmail', 'TEXT'),
                ('agentPhone', 'TEXT'),
                ('date', 'TEXT'),
                ('time', 'TEXT'),
                ('status', "TEXT DEFAULT 'Pending'"),
                ('type', "TEXT DEFAULT 'In-Person'"),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "complaints": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('propertyId', 'TEXT'),
                ('userId', 'TEXT'),
                ('subject', 'TEXT'),
                ('description', 'TEXT'),
                ('status', "TEXT DEFAULT 'pending'"),
                ('priority', "TEXT DEFAULT 'medium'"),
                ('actionTaken', 'TEXT'),
                ('resolutionNotes', 'TEXT'),
                ('resolvedAt', 'TEXT'),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "enquiries": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('propertyId', 'TEXT'),
                ('propertyTitle', 'TEXT'),
                ('userName', 'TEXT'),
                ('userEmail', 'TEXT'),
                ('userPhone', 'TEXT'),
                ('agentId', 'TEXT'),
                ('agentName', 'TEXT'),
                ('agentEmail', 'TEXT'),
                ('agentPhone', 'TEXT'),
                ('message', 'TEXT'),
                ('status', "TEXT DEFAULT 'Pending'"),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "featured_plans": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('name', 'TEXT'),
                ('requested_for', 'INTEGER'),
                ('duration', 'INTEGER'),
                ('price', 'NUMERIC'),
                ('description', 'TEXT'),
                ('features', "JSONB DEFAULT '[]'::jsonb"),
            ]
        },
        "notifications": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('userId', 'TEXT'),
                ('userType', 'TEXT'),
                ('title', 'TEXT'),
                ('message', 'TEXT'),
                ('type', 'TEXT'),
                ('relatedId', 'TEXT'),
                ('isRead', 'BOOLEAN DEFAULT FALSE'),
                ('actionUrl', 'TEXT'),
                ('icon', 'TEXT'),
                ('createdAt', 'TEXT'),
            ]
        },
        "testimonials": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('name', 'TEXT'),
                ('role', 'TEXT'),
                ('rating', 'NUMERIC DEFAULT 5'),
                ('content', 'TEXT'),
                ('avatar', 'TEXT'),
            ]
        },
        "categories": {
            "columns": [
                ('id', "TEXT PRIMARY KEY DEFAULT 'main'"),
                ('data', 'JSONB NOT NULL'),
            ]
        },
        "settings": {
            "columns": [
                ('id', "TEXT PRIMARY KEY DEFAULT 'main'"),
                ('data', 'JSONB NOT NULL'),
            ]
        },
        "leads": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('agentId', 'TEXT'),
                ('name', 'TEXT'),
                ('email', 'TEXT'),
                ('phone', 'TEXT'),
                ('propertyId', 'TEXT'),
                ('status', "TEXT DEFAULT 'new'"),
                ('notes', 'TEXT'),
                ('createdAt', 'TEXT'),
                ('updatedAt', 'TEXT'),
            ]
        },
        "messages": {
            "columns": [
                ('id', 'TEXT PRIMARY KEY'),
                ('senderId', 'TEXT'),
                ('receiverId', 'TEXT'),
                ('content', 'TEXT'),
                ('isRead', 'BOOLEAN DEFAULT FALSE'),
                ('createdAt', 'TEXT'),
            ]
        },
    }

    # Step 1: Create Tables
    sql_lines.append("-- ----------------------------------------------------------------------------")
    sql_lines.append("-- 1. CREATE TABLES (CLEAN RESET)")
    sql_lines.append("-- ----------------------------------------------------------------------------")
    for tbl_name, tbl_meta in table_defs.items():
        sql_lines.append(f"DROP TABLE IF EXISTS public.\"{tbl_name}\" CASCADE;")
        sql_lines.append(f"CREATE TABLE public.\"{tbl_name}\" (")
        col_strs = []
        for col_name, col_type in tbl_meta["columns"]:
            col_strs.append(f"    \"{col_name}\" {col_type}")
        sql_lines.append(",\n".join(col_strs))
        sql_lines.append(");")
        sql_lines.append(f"ALTER TABLE public.\"{tbl_name}\" ENABLE ROW LEVEL SECURITY;")
        sql_lines.append(f"DROP POLICY IF EXISTS \"Allow public read on {tbl_name}\" ON public.\"{tbl_name}\";")
        sql_lines.append(f"CREATE POLICY \"Allow public read on {tbl_name}\" ON public.\"{tbl_name}\" FOR SELECT USING (true);")
        sql_lines.append(f"DROP POLICY IF EXISTS \"Allow service role all on {tbl_name}\" ON public.\"{tbl_name}\";")
        sql_lines.append(f"CREATE POLICY \"Allow service role all on {tbl_name}\" ON public.\"{tbl_name}\" FOR ALL USING (true) WITH CHECK (true);")
        sql_lines.append("")

    # Step 2: Insert Data
    sql_lines.append("-- ----------------------------------------------------------------------------")
    sql_lines.append("-- 2. SEED DATA FROM CSV COLLECTIONS")
    sql_lines.append("-- ----------------------------------------------------------------------------")

    for tbl_name in table_defs:
        csv_path = DB_DIR / f"{tbl_name}.csv"
        if not csv_path.exists():
            continue

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        if not rows:
            continue

        sql_lines.append(f"-- Data for {tbl_name} ({len(rows)} records)")
        
        # Single object collections like categories & settings
        if tbl_name in ("categories", "settings"):
            for row in rows:
                raw_data = row.get("_data", "{}")
                try:
                    parsed = json.loads(raw_data)
                except Exception:
                    parsed = raw_data
                quoted_data = sql_quote(parsed)
                sql_lines.append(
                    f"INSERT INTO public.\"{tbl_name}\" (\"id\", \"data\") "
                    f"VALUES ('main', {quoted_data}) "
                    f"ON CONFLICT (\"id\") DO UPDATE SET \"data\" = EXCLUDED.\"data\";"
                )
            sql_lines.append("")
            continue

        # Standard collections
        tbl_columns = [col[0] for col in table_defs[tbl_name]["columns"]]
        col_list_str = ", ".join(f'"{c}"' for c in tbl_columns)

        for row in rows:
            val_strs = []
            for col in tbl_columns:
                raw_v = row.get(col)
                deserialized = deserialize_val(raw_v)
                val_strs.append(sql_quote(deserialized))
            val_list_str = ", ".join(val_strs)
            sql_lines.append(
                f"INSERT INTO public.\"{tbl_name}\" ({col_list_str}) "
                f"VALUES ({val_list_str}) "
                f"ON CONFLICT (\"id\") DO NOTHING;"
            )
        sql_lines.append("")

    # Step 3: Performance Indexes
    sql_lines.append("-- ----------------------------------------------------------------------------")
    sql_lines.append("-- 3. PERFORMANCE INDEXES")
    sql_lines.append("-- ----------------------------------------------------------------------------")
    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_properties_city_id ON public.\"properties\" (\"city_id\");",
        "CREATE INDEX IF NOT EXISTS idx_properties_sub_area_id ON public.\"properties\" (\"sub_area_id\");",
        "CREATE INDEX IF NOT EXISTS idx_properties_status ON public.\"properties\" (\"status\");",
        "CREATE INDEX IF NOT EXISTS idx_properties_lister_id ON public.\"properties\" (\"lister_id\");",
        "CREATE INDEX IF NOT EXISTS idx_sub_areas_city_id ON public.\"sub_areas\" (\"city_id\");",
        "CREATE INDEX IF NOT EXISTS idx_appointments_userId ON public.\"appointments\" (\"userId\");",
        "CREATE INDEX IF NOT EXISTS idx_appointments_agentId ON public.\"appointments\" (\"agentId\");",
        "CREATE INDEX IF NOT EXISTS idx_notifications_userId ON public.\"notifications\" (\"userId\");",
        "CREATE INDEX IF NOT EXISTS idx_enquiries_propertyId ON public.\"enquiries\" (\"propertyId\");",
    ]
    sql_lines.extend(indexes)
    sql_lines.append("")

    # Write to output file
    with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql_lines))

    print(f"Generated SQL file successfully at: {OUTPUT_SQL}")
    print(f"Total lines: {len(sql_lines)}")

if __name__ == "__main__":
    generate_sql()
