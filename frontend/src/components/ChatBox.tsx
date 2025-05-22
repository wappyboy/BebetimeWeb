import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

type Message = {
  sender: string;
  message: string;
};

const ChatBox = ({ roomId, username }: { roomId: string; username: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("join_room", { room: roomId, username });

    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.emit("leave_room", { room: roomId, username });
      socket.off("receive_message");
    };
  }, [roomId, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit("send_message", {
        room: roomId,
        username,
        message: input,
      });
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">
        Chat
      </h2>

      <div
        className="flex-1 overflow-y-auto bg-gray-700 rounded-lg p-4 mb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
        style={{ maxHeight: "400px" }}
      >
        {messages.length === 0 && (
          <p className="text-gray-400 italic text-center mt-10">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${
              msg.sender === username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg break-words ${
                msg.sender === username
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-100"
              }`}
            >
              <span className="block font-semibold mb-1">{msg.sender}</span>
              <span>{msg.message}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-grow p-3 rounded-lg bg-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 rounded-lg transition"
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
