import os
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPLOY_DIR = os.path.join(ROOT_DIR, "deploy_packages")
BACKEND_DEPLOY = os.path.join(DEPLOY_DIR, "backend")

def clean_deploy_dir():
    if os.path.exists(BACKEND_DEPLOY):
        print(f"Cleaning existing backend deploy folder: {BACKEND_DEPLOY}")
        shutil.rmtree(BACKEND_DEPLOY)
    os.makedirs(BACKEND_DEPLOY, exist_ok=True)

def copy_backend_files():
    backend_src = os.path.join(ROOT_DIR, "backend")
    print(f"Packaging backend from {backend_src} to {BACKEND_DEPLOY}")
    
    files_to_copy = [
        "app.py", "config.py", "passenger_wsgi.py", "requirements.txt",
        "wsgi.py", "__init__.py", "routes", "services", "middleware", 
        "models", "utils", "validate_env.py"
    ]
    
    for item in files_to_copy:
        src = os.path.join(backend_src, item)
        dst = os.path.join(BACKEND_DEPLOY, item)
        
        if os.path.exists(src):
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
        else:
            print(f"Warning: {src} does not exist.")
            
def main():
    print("=== Preparing Backend Deployment ===")
    clean_deploy_dir()
    copy_backend_files()
    print("Backend packaged successfully.")

if __name__ == "__main__":
    main()
