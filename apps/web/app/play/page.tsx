"use client";

import { Chess, type Move, type Square } from "chess.js";
import Link from "next/link";
import {
  Chessboard,
  defaultPieces,
  type PieceDropHandlerArgs,
  type PieceRenderObject,
} from "react-chessboard";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const STORAGE_KEY = "chess-local-game-v1";
const WHITE_FILL = "#f4f4f4";
const BLACK_FILL = "#757575";

const MONO_PIECES = {
  wP: (props) => defaultPieces.wP!({ ...props, fill: WHITE_FILL }),
  wR: (props) => defaultPieces.wR!({ ...props, fill: WHITE_FILL }),
  wN: (props) => defaultPieces.wN!({ ...props, fill: WHITE_FILL }),
  wB: (props) => defaultPieces.wB!({ ...props, fill: WHITE_FILL }),
  wQ: (props) => defaultPieces.wQ!({ ...props, fill: WHITE_FILL }),
  wK: (props) => defaultPieces.wK!({ ...props, fill: WHITE_FILL }),
  bP: (props) => defaultPieces.bP!({ ...props, fill: BLACK_FILL }),
  bR: (props) => defaultPieces.bR!({ ...props, fill: BLACK_FILL }),
  bN: (props) => defaultPieces.bN!({ ...props, fill: BLACK_FILL }),
  bB: (props) => defaultPieces.bB!({ ...props, fill: BLACK_FILL }),
  bQ: (props) => defaultPieces.bQ!({ ...props, fill: BLACK_FILL }),
  bK: (props) => defaultPieces.bK!({ ...props, fill: BLACK_FILL }),
} satisfies PieceRenderObject;

type SavedGame = {
  fen: string;
  pgn: string;
};

type GameView = {
  fen: string;
  pgn: string;
  moves: string[];
  status: string;
};

const getStatus = (game: Chess) => {
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

const toView = (game: Chess): GameView => ({
  fen: game.fen(),
  pgn: game.pgn(),
  moves: game.history(),
  status: getStatus(game),
});

const createGame = (fen: string, pgn: string) => {
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

const parseSavedGame = (raw: string | null): SavedGame | null => {
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

export default function PlayPage() {
  const gameRef = useRef(new Chess());
  const [view, setView] = useState<GameView>(() => toView(gameRef.current));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [readyToPersist, setReadyToPersist] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const groupedMoves = useMemo(() => {
    const rows: Array<{ index: number; white: string; black: string | null }> =
      [];

    for (let i = 0; i < view.moves.length; i += 2) {
      rows.push({
        index: i / 2 + 1,
        white: view.moves[i] ?? "",
        black: view.moves[i + 1] ?? null,
      });
    }

    return rows;
  }, [view.moves]);

  const selectedMoves = useMemo(() => {
    if (!selectedSquare) {
      return [] as Move[];
    }

    try {
      const game = createGame(view.fen, view.pgn);
      return game.moves({
        square: selectedSquare as Square,
        verbose: true,
      }) as Move[];
    } catch {
      return [] as Move[];
    }
  }, [selectedSquare, view.fen, view.pgn]);

  const selectedPieceKey = (() => {
    if (!selectedSquare) {
      return null;
    }

    const piece = gameRef.current.get(selectedSquare as Square);

    if (!piece) {
      return null;
    }

    return `${piece.color}${piece.type.toUpperCase()}` as keyof typeof MONO_PIECES;
  })();

  const recommendationBySquare = useMemo(() => {
    const map = new Map<string, Move>();

    for (const move of selectedMoves) {
      map.set(move.to, move);
    }

    return map;
  }, [selectedMoves]);

  const ghostPieceRenderer = useMemo(() => {
    if (!selectedPieceKey) {
      return null;
    }

    return MONO_PIECES[selectedPieceKey];
  }, [selectedPieceKey]);

  const hintSquareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};

    if (!selectedSquare) {
      return styles;
    }

    styles[selectedSquare] = {
      boxShadow: "inset 0 0 0 3px rgba(63,63,70,0.85)",
      backgroundColor: "rgba(24,24,27,0.14)",
    };

    return styles;
  }, [selectedSquare]);

  useEffect(() => {
    const saved = parseSavedGame(window.localStorage.getItem(STORAGE_KEY));
    setHasSavedGame(Boolean(saved));
    setReadyToPersist(true);
  }, []);

  useEffect(() => {
    if (!readyToPersist) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ fen: view.fen, pgn: view.pgn }),
    );

    if (!hasSavedGame) {
      setHasSavedGame(true);
    }
  }, [view.fen, view.pgn, readyToPersist, hasSavedGame]);

  const loadSavedGame = () => {
    const saved = parseSavedGame(window.localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      setHasSavedGame(false);
      return;
    }

    const restored = createGame(saved.fen, saved.pgn);
    gameRef.current = restored;
    setSelectedSquare(null);
    setView(toView(restored));
  };

  const resetGame = () => {
    const fresh = new Chess();
    gameRef.current = fresh;
    setSelectedSquare(null);
    setView(toView(fresh));
  };

  const tryMove = (from: string, to: string) => {
    if (gameRef.current.isGameOver()) {
      return false;
    }

    try {
      gameRef.current.move({
        from,
        to,
        promotion: "q",
      });
      setSelectedSquare(null);
      setView(toView(gameRef.current));
      return true;
    } catch {
      return false;
    }
  };

  const handleSquareChoice = (square: string) => {
    const piece = gameRef.current.get(square as Square);
    const sideToMove = gameRef.current.turn();

    if (!selectedSquare) {
      if (piece && piece.color === sideToMove) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    const moved = tryMove(selectedSquare, square);

    if (moved) {
      return;
    }

    if (piece && piece.color === sideToMove) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const selectSourcePiece = (square: string | null) => {
    if (!square) {
      return;
    }

    const piece = gameRef.current.get(square as Square);

    if (piece && piece.color === gameRef.current.turn()) {
      setSelectedSquare(square);
    }
  };

  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs) => {
    if (!targetSquare) {
      return false;
    }

    return tryMove(sourceSquare, targetSquare);
  };

  return (
    <main className="min-h-screen bg-[#c8c8c8] px-4 py-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-5">
        <div className="flex w-full max-w-[560px] items-center justify-between">
          <h1 className="text-base font-semibold uppercase tracking-[0.22em] text-zinc-700">
            Chess Board
          </h1>
          <Link
            href="/"
            className="rounded border border-zinc-500 bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-700 transition hover:bg-zinc-200"
          >
            Home
          </Link>
        </div>

        <div className="w-full max-w-[560px] border border-zinc-700 bg-zinc-100 p-2 shadow-[0_28px_40px_-30px_rgba(0,0,0,0.7)] sm:p-3">
          <Chessboard
            options={{
              position: view.fen,
              onPieceDrop: handlePieceDrop,
              onPieceClick: ({ square }) => {
                selectSourcePiece(square);
              },
              onPieceDrag: ({ square }) => {
                if (square) {
                  selectSourcePiece(square);
                }
              },
              onSquareClick: ({ square }) => handleSquareChoice(square),
              pieces: MONO_PIECES,
              squareStyles: hintSquareStyles,
              squareRenderer: ({ square, children }) => {
                const recommendation = recommendationBySquare.get(square);
                const isCapture = Boolean(recommendation?.captured);
                const GhostPiece = recommendation ? ghostPieceRenderer : null;

                return (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    <div style={isCapture ? { opacity: 0.45 } : undefined}>
                      {children}
                    </div>
                    {GhostPiece && !isCapture ? (
                      <div
                        style={{
                          position: "absolute",
                          inset: "10%",
                          pointerEvents: "none",
                          opacity: 0.48,
                        }}
                      >
                        <GhostPiece
                          square={square}
                          svgStyle={{ opacity: 0.9 }}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              },
              darkSquareStyle: { backgroundColor: "#d1d1d1" },
              lightSquareStyle: { backgroundColor: "#ececec" },
              darkSquareNotationStyle: {
                color: "#8d8d8d",
                fontSize: "10px",
                fontWeight: "500",
              },
              lightSquareNotationStyle: {
                color: "#8d8d8d",
                fontSize: "10px",
                fontWeight: "500",
              },
              boardStyle: {
                borderRadius: "0",
                border: "2px solid #3f3f46",
              },
              animationDurationInMs: 60,
              dragActivationDistance: 0,
              allowDragOffBoard: true,
              showNotation: true,
            }}
          />
        </div>

        <div className="flex w-full max-w-[560px] flex-wrap items-center justify-between gap-2 border border-zinc-400 bg-zinc-100 px-3 py-2 text-xs text-zinc-700">
          <p className="font-medium uppercase tracking-[0.08em]">
            {view.status}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetGame}
              className="rounded border border-zinc-500 bg-white px-3 py-1 font-semibold uppercase tracking-[0.08em] transition hover:bg-zinc-200"
            >
              New game
            </button>
            <button
              type="button"
              onClick={loadSavedGame}
              disabled={!hasSavedGame}
              className="rounded border border-zinc-500 bg-white px-3 py-1 font-semibold uppercase tracking-[0.08em] transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Load saved
            </button>
          </div>
        </div>

        <details className="w-full max-w-[560px] border border-zinc-400 bg-zinc-100">
          <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
            Game details
          </summary>
          <div className="space-y-3 border-t border-zinc-300 px-3 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Move list
              </p>
              {groupedMoves.length === 0 ? (
                <p className="mt-2 text-xs text-zinc-600">No moves yet.</p>
              ) : (
                <ol className="mt-2 max-h-44 space-y-1 overflow-auto text-xs text-zinc-700">
                  {groupedMoves.map((move) => (
                    <li
                      key={move.index}
                      className="grid grid-cols-[2rem_1fr_1fr] gap-2 font-mono"
                    >
                      <span className="text-zinc-500">{move.index}.</span>
                      <span>{move.white}</span>
                      <span>{move.black ?? "-"}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                FEN
              </p>
              <p className="mt-1 break-all font-mono text-[11px] text-zinc-600">
                {view.fen}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                PGN
              </p>
              <p className="mt-1 max-h-20 overflow-auto font-mono text-[11px] text-zinc-600">
                {view.pgn || "No moves yet."}
              </p>
            </div>
          </div>
        </details>
      </div>
    </main>
  );
}
