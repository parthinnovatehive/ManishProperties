import os
import sys

def validate_env():
    required = [
        "SECRET_KEY",
        "JWT_SECRET_KEY",
        "CORS_ORIGINS"
    ]
    
    # If using Supabase, require its keys
    if os.getenv("DATA_BACKEND", "").lower() == "supabase":
        required.extend(["SUPABASE_URL", "SUPABASE_KEY", "SUPABASE_SERVICE_ROLE_KEY"])
        
    missing = [key for key in required if not os.getenv(key)]
    
    if missing:
        msg = f"Missing required backend environment variables: {', '.join(missing)}"
        if os.getenv("FLASK_ENV") != "development":
            import json
            from datetime import datetime
            sys.stderr.write(json.dumps({
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "level": "CRITICAL",
                "message": msg
            }) + "\n")
            sys.exit(1)
        else:
            print(f"[WARNING] {msg}")
