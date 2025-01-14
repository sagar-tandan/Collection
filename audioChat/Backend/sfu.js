import mediasoup from "mediasoup";
let worker,
  router,
  transports = [];

async function setUpSFU() {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      { kind: "audio", mimeType: "audio/opus", clockRate: 48000, channels: 2 },
      { kind: "video", mimeType: "video/VP8", clockRate: 90000 },
    ],
  });
  console.log("SFU ready");
}

async function handleNewConnection(ws, data) {
  if (data.type === "join") {
    // Create transport for the participant
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0", announcedIp: null }],
    });

    // Send transport details to the client
    ws.send(
      JSON.stringify({ type: "transport", payload: transport.iceParameters })
    );

    transports.push({ transport, ws });
  }
}

export { setUpSFU, handleNewConnection };
