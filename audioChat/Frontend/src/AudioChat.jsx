import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Mic, MicOff, Phone, PhoneOff, Radio, Users } from "lucide-react";

// Socket configuration
const socket = io("http://localhost:8008");

// Custom styled components
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white/95 rounded-lg shadow-lg border border-neutral-200/50 ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}) => {
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "border border-gray-300 hover:bg-gray-100",
  };

  const sizes = {
    default: "px-4 py-2",
    icon: "p-3",
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
    {children}
  </span>
);

const Tooltip = ({ content, children }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-sm text-white bg-black rounded">
          {content}
        </div>
      )}
    </div>
  );
};

const AudioChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const stopStreaming = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      setIsStreaming(false);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setIsStreaming(true);
      await setUpMediaConfiguration(stream);
      sendICECandidate();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const setUpMediaConfiguration = async (stream) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    peerConnectionRef.current = peerConnection;

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("WebRTC-offer", offer);
  };

  const sendICECandidate = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleCallAction = async () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      await startStreaming();
    }
  };

  const handleOffer = async (offer) => {
    const peerConnection = new RTCPeerConnection();
    peerConnectionRef.current = peerConnection;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("webRTC-answer", answer);
      sendICECandidate();
      setParticipantCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (answer) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.setRemoteDescription(answer);
      setParticipantCount((prev) => prev + 1);
    }
  };

  const handleICECandidate = async (candidate) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(candidate);
    }
  };

  useEffect(() => {
    socket.on("webRTC-offer", handleOffer);
    socket.on("webRTC-answer", handleAnswer);
    socket.on("ice-candidate", handleICECandidate);

    return () => {
      socket.off("webRTC-offer");
      socket.off("webRTC-answer");
      socket.off("ice-candidate");
      stopStreaming();
    };
  }, []);

  return (
    <Card className="fixed top-[40vh] left-[20px] z-[10] w-[280px]">
      <div className="p-4 border-b border-neutral-200/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
            Voice Channel
          </h2>
          <Tooltip content="Active Participants">
            <Badge>
              <Users className="w-3 h-3 mr-1" />
              {participantCount}
            </Badge>
          </Tooltip>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <audio ref={remoteAudioRef} autoPlay className="hidden" />

        <div className="flex justify-center gap-3">
          <Tooltip content={isStreaming ? "Leave Call" : "Join Call"}>
            <Button
              variant={isStreaming ? "destructive" : "default"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={handleCallAction}
            >
              {isStreaming ? (
                <PhoneOff className="h-5 w-5" />
              ) : (
                <Phone className="h-5 w-5" />
              )}
            </Button>
          </Tooltip>

          {isStreaming && (
            <Tooltip content={isMuted ? "Unmute" : "Mute"}>
              <Button
                variant={isMuted ? "secondary" : "outline"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AudioChat;
