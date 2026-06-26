from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config
from routes.admins import admins_bp
from routes.agents import agents_bp
from routes.appointments import appointments_bp
from routes.auth import auth_bp
from routes.complaints import complaints_bp
from routes.content import content_bp
from routes.messages import messages_bp
from routes.properties import properties_bp
from routes.super_admin import super_admin_bp
from routes.users import users_bp
from utils.helpers import error_response
from routes.cities import cities_bp
from routes.subareas import subareas_bp
from routes.notifications import notifications_bp

jwt = JWTManager()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configure CORS properly - this is the only CORS configuration needed
    # Use CORS_ORIGINS from config
    cors_origins = Config.CORS_ORIGINS if hasattr(Config, 'CORS_ORIGINS') else ["http://localhost:3000"]
    CORS(
        app,
        origins=cors_origins,
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "Accept", "X-Requested-With"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )
    
    jwt.init_app(app)

    @app.get("/")
    def index():
        return "API Running"

    register_blueprints(app)
    register_error_handlers(app)
    register_jwt_handlers(jwt)
    return app


def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(auth_bp, url_prefix="/api/admin", name="admin_auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(agents_bp, url_prefix="/api/agents")
    app.register_blueprint(admins_bp, url_prefix="/api/admins")
    app.register_blueprint(super_admin_bp, url_prefix="/api/super-admin")
    app.register_blueprint(properties_bp, url_prefix="/api/properties")
    app.register_blueprint(properties_bp, url_prefix="/api/public", name="public_properties")
    app.register_blueprint(properties_bp, url_prefix="/api/admin", name="admin_properties")
    app.register_blueprint(appointments_bp, url_prefix="/api/appointments")
    app.register_blueprint(complaints_bp, url_prefix="/api/complaints")
    app.register_blueprint(messages_bp, url_prefix="/api/messages")
    app.register_blueprint(content_bp, url_prefix="/api/content")
    app.register_blueprint(cities_bp, url_prefix="/api/cities")
    app.register_blueprint(subareas_bp, url_prefix="/api/subareas")
    app.register_blueprint(notifications_bp, url_prefix="/api/notifications")


def register_error_handlers(app):
    @app.errorhandler(404)
    def not_found(_error):
        return error_response("Route not found", 404)

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return error_response("Method not allowed", 405)

    @app.errorhandler(Exception)
    def unhandled_error(error):
        app.logger.exception(error)
        return error_response("Server error", 500)


def register_jwt_handlers(jwt_manager):
    from services.auth_service import SUSPENDED_ACCOUNT_MESSAGE, find_account_by_id, is_suspended

    @jwt_manager.unauthorized_loader
    def missing_token(message):
        return error_response(message or "No token provided", 401)

    @jwt_manager.invalid_token_loader
    def invalid_token(message):
        return error_response(message or "Unauthorized", 401)

    @jwt_manager.expired_token_loader
    def expired_token(_header, _payload):
        return error_response("Token has expired", 401)

    @jwt_manager.token_in_blocklist_loader
    def suspended_account(_header, payload):
        account = find_account_by_id(payload.get("sub"))
        return bool(account and is_suspended(account))

    @jwt_manager.revoked_token_loader
    def suspended_token(_header, _payload):
        return error_response(SUSPENDED_ACCOUNT_MESSAGE, 403)


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=Config.PORT)