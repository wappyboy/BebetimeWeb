import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";

const ChatRoom = () => {
  const { roomId } = useParams();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ sender: string; message: string }[]>([]);

  useEffect(() => {
    const username = localStorage.getItem("username") || "Anonymous";

    socket.emit("join_room", { room: roomId, username });

    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.emit("leave_room", { room: roomId, username });
      socket.off("receive_message");
    };
  }, [roomId]);

  const sendMessage = () => {
    const username = localStorage.getItem("username") || "Anonymous";
    if (message.trim()) {
      socket.emit("send_message", { room: roomId, message, username });
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Room: {roomId}</h1>

      <div className="w-full max-w-xl bg-gray-800 p-4 rounded-lg overflow-y-auto h-96 mb-4">
        {chat.map((msg, index) => (
          <div key={index} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-xl">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-l-lg bg-gray-700 text-white"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
