import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/join/${roomId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the room page
        navigate(`/room/${roomId}`);
      } else {
        setError(data.message || "Room not found");
      }
    } catch (err) {
      console.log(err)
      setError("Server error");
    }
  };

   return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <header className="w-full max-w-md flex justify-between mb-6">
        <button
          onClick={() => navigate("/profile")}
          className="text-blue-400 hover:underline"
        >
          Profile
        </button>
        <button
          onClick={logout}
          className="text-red-500 hover:underline"
        >
          Logout
        </button>
      </header>

      <h1 className="text-3xl font-bold mb-6">Join a Room</h1>

      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter room ID"
        className="mb-4 px-4 py-3 rounded text-black w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />

      <button
        onClick={handleJoinRoom}
        className={`w-full max-w-md py-3 rounded text-white font-semibold ${
          loading ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
        disabled={loading}
      >
        {loading ? "Joining..." : "Join"}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}
    </div>
  );
};

export default JoinRoom;
