import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const AudioChat = () => {
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socket = useRef(null);

  const [isCallStarted, setIsCallStarted] = useState(false);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }, // Public STUN server
    ],
  };

  useEffect(() => {
    // Initialize socket connection
    // socket.current = io("http://localhost:8008");
    socket.current = io("https://collection-q7hr.onrender.com/");

    // Listen for WebRTC offers
    socket.current.on("webRTC-offer", async (offer) => {
      console.log("Received offer:", offer);
      await handleOffer(offer);
    });

    // Listen for WebRTC answers
    socket.current.on("webRTC-answer", async (answer) => {
      console.log("Received answer:", answer);
      await handleAnswer(answer);
    });

    // Listen for ICE candidates
    socket.current.on("ice-candidate", async (candidate) => {
      console.log("Received ICE candidate:", candidate);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  const startCall = async () => {
    try {
      // Get local audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localAudioRef.current.srcObject = stream;

      // Initialize RTCPeerConnection
      peerConnectionRef.current = new RTCPeerConnection(iceServers);

      // Add local stream tracks to the peer connection
      stream.getTracks().forEach((track) => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log("Received remote stream:", event.streams[0]);
        remoteAudioRef.current.srcObject = event.streams[0];
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate:", event.candidate);
          socket.current.emit("ice-candidate", event.candidate);
        }
      };

      // Create and send offer
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      console.log("Sending offer:", offer);
      socket.current.emit("webRTC-offer", offer);

      setIsCallStarted(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleOffer = async (offer) => {
    try {
      if (!peerConnectionRef.current) {
        peerConnectionRef.current = new RTCPeerConnection(iceServers);

        peerConnectionRef.current.ontrack = (event) => {
          console.log("Received remote stream:", event.streams[0]);
          remoteAudioRef.current.srcObject = event.streams[0];
        };

        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            socket.current.emit("ice-candidate", event.candidate);
          }
        };
      }

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      console.log("Sending answer:", answer);
      socket.current.emit("webRTC-answer", answer);
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        console.log("Answer set successfully.");
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  return (
    <div>
      <h1>WebRTC Audio Call</h1>
      <button onClick={startCall} disabled={isCallStarted}>
        Start Call
      </button>
      <div>
        <h3>Local Audio</h3>
        <audio ref={localAudioRef} autoPlay muted />
      </div>
      <div>
        <h3>Remote Audio</h3>
        <audio ref={remoteAudioRef} autoPlay />
      </div>
    </div>
  );
};

export default AudioChat;
