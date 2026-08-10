import csv
import json
import shutil
from pathlib import Path


DATABASE_DIR = Path(__file__).resolve().parent.parent.parent / "database"
BACKUP_DIR = DATABASE_DIR / "json_backup"

ARRAY_COLLECTIONS = [
    "admins",
    "agents",
    "users",
    "properties",
    "appointments",
    "complaints",
    "enquiries",
    "messages",
    "leads",
    "notifications",
    "cities",
    "sub_areas",
    "testimonials",
    "featured_plans",
]

SINGLE_OBJECT_COLLECTIONS = ["categories", "settings"]


def serialize_cell(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def collect_headers(items):
    seen = []
    seen_set = set()
    for item in items:
        for key in item:
            if key not in seen_set:
                seen.append(key)
                seen_set.add(key)
    return seen


def migrate_array_collection(name):
    json_path = DATABASE_DIR / f"{name}.json"
    csv_path = DATABASE_DIR / f"{name}.csv"

    if not json_path.exists():
        print(f"  SKIP  {name}.json not found")
        return 0, 0

    with json_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        print(f"  WARN  {name}.json is not an array, skipping")
        return 0, 0

    json_count = len(data)

    if json_count == 0:
        csv_path.write_text("", encoding="utf-8")
        print(f"  OK    {name}: 0 rows (empty)")
        return 0, 0

    headers = collect_headers(data)

    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        for item in data:
            row = {k: serialize_cell(v) for k, v in item.items()}
            writer.writerow(row)

    csv_count = json_count
    match = "PASS" if csv_count == json_count else "MISMATCH"
    print(f"  OK    {name}: {csv_count} rows [{match}]")
    return json_count, csv_count


def migrate_single_object_collection(name):
    json_path = DATABASE_DIR / f"{name}.json"
    csv_path = DATABASE_DIR / f"{name}.csv"

    if not json_path.exists():
        print(f"  SKIP  {name}.json not found")
        return

    with json_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        print(f"  WARN  {name}.json is not an object, skipping")
        return

    wrapper = [{"_data": json.dumps(data, ensure_ascii=False)}]

    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["_data"], quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerow(wrapper[0])

    print(f"  OK    {name}: single-object stored in _data column")


def backup_json_files():
    if BACKUP_DIR.exists():
        shutil.rmtree(BACKUP_DIR)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)

    for name in ARRAY_COLLECTIONS + SINGLE_OBJECT_COLLECTIONS:
        json_path = DATABASE_DIR / f"{name}.json"
        if json_path.exists():
            shutil.copy2(json_path, BACKUP_DIR / f"{name}.json")

    print(f"  Backed up JSON files to {BACKUP_DIR}")


def verify_csv_files():
    print("\n--- Verification ---")
    all_pass = True

    for name in ARRAY_COLLECTIONS:
        json_path = BACKUP_DIR / f"{name}.json"
        csv_path = DATABASE_DIR / f"{name}.csv"

        if not json_path.exists():
            continue

        with json_path.open("r", encoding="utf-8") as f:
            json_data = json.load(f)

        if not isinstance(json_data, list):
            continue

        json_count = len(json_data)

        if not csv_path.exists():
            print(f"  FAIL  {name}.csv missing")
            all_pass = False
            continue

        with csv_path.open("r", encoding="utf-8", newline="") as f:
            content = f.read().strip()
            if not content:
                csv_count_check = 0
            else:
                f.seek(0)
                reader = csv.DictReader(f)
                csv_count_check = sum(1 for _ in reader)

        if json_count != csv_count_check:
            print(f"  FAIL  {name}: JSON={json_count}, CSV={csv_count_check}")
            all_pass = False
        else:
            print(f"  PASS  {name}: {csv_count_check} rows")

    for name in SINGLE_OBJECT_COLLECTIONS:
        json_path = BACKUP_DIR / f"{name}.json"
        csv_path = DATABASE_DIR / f"{name}.csv"

        if not json_path.exists():
            continue

        if not csv_path.exists():
            print(f"  FAIL  {name}.csv missing")
            all_pass = False
            continue

        with csv_path.open("r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        if len(rows) != 1 or "_data" not in rows[0]:
            print(f"  FAIL  {name}: expected 1 row with _data column")
            all_pass = False
            continue

        try:
            parsed = json.loads(rows[0]["_data"])
            if isinstance(parsed, dict):
                print(f"  PASS  {name}: object with {len(parsed)} keys")
            else:
                print(f"  FAIL  {name}: _data is not a JSON object")
                all_pass = False
        except json.JSONDecodeError:
            print(f"  FAIL  {name}: _data is not valid JSON")
            all_pass = False

    if all_pass:
        print("\n  All checks passed.")
    else:
        print("\n  Some checks failed. Review above.")


def main():
    print("=== JSON to CSV Migration ===\n")

    print("Step 1: Backing up JSON files")
    backup_json_files()

    print("\nStep 2: Migrating array collections")
    totals = {}
    for name in ARRAY_COLLECTIONS:
        json_count, csv_count = migrate_array_collection(name)
        totals[name] = (json_count, csv_count)

    print("\nStep 3: Migrating single-object collections")
    for name in SINGLE_OBJECT_COLLECTIONS:
        migrate_single_object_collection(name)

    verify_csv_files()

    print(f"\nOriginal JSON files preserved in: {BACKUP_DIR}")
    print("Migration complete.")


if __name__ == "__main__":
    main()
