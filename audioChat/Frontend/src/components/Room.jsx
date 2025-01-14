import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

function Room({ roomId, username }) {
  const [users, setUsers] = useState([]);
  const [stream, setStream] = useState(null);
  const socketRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("https://collection-q7hr.onrender.com/");

    // Get user's audio stream
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })
      .then((stream) => {
        setStream(stream);
        streamRef.current = stream;

        // Join room after getting audio stream
        socketRef.current.emit("join-room", { roomId, username });

        // Handle new user connections
        socketRef.current.on("user-connected", async ({ id, username }) => {
          console.log("New user connected:", username);
          const pc = await initializePeerConnection(id);
          createOffer(pc, id);
        });

        // Get existing users in room
        socketRef.current.on("room-users", (users) => {
          console.log("Received room users:", users);
          setUsers(users);
        });

        // Handle WebRTC signaling
        socketRef.current.on("signal", async ({ userId, signal }) => {
          console.log("Received signal:", signal.type || "candidate");
          let pc = peersRef.current[userId];

          if (!pc) {
            pc = await initializePeerConnection(userId);
          }

          try {
            if (signal.type === "offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(signal));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socketRef.current.emit("signal", {
                userId,
                signal: answer,
              });
            } else if (signal.type === "answer") {
              await pc.setRemoteDescription(new RTCSessionDescription(signal));
            } else if (signal.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          } catch (error) {
            console.error("Error handling signal:", error);
          }
        });

        // Handle user disconnection
        socketRef.current.on("user-disconnected", (userId) => {
          console.log("User disconnected:", userId);
          if (peersRef.current[userId]) {
            peersRef.current[userId].close();
            delete peersRef.current[userId];
          }
          setUsers((prev) => prev.filter((user) => user.id !== userId));
        });
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });

    // Cleanup function
    return () => {
      socketRef.current?.disconnect();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peersRef.current).forEach((peer) => peer.close());
    };
  }, [roomId, username]);

  const initializePeerConnection = async (userId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    // Store the peer connection
    peersRef.current[userId] = pc;

    // Add local stream tracks to peer connection
    streamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, streamRef.current);
    });

    // Handle ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socketRef.current.emit("signal", {
          userId,
          signal: { candidate },
        });
      }
    };

    // Handle incoming stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.autoplay = true;

      // Handle autoplay restrictions
      audio.play().catch((error) => {
        console.log("Autoplay prevented. Click to play.");
        document.body.addEventListener(
          "click",
          () => {
            audio.play();
          },
          { once: true }
        );
      });
    };

    return pc;
  };

  const createOffer = async (pc, userId) => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("signal", {
        userId,
        signal: offer,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  return (
    <div className="room bg-red-500">
      <h2>Room: {roomId}</h2>
      <div className="users-list">
        <h3>Connected Users:</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.username} {user.id === socketRef.current?.id ? "(You)" : ""}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p>
          Audio Status:{" "}
          {stream ? "Microphone connected" : "No microphone access"}
        </p>
        {!stream && (
          <button
            onClick={() => {
              navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((newStream) => {
                  setStream(newStream);
                  streamRef.current = newStream;
                })
                .catch((err) =>
                  console.error("Error accessing microphone:", err)
                );
            }}
          >
            Enable Microphone
          </button>
        )}
      </div>
    </div>
  );
}

export default Room;
