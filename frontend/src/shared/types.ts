// ✅ This ensures the file is a module
export interface GameState {
  ball: { x: number; y: number };
  paddles: { leftY: number; rightY: number };
  score: { left: number; right: number };
}

