export type SavedGame = {
  fen: string;
  pgn: string;
};

export type GameView = {
  fen: string;
  pgn: string;
  moves: string[];
  status: string;
};

export type GroupedMoveRow = {
  index: number;
  white: string;
  black: string | null;
};

export type EngineLine = {
  multipv: number;
  depth: number;
  scoreType: "cp" | "mate";
  score: number;
  pv: string[];
};
