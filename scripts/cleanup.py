import os
import shutil

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEPLOY_DIR = os.path.join(ROOT_DIR, "deploy_packages")

def cleanup():
    print("=== Cleaning Up Deployment Packages ===")
    if os.path.exists(DEPLOY_DIR):
        shutil.rmtree(DEPLOY_DIR)
        print(f"Removed {DEPLOY_DIR}")
        
    # Also delete the old build_deploy.ps1 since we moved to the scripts/ architecture
    old_script = os.path.join(ROOT_DIR, "build_deploy.ps1")
    if os.path.exists(old_script):
        os.remove(old_script)
        print(f"Removed old {old_script}")
        
    # Delete old static sitemap if it exists
    old_sitemap = os.path.join(ROOT_DIR, "frontend", "public", "sitemap.xml")
    if os.path.exists(old_sitemap):
        os.remove(old_sitemap)
        print(f"Removed static {old_sitemap}")

    print("Cleanup complete.")

if __name__ == "__main__":
    cleanup()
