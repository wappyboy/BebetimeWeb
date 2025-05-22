import { useEffect, useState, Fragment, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";

type Room = {
  room_id: string;
  room_name: string;
  owner_id: string;
  created_at: string;
};

const RoomPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

const fetchRooms = useCallback(() => {
    if (!user?.token) return;

    fetch("http://localhost:5000/api/rooms/all", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then(setRooms)
      .catch(console.error);
  }, [user?.token]);

  // ✅ Now ESLint won't complain
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCreateRoom = async () => {
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
      setIsCreateOpen(false);
      navigate(`/room/${data.room_id}`);
    } else {
      alert(data.message);
    }
  };

  const handleJoinRoom = () => {
    setIsJoinOpen(false);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">BEBETIME Rooms</h1>
      <p className="text-gray-400 mb-6">Create or join a room to hang out!</p>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          Create Room
        </button>
        <button
          onClick={() => setIsJoinOpen(true)}
          className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition"
        >
          Join Room
        </button>
      </div>

      {/* Room List */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.length === 0 ? (
          <p className="text-gray-400 text-center col-span-2">No rooms available yet.</p>
        ) : (
          rooms.map((room) => (
            <div
              key={room.room_id}
              className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">{room.room_name}</h2>
                <p className="text-sm text-gray-400">
                  Created: {new Date(room.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => navigate(`/room/${room.room_id}`)}
                className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition"
              >
                Enter Room
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Transition appear show={isCreateOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsCreateOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium text-gray-900">Create a Room</Dialog.Title>
              <input
                type="text"
                placeholder="Room name"
                className="mt-4 w-full px-4 py-2 border rounded"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setIsCreateOpen(false)} className="text-gray-500">
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>

      {/* Join Modal */}
      <Transition appear show={isJoinOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsJoinOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium text-gray-900">Join a Room</Dialog.Title>
              <input
                type="text"
                placeholder="Enter Room ID"
                className="mt-4 w-full px-4 py-2 border rounded"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setIsJoinOpen(false)} className="text-gray-500">
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Join
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default RoomPage;
