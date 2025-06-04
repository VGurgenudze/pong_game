import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { handleSocketConnection } from "./events";
import { roomManager } from "./game";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Pass the Socket.IO instance to the room manager
roomManager.setServer(io);

// Handle new connections
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);
  handleSocketConnection(io, socket);
});

app.get("/", (_req, res) => {
  res.send("Multiplayer Pong Backend is running.");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
