import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPLOY_DIR = os.path.join(ROOT_DIR, "deploy_packages")
FRONTEND_DEPLOY = os.path.join(DEPLOY_DIR, "frontend")
BACKEND_DEPLOY = os.path.join(DEPLOY_DIR, "backend")

def verify():
    print("=== Verifying Deployment Packages ===")
    
    # Frontend verification
    frontend_req = [
        "server.js", "app.js", "package.json", ".env.production",
        ".nvmrc", ".next", "public", "node_modules"
    ]
    for item in frontend_req:
        p = os.path.join(FRONTEND_DEPLOY, item)
        if not os.path.exists(p):
            print(f"[FAIL] Missing frontend required file/folder: {item}. Did the standalone build fail?")
            sys.exit(1)
            
    # Backend verification
    backend_req = [
        "app.py", "config.py", "passenger_wsgi.py", "requirements.txt",
        "wsgi.py", "__init__.py", "routes", "services", "middleware", 
        "models", "utils", "validate_env.py"
    ]
    for item in backend_req:
        p = os.path.join(BACKEND_DEPLOY, item)
        if not os.path.exists(p):
            print(f"[FAIL] Missing backend required file/folder: {item}")
            sys.exit(1)
            
    # Environment variable leaks & DB checks
    if os.path.exists(os.path.join(FRONTEND_DEPLOY, ".env.local")):
        print(f"[FAIL] Frontend .env.local was packaged. Security risk!")
        sys.exit(1)
        
    if os.path.exists(os.path.join(BACKEND_DEPLOY, ".env")):
        print(f"[FAIL] Backend .env was packaged. Security risk!")
        sys.exit(1)
        
    if os.path.exists(os.path.join(BACKEND_DEPLOY, "database", "otp.db")):
        print(f"[FAIL] Backend otp.db was packaged. Production state risk!")
        sys.exit(1)

    # Domain hardcode check
    def check_domains(directory):
        bad_domains = ["ashwinghadi.online", "localhost:3000"]
        for root, dirs, files in os.walk(directory):
            if "node_modules" in dirs:
                dirs.remove("node_modules")
            if ".next" in dirs:
                dirs.remove(".next")
            for f in files:
                if f.endswith(".js") or f.endswith(".py") or f.endswith(".ts") or f.endswith(".json") or f.endswith(".xml") or f.endswith(".txt"):
                    filepath = os.path.join(root, f)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as file:
                            content = file.read()
                            for bad in bad_domains:
                                if bad in content:
                                    print(f"[WARN] Found forbidden domain '{bad}' in {filepath}")
                    except Exception:
                        pass
                        
    check_domains(FRONTEND_DEPLOY)
    check_domains(BACKEND_DEPLOY)
        
    print("[OK] Verification passed. All required files are present, standalone is intact, and no dev secrets leaked.")

if __name__ == "__main__":
    verify()
