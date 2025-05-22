from flask import Blueprint, jsonify
from app.utils import token_required
from app.models import User
from app import db

test_bp = Blueprint('test', __name__)

@test_bp.route('/profile', methods=['GET'])
@token_required
def profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat()
    })
