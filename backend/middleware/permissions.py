from functools import wraps
from flask import jsonify, request
import jwt
from config import Config

def role_required(allowed_roles):
    """Decorator to check if user has any of the allowed roles"""
    allowed_set = {r.upper() for r in allowed_roles}
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = request.headers.get('Authorization')
            if not token:
                return jsonify({'message': 'Token is missing!'}), 401
            
            try:
                token = token.split(' ')[1]
                data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
                if data.get('role', '').upper() not in allowed_set:
                    return jsonify({'message': 'Insufficient permissions!'}), 403
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token!'}), 401
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required(f):
    """Convenience decorator for admin role"""
    return role_required(['admin'])(f)

def super_admin_required(f):
    """Convenience decorator for super_admin role"""
    return role_required(['super_admin'])(f)