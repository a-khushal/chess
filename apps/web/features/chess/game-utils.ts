import { Chess } from "chess.js";

import type { GameView, SavedGame } from "./types";

export const STORAGE_KEY = "chess-local-game-v1";

export const getStatus = (game: Chess) => {
  if (game.isCheckmate()) {
    return game.turn() === "w"
      ? "Checkmate - Black wins"
      : "Checkmate - White wins";
  }

  if (game.isStalemate()) {
    return "Stalemate";
  }

  if (game.isDraw()) {
    return "Draw";
  }

  if (game.isCheck()) {
    return game.turn() === "w"
      ? "White to move - check"
      : "Black to move - check";
  }

  return game.turn() === "w" ? "White to move" : "Black to move";
};

export const toView = (game: Chess): GameView => ({
  fen: game.fen(),
  pgn: game.pgn(),
  moves: game.history(),
  status: getStatus(game),
});

export const createGame = (fen: string, pgn: string) => {
  const game = new Chess();

  if (pgn.trim().length > 0) {
    try {
      game.loadPgn(pgn);
      return game;
    } catch {
      game.reset();
    }
  }

  try {
    game.load(fen);
    return game;
  } catch {
    return new Chess();
  }
};

export const parseSavedGame = (raw: string | null): SavedGame | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SavedGame>;

    if (typeof parsed.fen !== "string") {
      return null;
    }

    return {
      fen: parsed.fen,
      pgn: typeof parsed.pgn === "string" ? parsed.pgn : "",
    };
  } catch {
    return null;
  }
};
