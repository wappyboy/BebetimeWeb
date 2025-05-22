import { useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import ChatBox from "../components/ChatBox";
import ScreenShare from "../components/ScreenShare";

import {
  ChatBubbleLeftRightIcon,
  PhoneXMarkIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";

type RoomData = {
  room_id: string;
  room_name: string;
  owner_id: number;
  created_at: string;
};

const Room = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [error, setError] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isScreenMinimized, setIsScreenMinimized] = useState(false);
  const [isScreenFullscreen, setIsScreenFullscreen] = useState(false);

  const fetchRoom = useCallback(async () => {
    if (!room_id) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/join/${room_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) setRoom(data);
      else setError(data.message || "Failed to join room");
    } catch {
      setError("Server error");
    }
  }, [room_id, user?.token]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500 p-6">
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-6">
        <p className="animate-pulse text-gray-400 text-xl font-semibold">
          Loading room...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-700 shadow-sm">
        <h1 className="text-3xl font-bold truncate">{room.room_name}</h1>
        <nav className="flex items-center space-x-4">
          <button
            onClick={() => setIsChatVisible((v) => !v)}
            aria-label={isChatVisible ? "Hide Chat" : "Show Chat"}
            className="p-2 rounded-md hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-300" />
          </button>
          <button
            onClick={() => alert("Leave room functionality here")}
            aria-label="Leave Call"
            className="p-2 rounded-md hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            <PhoneXMarkIcon className="h-6 w-6 text-red-600" />
          </button>
          <button
            onClick={() => alert("Settings")}
            aria-label="Settings"
            className="p-2 rounded-md hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Cog6ToothIcon className="h-6 w-6 text-gray-300" />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Screen share/video section */}
        <main
          className={`relative flex flex-col bg-gray-800 rounded-lg shadow-lg p-4 transition-all duration-300 ${
            isScreenFullscreen
              ? "fixed top-0 left-0 z-50 w-full h-full rounded-none"
              : isScreenMinimized
              ? "w-80 h-44"
              : "flex-grow"
          }`}
        >
          {/* Controls */}
          <div className="absolute top-3 right-3 flex space-x-2 z-50">
            <button
              onClick={() => setIsScreenMinimized((v) => !v)}
              aria-label={isScreenMinimized ? "Restore Screen" : "Minimize Screen"}
              className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <MinusIcon className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setIsScreenFullscreen((v) => !v)}
              aria-label={isScreenFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowsPointingOutIcon
                className={`h-5 w-5 text-white transition-transform ${
                  isScreenFullscreen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {!isScreenMinimized ? (
            <ScreenShare
              roomId={room.room_id}
              username={user?.username ?? "Guest"}
              className="flex-grow rounded-md"
            />
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-400 select-none">
              Screen Share Minimized
            </div>
          )}
        </main>

        {/* Chat panel */}
        {isChatVisible && (
          <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col shadow-lg transition-all duration-300 ease-in-out">
            <header className="px-4 py-3 border-b border-gray-700">
              <h2 className="text-lg font-semibold">Chat</h2>
            </header>
            <section className="flex-1 overflow-auto">
              <ChatBox roomId={room.room_id} username={user?.username ?? "Guest"} />
            </section>
          </aside>
        )}
      </div>
    </div>
  );
};

export default Room;
