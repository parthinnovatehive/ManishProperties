import sys
import os
from pathlib import Path

# Add the application directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to load environment variables from .env file if it exists (for testing/local)
# In cPanel, these should be set in the Python App Manager UI
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
if os.path.exists(env_path):
    from dotenv import load_dotenv
    load_dotenv(env_path)

# Ensure FLASK_ENV is set to production by default if missing
if not os.environ.get("FLASK_ENV"):
    os.environ["FLASK_ENV"] = "production"

# Import and create the Flask application
from app import create_app

application = create_app()
