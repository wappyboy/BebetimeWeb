from flask import Blueprint, request, jsonify
from app import db
from app.models import Room, User
from app.utils import token_required
import uuid

rooms_bp = Blueprint('rooms', __name__)

rooms = {}

@rooms_bp.route('/create', methods=['POST'])
@token_required
def create_room(user_id):
    data = request.get_json()
    room_name = data.get('room_name')

    if not room_name:
        return jsonify({'message': 'Room name is required'}), 400

    new_room = Room(room_name=room_name, owner_id=user_id)
    db.session.add(new_room)
    db.session.commit()

    return jsonify({
        'room_id': new_room.room_id,
        'room_name': new_room.room_name,
        'owner_id': new_room.owner_id,
        'created_at': new_room.created_at.isoformat()
    }), 201

@rooms_bp.route('/join/<string:room_id>', methods=['GET'])
@token_required
def join_room(user_id, room_id):
    room = Room.query.filter_by(room_id=room_id).first()
    if not room:
        return jsonify({'message': 'Room not found'}), 404

    # Here you could add user to room participants later
    return jsonify({
        'room_id': room.room_id,
        'room_name': room.room_name,
        'owner_id': room.owner_id,
        'created_at': room.created_at.isoformat()
    }), 200

@rooms_bp.route('/', methods=['GET'])
@token_required
def get_user_rooms(user_id):
    # Get rooms owned by user
    owned_rooms = Room.query.filter_by(owner_id=user_id).all()
    # For now just return owned rooms; can extend later for joined rooms
    
    rooms_list = [
        {
            'room_id': room.room_id,
            'room_name': room.room_name,
            'created_at': room.created_at.isoformat(),
        }
        for room in owned_rooms
    ]
    return jsonify({'rooms': rooms_list}), 200

@rooms_bp.route('/all', methods=['GET'])
@token_required
def get_all_rooms(user_id):
    rooms = Room.query.all()
    room_list = [{
        'room_id': room.room_id,
        'room_name': room.room_name,
        'owner_id': room.owner_id,
        'created_at': room.created_at.isoformat()
    } for room in rooms]
    
    return jsonify(room_list), 200
