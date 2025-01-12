import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const port = 8008;

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("WebRTC-offer", (offer) => {
    console.log(offer);
    socket.broadcast.emit("webRTC-offer", offer);
  });

  socket.on("webRTC-answer", (answer) => {
    console.log(answer);
    socket.broadcast.emit("webRTC-answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    console.log(candidate);
    socket.broadcast.emit("ice-candidate", candidate);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

server.listen(port, () => {
  console.log("Server is Listening at port : " + port);
});
