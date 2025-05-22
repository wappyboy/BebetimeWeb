import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

type Props = {
  roomId: string;
  username: string;
  className?: string;
};

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const ScreenShare = ({ roomId, username, className = "" }: Props) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const [isSharing, setIsSharing] = useState(false);

  const createPeerConnection = useCallback(() => {
    pc.current = new RTCPeerConnection(configuration);

    pc.current.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          room: roomId,
          username,
          candidate: event.candidate,
        });
      }
    };

    pc.current.ontrack = (event: RTCTrackEvent) => {
      // Show remote stream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  }, [roomId, username]);

  useEffect(() => {
    socket.emit("join_room", { room: roomId, username });
    const localVideo = localVideoRef.current;
    const remoteVideo = remoteVideoRef.current;
    socket.on("webrtc_offer", async (data) => {
      if (!pc.current) createPeerConnection();

      await pc.current!.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.current!.createAnswer();
      await pc.current!.setLocalDescription(answer);

      socket.emit("webrtc_answer", {
        room: roomId,
        username,
        answer,
      });
    });

    socket.on("webrtc_answer", async (data) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on("webrtc_ice_candidate", async (data) => {
      if (data.candidate) {
        try {
          await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e: unknown) {
          if (e instanceof Error) {
            console.error("Error adding received ICE candidate", e.message);
          } else {
            console.error("Error adding received ICE candidate", e);
          }
        }
      }
    });

    return () => {
    socket.emit("leave_room", { room: roomId, username });
    socket.off("webrtc_offer");
    socket.off("webrtc_answer");
    socket.off("webrtc_ice_candidate");
    pc.current?.close();
    pc.current = null;

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (localVideo) {
      localVideo.srcObject = null;
    }

    if (remoteVideo) {
      const stream = remoteVideo.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      remoteVideo.srcObject = null;
    }
  };
}, [roomId, username, createPeerConnection]);

  const startScreenShare = async () => {
    try {
      const mediaDevices = navigator.mediaDevices as MediaDevices & {
        getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
      };

      const stream = await mediaDevices.getDisplayMedia({ video: true });
      localStream.current = stream;

      // Show your own shared screen locally
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      if (!pc.current) createPeerConnection();

      // Add your screen tracks to the peer connection
      stream.getTracks().forEach((track) => {
        pc.current!.addTrack(track, stream);
      });

      setIsSharing(true);

      // When user stops sharing the screen (via browser UI)
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      // If you want, you can create an offer here and send it
      const offer = await pc.current!.createOffer();
      await pc.current!.setLocalDescription(offer);

      socket.emit("webrtc_offer", {
        room: roomId,
        username,
        offer,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error sharing screen:", err.message);
      } else {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const stopScreenShare = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (pc.current) {
      pc.current.getSenders().forEach((sender) => {
        if (sender.track && sender.track.kind === "video") {
          sender.track.stop();
          pc.current!.removeTrack(sender);
        }
      });
      pc.current.close();
      pc.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setIsSharing(false);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 py-6 ${className}`}>
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Screen Sharing</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Your own shared screen */}
        <div className="flex flex-col items-center">
          <h3 className="mb-2 font-semibold text-gray-700">Your Screen</h3>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="border rounded-lg w-full max-h-96 bg-black"
          />
        </div>

        {/* Remote peer's screen */}
        <div className="flex flex-col items-center">
          <h3 className="mb-2 font-semibold text-gray-700">Remote Screen</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="border rounded-lg w-full max-h-96 bg-black"
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        {!isSharing ? (
          <button
            onClick={startScreenShare}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
          >
            Start Screen Share
          </button>
        ) : (
          <button
            onClick={stopScreenShare}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow"
          >
            Stop Screen Share
          </button>
        )}
      </div>
    </div>
  );
};

export default ScreenShare;
