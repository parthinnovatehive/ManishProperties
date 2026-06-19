import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
load_dotenv(BASE_DIR / ".env")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "estateelite-dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or os.getenv("JWT_SECRET") or "estateelite-jwt-dev-secret"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JSON_DATA_DIR = Path(os.getenv("JSON_DATA_DIR", PROJECT_ROOT / "database"))
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://0.0.0.0:3000,http://192.168.*.*:3000,http://10.*.*.*:3000,http://172.16.*.*:3000,http://172.17.*.*:3000,http://172.18.*.*:3000,http://172.19.*.*:3000,http://172.20.*.*:3000,http://172.21.*.*:3000,http://172.22.*.*:3000,http://172.23.*.*:3000,http://172.24.*.*:3000,http://172.25.*.*:3000,http://172.26.*.*:3000,http://172.27.*.*:3000,http://172.28.*.*:3000,http://172.29.*.*:3000,http://172.30.*.*:3000,http://172.31.*.*:3000",
    ).split(",")
    PORT = int(os.getenv("PORT", "5000"))
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')
    
    # Google Places Configuration
    GOOGLE_PLACES_API_KEY = os.environ.get('GOOGLE_PLACES_API_KEY')
