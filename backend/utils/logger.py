import logging
import json
import os
from datetime import datetime
from flask import request, has_request_context

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        
        if has_request_context():
            log_data["request_id"] = request.headers.get("X-Request-ID", "")
            log_data["method"] = request.method
            log_data["url"] = request.url
            log_data["remote_addr"] = request.remote_addr
            
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_data)

def setup_logger(app):
    is_production = os.getenv("FLASK_ENV") != "development"
    
    # Remove default handlers
    app.logger.handlers.clear()
    
    handler = logging.StreamHandler()
    
    if is_production:
        handler.setFormatter(JSONFormatter())
        app.logger.setLevel(logging.INFO)
    else:
        # Pretty console logging for development
        formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] %(message)s')
        handler.setFormatter(formatter)
        app.logger.setLevel(logging.DEBUG)
        
    app.logger.addHandler(handler)
    return app.logger
