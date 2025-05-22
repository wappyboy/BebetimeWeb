import jwt
import datetime
from flask import current_app
from . import bcrypt
from functools import wraps
from flask import request, jsonify

def hash_password(password: str) -> str:
    return bcrypt.generate_password_hash(password).decode('utf-8')

def check_password(hashed_password: str, password: str) -> bool:
    return bcrypt.check_password_hash(hashed_password, password)

def create_access_token(user_id: int, expires_in=3600):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # JWT token sent in Authorization header: Bearer <token>
        auth_header = request.headers.get('Authorization')
        if auth_header and ' ' in auth_header:
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        user_id = decode_access_token(token)
        if not user_id:
            return jsonify({'message': 'Token is invalid or expired!'}), 401

        # Attach user_id to the function's kwargs
        return f(user_id=user_id, *args, **kwargs)

    return decorated