export interface Player {
  id: string;
  username: string;
  score: number;
  isDrawing: boolean;
  hasGuessed: boolean;
}

export interface ChatMessage {
  id: number;
  type: "chat" | "system" | "correct" | "close";
  username?: string;
  text: string;
}

export type GamePhase = "login" | "lobby" | "picking" | "drawing" | "turn_end" | "game_end";

export interface GameState {
  phase: GamePhase;
  round: number;
  totalRounds: number;
  timeLeft: number;
  drawerId: string | null;
  drawerName: string | null;
  word?: string;
  hint?: string;
}

export type ServerMessage =
  | { type: "joined"; playerId: string; username: string }
  | { type: "error"; message: string }
  | { type: "player_list"; players: Player[] }
  | { type: "game_state"; phase: string; round: number; totalRounds: number; timeLeft: number; drawerId: string | null; drawerName: string | null; word?: string; hint?: string }
  | { type: "word_choices"; words: string[] }
  | { type: "chat"; username: string; text: string }
  | { type: "system"; text: string }
  | { type: "correct_guess"; username: string; points: number }
  | { type: "close_guess"; message: string }
  | { type: "timer"; timeLeft: number; hint?: string }
  | { type: "turn_end"; word: string }
  | { type: "game_end"; results: { username: string; score: number }[] }
  | { type: "draw"; x: number; y: number; color: string; size: number; newStroke: boolean }
  | { type: "fill"; x: number; y: number; color: string }
  | { type: "undo" }
  | { type: "clear" };
