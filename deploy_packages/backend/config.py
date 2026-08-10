import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.resolve()
load_dotenv(BASE_DIR / ".env")


def _parse_cors_origins():
    raw = os.getenv("CORS_ORIGINS", "https://manishpropertyconsultant.in")
    if not raw:
        return ["https://manishpropertyconsultant.in"]
    if raw.strip() == "*":
        return ["*"]
    origins = [
        o.strip().strip("'\"")
        for o in raw.replace(";", ",").split(",")
        if o.strip()
    ]
    return origins if origins else ["https://manishpropertyconsultant.in"]


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "estateelite-dev-secret" if os.environ.get("FLASK_ENV") == "development" else None)
    if SECRET_KEY is None:
        raise ValueError("SECRET_KEY environment variable is missing!")
        
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or os.environ.get("JWT_SECRET") or ("estateelite-jwt-dev-secret" if os.environ.get("FLASK_ENV") == "development" else None)
    if JWT_SECRET_KEY is None:
        raise ValueError("JWT_SECRET_KEY environment variable is missing!")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    DATA_FORMAT = "csv"
    _env_data_dir = os.getenv("JSON_DATA_DIR")
    if _env_data_dir:
        JSON_DATA_DIR = Path(_env_data_dir)
    else:
        JSON_DATA_DIR = (PROJECT_ROOT / "database").resolve()
    CORS_ORIGINS = _parse_cors_origins()
    PORT = int(os.getenv("PORT", "5000"))
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')
    
    # Google OAuth Configuration
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')

    # Google Places Configuration
    GOOGLE_PLACES_API_KEY = os.environ.get('GOOGLE_PLACES_API_KEY')
