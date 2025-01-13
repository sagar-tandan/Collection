// import express from "express";
// import { createServer } from "http";
// import cors from "cors";
// import { Server } from "socket.io";

// const app = express();
// const server = createServer(app);
// const port = 8008;

// app.use(cors({ origin: "*" }));

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// io.on("connection", (socket) => {
//   console.log("User connected: ", socket.id);

//   socket.on("webRTC-offer", (offer) => {
//     console.log(offer);
//     socket.broadcast.emit("webRTC-offer", offer);
//   });

//   socket.on("webRTC-answer", (answer) => {
//     console.log(answer);
//     socket.broadcast.emit("webRTC-answer", answer);
//   });

//   socket.on("ice-candidate", (candidate) => {
//     console.log(candidate);
//     socket.broadcast.emit("ice-candidate", candidate);
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("User disconnected: ", socket.id);
//   });
// });

// app.get("/", (req, res) => {
//   res.json("hello world");
// });

// server.listen(port, () => {
//   console.log("Server is Listening at port : " + port);
// });


import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Store active rooms and their users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, username }) => {
    // Join the socket.io room
    socket.join(roomId);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    // Add user to room
    const user = { id: socket.id, username };
    rooms.get(roomId).add(user);
    
    // Notify others in the room
    socket.to(roomId).emit('user-connected', user);
    
    // Send list of existing users to the new participant
    const usersInRoom = Array.from(rooms.get(roomId));
    socket.emit('room-users', usersInRoom);
    
    console.log(`${username} joined room ${roomId}`);
  });

  // Handle WebRTC signaling
  socket.on('signal', ({ userId, signal }) => {
    io.to(userId).emit('signal', {
      userId: socket.id,
      signal
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    rooms.forEach((users, roomId) => {
      const userArray = Array.from(users);
      const user = userArray.find(u => u.id === socket.id);
      if (user) {
        users.delete(user);
        io.to(roomId).emit('user-disconnected', socket.id);
        console.log(`User ${user.username} disconnected from room ${roomId}`);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});