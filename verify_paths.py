import os
import sys

paths_to_check = [
    r"deploy_packages\frontend\server.js",
    r"deploy_packages\frontend\package.json",
    r"deploy_packages\frontend\node_modules\next",
    r"deploy_packages\frontend\.next\static",
    r"deploy_packages\frontend\public",
    r"deploy_packages\frontend\app.js",
]

false_paths = [
    r"deploy_packages\frontend\.next\standalone\server.js",
    r"deploy_packages\frontend\server.js.bak",
    r"deploy_packages\frontend\frontend\server.js",
]

print("=== VERIFYING REQUIRED TRUE PATHS ===")
for p in paths_to_check:
    full_path = os.path.join(os.getcwd(), p)
    exists = os.path.exists(full_path)
    print(f"Test-Path {p} => {exists}")

print("\n=== VERIFYING REQUIRED FALSE PATHS ===")
for p in false_paths:
    full_path = os.path.join(os.getcwd(), p)
    exists = os.path.exists(full_path)
    print(f"Test-Path {p} => {exists}")
