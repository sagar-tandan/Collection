import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const port = 8008;

app.use(cors({ origin: "*" }));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// io.on("connection", (socket) => {
//   console.log("User connected: ", socket.id);

//   socket.on("WebRTC-offer", (offer) => {
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

// Store active users and their socket connections
const activeUsers = new Map(); // socketId -> { userId, inCall }
const callPairs = new Map(); // userId -> userId (to track who's calling whom)

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Add user to active users when they connect
  activeUsers.set(socket.id, {
    userId: socket.id,
    inCall: false,
  });

  // Handle call request
  socket.on("call-request", () => {
    const availableUsers = Array.from(activeUsers.entries()).filter(
      ([socketId, user]) => socketId !== socket.id && !user.inCall
    );

    if (availableUsers.length > 0) {
      // For simplicity, we'll call the first available user
      const [targetSocketId, targetUser] = availableUsers[0];

      // Store the call pair
      callPairs.set(socket.id, targetSocketId);

      // Emit incoming call event to target user
      io.to(targetSocketId).emit("incoming-call", socket.id);

      console.log(`Call request from ${socket.id} to ${targetSocketId}`);
    } else {
      // No available users to call
      socket.emit("call-failed", "No available users to call");
    }
  });

  // Handle call acceptance
  socket.on("webRTC-offer", (offer) => {
    const targetSocketId = callPairs.get(socket.id);
    if (targetSocketId) {
      io.to(targetSocketId).emit("webRTC-offer", offer);

      // Mark both users as in call
      const caller = activeUsers.get(socket.id);
      const receiver = activeUsers.get(targetSocketId);
      if (caller) caller.inCall = true;
      if (receiver) receiver.inCall = true;
    }
  });

  // Handle call answer
  socket.on("webRTC-answer", (answer) => {
    const callerSocketId = Array.from(callPairs.entries()).find(
      ([_, receiverId]) => receiverId === socket.id
    )?.[0];

    if (callerSocketId) {
      io.to(callerSocketId).emit("webRTC-answer", answer);
    }
  });

  // Handle ICE candidates
  socket.on("ice-candidate", (candidate) => {
    const targetSocketId =
      callPairs.get(socket.id) ||
      Array.from(callPairs.entries()).find(
        ([_, receiverId]) => receiverId === socket.id
      )?.[0];

    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", candidate);
    }
  });

  // Handle call declined
  socket.on("call-declined", (callerSocketId) => {
    callPairs.delete(callerSocketId);
    io.to(callerSocketId).emit("call-declined");

    console.log(`Call declined: ${callerSocketId} -> ${socket.id}`);
  });

  // Handle call ended
  socket.on("call-ended", () => {
    const targetSocketId =
      callPairs.get(socket.id) ||
      Array.from(callPairs.entries()).find(
        ([_, receiverId]) => receiverId === socket.id
      )?.[0];

    if (targetSocketId) {
      // Notify the other user that the call has ended
      io.to(targetSocketId).emit("call-ended");

      // Clear call status
      const caller = activeUsers.get(socket.id);
      const receiver = activeUsers.get(targetSocketId);
      if (caller) caller.inCall = false;
      if (receiver) receiver.inCall = false;

      // Remove call pair
      callPairs.delete(socket.id);
      callPairs.delete(targetSocketId);

      console.log(`Call ended between ${socket.id} and ${targetSocketId}`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const targetSocketId =
      callPairs.get(socket.id) ||
      Array.from(callPairs.entries()).find(
        ([_, receiverId]) => receiverId === socket.id
      )?.[0];

    if (targetSocketId) {
      // Notify the other user that the call has ended due to disconnection
      io.to(targetSocketId).emit("call-ended");

      // Clear call status for remaining user
      const remainingUser = activeUsers.get(targetSocketId);
      if (remainingUser) remainingUser.inCall = false;

      // Remove call pair
      callPairs.delete(socket.id);
      callPairs.delete(targetSocketId);
    }

    // Remove user from active users
    activeUsers.delete(socket.id);

    console.log(`User disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

server.listen(port, () => {
  console.log("Server is Listening at port : " + port);
});
