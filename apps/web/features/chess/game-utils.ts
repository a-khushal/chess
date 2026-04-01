import { Chess, type Color, type Square } from "chess.js";

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

const getKingSquare = (game: Chess, color: Color) => {
  const board = game.board();

  for (const row of board) {
    for (const piece of row) {
      if (piece && piece.color === color && piece.type === "k") {
        return piece.square;
      }
    }
  }

  return null;
};

export const toView = (game: Chess): GameView => {
  const history = game.history({ verbose: true });
  const lastMove = history[history.length - 1] ?? null;

  return {
    fen: game.fen(),
    pgn: game.pgn(),
    moves: history.map((move) => move.san),
    status: getStatus(game),
    turn: game.turn(),
    lastMoveFrom: lastMove?.from ?? null,
    lastMoveTo: lastMove?.to ?? null,
    checkSquare: game.isCheck() ? getKingSquare(game, game.turn()) : null,
  };
};

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

const parseUciMove = (uci: string) => {
  const match = uci.match(/^([a-h][1-8])([a-h][1-8])([qrbn])?$/);

  if (!match) {
    return null;
  }

  return {
    from: match[1] as Square,
    to: match[2] as Square,
    promotion: match[3] as "q" | "r" | "b" | "n" | undefined,
  };
};

export const uciToSan = (fen: string, pgn: string, uci: string) => {
  const parsed = parseUciMove(uci);

  if (!parsed) {
    return uci;
  }

  const game = createGame(fen, pgn);

  try {
    const move = game.move(parsed);
    return move?.san ?? uci;
  } catch {
    return uci;
  }
};

export const pvToSanLine = (
  fen: string,
  pgn: string,
  pv: string[],
  limit = 4,
) => {
  const game = createGame(fen, pgn);
  const sanMoves: string[] = [];

  for (const uci of pv.slice(0, limit)) {
    const parsed = parseUciMove(uci);

    if (!parsed) {
      break;
    }

    try {
      const move = game.move(parsed);

      if (!move) {
        break;
      }

      sanMoves.push(move.san);
    } catch {
      break;
    }
  }

  return sanMoves;
};
