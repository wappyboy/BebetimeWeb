import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {
  const { user } = useAuth();
  const [roomName, setRoomName] = useState("");
  const [error] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    const res = await fetch("http://localhost:5000/api/rooms/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ room_name: roomName }),
    });

    const data = await res.json();
    if (res.ok) {
       navigate(`/room/${data.room_id}`);
      // optionally navigate to room
    } else {
      alert(data.message || "Error creating room");
    }
  };

 return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Create a Room</h1>
      <input
        type="text"
        placeholder="Enter room name"
        className="mb-4 px-4 py-2 rounded bg-gray-800 border border-gray-700"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
      />
      <button
        onClick={handleCreate}
        className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
      >
        Create
      </button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default CreateRoom;
