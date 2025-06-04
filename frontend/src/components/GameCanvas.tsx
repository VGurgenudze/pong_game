import { useEffect, useRef } from "react";
import { socket } from "../socket";
import type { GameState } from "../shared/types";



export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameState = useRef<GameState | null>(null);

  useEffect(() => {
    socket.on("gameState", (state: GameState) => {
      gameState.current = state;
      draw(state);
    });

    return () => {
      socket.off("gameState");
    };
  }, []);

  const draw = (state: GameState) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ball
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Paddles
    ctx.fillRect(10, state.paddles.leftY, 10, 100);
    ctx.fillRect(580, state.paddles.rightY, 10, 100);

    // Score
    ctx.font = "24px Arial";
    ctx.fillText(`${state.score.left} : ${state.score.right}`, 270, 30);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") socket.emit("paddleMove", "up");
      if (e.key === "ArrowDown") socket.emit("paddleMove", "down");
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return <canvas ref={canvasRef} width={600} height={400} style={{ border: "2px solid white" }} />;
};
