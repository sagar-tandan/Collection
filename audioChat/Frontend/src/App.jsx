import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";

const App = () => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [ws, setWs] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:8008");
    setWs(socket);

    socket.on("connect", () => {
      console.log("Connected to signaling server");
    });

    socket.on("webRTC-answer", (answer) => {
      handleAnswer(answer);
    });

    socket.on("ice-candidate", (candidate) => {
      handleNewICECandidate(candidate);
    });

    socket.on("new-media-stream", (data) => {
      handleNewStream(data);
    });

    socket.on("remove-media-stream", (userId) => {
      // Handle stream removal
      console.log(`User ${userId} disconnected`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleNewStream = (data) => {
    const remoteStream = data.stream;
    remoteVideo.current.srcObject = remoteStream;
  };

  const handleOffer = async (offer) => {
    const peer = createPeerConnection();
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    ws.emit("webRTC-answer", answer);
  };

  const handleAnswer = (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleNewICECandidate = (candidate) => {
    const newCandidate = new RTCIceCandidate(candidate);
    peerConnection.addIceCandidate(newCandidate);
  };

  const startConnection = async () => {
    if (!ws) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.current.srcObject = stream;

    const peer = createPeerConnection();
    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    ws.emit("webRTC-offer", offer);

    setPeerConnection(peer);
  };

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        ws.emit("ice-candidate", event.candidate);
      }
    };

    peer.ontrack = (event) => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    return peer;
  };

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold mb-5">WebRTC Video Call with SFU</h1>
      <div className="flex gap-5">
        <video ref={localVideo} autoPlay muted className="w-1/2 border" />
        <video ref={remoteVideo} autoPlay className="w-1/2 border" />
      </div>
      <button
        onClick={startConnection}
        className="mt-5 px-5 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Start Call
      </button>
    </div>
  );
};

export default App;
