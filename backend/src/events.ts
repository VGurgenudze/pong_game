import { Server, Socket } from "socket.io";
import { roomManager } from "./game";

export function handleSocketConnection(io: Server, socket: Socket) {
  const roomId = roomManager.assignPlayerToRoom(socket.id);
  socket.join(roomId);

  socket.on("paddleMove", (direction: "up" | "down") => {
    roomManager.handleInput(roomId, socket.id, direction);
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    roomManager.removePlayer(socket.id);
  });
}
