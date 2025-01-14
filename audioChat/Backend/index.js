// import express from "express";
// import { createServer } from "http";
// import cors from "cors";
// import { Server } from "socket.io";
// import { handleNewConnection, setUpSFU } from "./sfu.js";

// const app = express();
// const server = createServer(app);
// const port = 8008;

// app.use(cors({ origin: "*" }));

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// setUpSFU();
// io.on("connection", (socket) => {
//   console.log("User connected: ", socket.id);

//   // socket.on("webRTC-offer", (offer) => {
//   //   console.log(offer);
//   //   socket.broadcast.emit("webRTC-offer", offer);
//   // });

//   // socket.on("webRTC-answer", (answer) => {
//   //   console.log(answer);
//   //   socket.broadcast.emit("webRTC-answer", answer);
//   // });

//   // socket.on("ice-candidate", (candidate) => {
//   //   console.log(candidate);
//   //   socket.broadcast.emit("ice-candidate", candidate);
//   // });

//   // Handle any custom messages (e.g., join request, transport setup)
//   socket.on("message", (message) => {
//     const data = JSON.parse(message);
//     console.log("Received message:", data);
//     handleNewConnection(socket, data); // Custom logic for handling new connection
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("User disconnected: ", socket.id);
//   });
// });

// // app.get("/", (req, res) => {
// //   res.json("hello world");
// // });

// server.listen(port, () => {
//   console.log("Server is Listening at port : " + port);
// });

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
app.use(cors({ origin: "*" }));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.get("/", (req, res) => {
  res.send("Audio Chat Server Running");
});

io.on("connection", (socket) => {
  console.log("A user connected: " + socket.id);

  socket.on("offer", (offer, room) => {
    socket.to(room).emit("offer", offer, socket.id);
  });

  socket.on("answer", (answer, room) => {
    socket.to(room).emit("answer", answer);
  });

  socket.on("candidate", (candidate, room) => {
    socket.to(room).emit("candidate", candidate);
  });

  socket.on("join", (room) => {
    const rooms = io.sockets.adapter.rooms[room] || { length: 0 };
    const numClients = rooms.length;

    if (numClients === 0) {
      socket.join(room);
      socket.emit("created");
    } else {
      socket.join(room);
      socket.emit("joined");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
