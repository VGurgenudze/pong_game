import { Server } from "socket.io";
import type { GameState } from "../../shared/types";




type Player = { id: string; paddleY: number };

class GameRoomManager {
  private io: Server | null = null;
  private rooms: Record<string, {
    players: Player[];
    state: GameState;
    interval?: NodeJS.Timeout;
  }> = {};

  setServer(io: Server) {
    this.io = io;
  }

  assignPlayerToRoom(playerId: string): string {
    const availableRoom = Object.entries(this.rooms).find(
      ([_, room]) => room.players.length < 2
    );

    const roomId = availableRoom?.[0] ?? `room-${Date.now()}`;
    const room = this.rooms[roomId] ?? {
      players: [],
      state: {
        ball: { x: 300, y: 200 },
        paddles: { leftY: 150, rightY: 150 },
        score: { left: 0, right: 0 },
      },
    };

    room.players.push({ id: playerId, paddleY: 150 });
    this.rooms[roomId] = room;

    if (room.players.length === 2) {
      this.startGame(roomId);
    }

    return roomId;
  }

  handleInput(roomId: string, playerId: string, direction: "up" | "down") {
    const room = this.rooms[roomId];
    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    const movement = direction === "up" ? -10 : 10;
    player.paddleY = Math.max(0, Math.min(300, player.paddleY + movement));
  }

  startGame(roomId: string) {
    const room = this.rooms[roomId];
    let dx = 4, dy = 3;

    room.interval = setInterval(() => {
      const state = room.state;

      // Ball movement
      state.ball.x += dx;
      state.ball.y += dy;

      // Wall bounce
      if (state.ball.y <= 0 || state.ball.y >= 400) dy *= -1;

      // Paddle collisions
      const [left, right] = room.players;

      if (
        state.ball.x <= 20 &&
        state.ball.y >= left?.paddleY &&
        state.ball.y <= (left?.paddleY ?? 0) + 100
      ) dx *= -1;

      if (
        state.ball.x >= 580 &&
        state.ball.y >= right?.paddleY &&
        state.ball.y <= (right?.paddleY ?? 0) + 100
      ) dx *= -1;

      // Score update
      if (state.ball.x < 0) {
        state.score.right += 1;
        state.ball = { x: 300, y: 200 };
      } else if (state.ball.x > 600) {
        state.score.left += 1;
        state.ball = { x: 300, y: 200 };
      }

      // Sync paddle positions
      state.paddles.leftY = left?.paddleY ?? 150;
      state.paddles.rightY = right?.paddleY ?? 150;

      // Emit updated state
      this.io?.to(roomId).emit("gameState", state);
    }, 1000 / 60);
  }

  removePlayer(playerId: string) {
    for (const [roomId, room] of Object.entries(this.rooms)) {
      const index = room.players.findIndex(p => p.id === playerId);
      if (index !== -1) {
        room.players.splice(index, 1);
        if (room.interval) clearInterval(room.interval);
        delete this.rooms[roomId];
      }
    }
  }
}

export const roomManager = new GameRoomManager();
