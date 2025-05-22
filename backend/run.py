from flask_cors import CORS
from flask_socketio import SocketIO, join_room, leave_room, emit
from app import create_app

app = create_app()
CORS(app, supports_credentials=True)

socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def hello():
    return "Server running..."

@socketio.on("join_room")
def handle_join(data):
    room = data["room"]
    username = data.get("username", "Unknown")
    join_room(room)
    emit("receive_message", {"sender": "System", "message": f"{username} joined the room."}, room=room)

@socketio.on("leave_room")
def handle_leave(data):
    room = data["room"]
    username = data.get("username", "Unknown")
    leave_room(room)
    emit("receive_message", {"sender": "System", "message": f"{username} left the room."}, room=room)

@socketio.on("send_message")
def handle_message(data):
    room = data["room"]
    message = data["message"]
    username = data["username"]
    emit("receive_message", {"sender": username, "message": message}, room=room)

# === WebRTC signaling handlers ===

@socketio.on("webrtc_offer")
def handle_webrtc_offer(data):
    room = data["room"]
    offer = data["offer"]
    username = data.get("username", "Unknown")
    # Send the offer to all clients in the room except the sender
    emit("webrtc_offer", {"offer": offer, "username": username}, room=room, include_self=False)

@socketio.on("webrtc_answer")
def handle_webrtc_answer(data):
    room = data["room"]
    answer = data["answer"]
    username = data.get("username", "Unknown")
    emit("webrtc_answer", {"answer": answer, "username": username}, room=room, include_self=False)

@socketio.on("webrtc_ice_candidate")
def handle_webrtc_ice_candidate(data):
    room = data["room"]
    candidate = data["candidate"]
    username = data.get("username", "Unknown")
    emit("webrtc_ice_candidate", {"candidate": candidate, "username": username}, room=room, include_self=False)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
