"use client";

import { Chess } from "chess.js";
import Link from "next/link";
import { Chessboard } from "react-chessboard";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "chess-local-game-v1";

type SavedGame = {
  fen: string;
  pgn: string;
};

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
  const [fen, setFen] = useState(() => new Chess().fen());
  const [pgn, setPgn] = useState("");
  const [readyToPersist, setReadyToPersist] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const game = useMemo(() => createGame(fen, pgn), [fen, pgn]);

  const moveHistory = useMemo(() => game.history(), [game]);

  const groupedMoves = useMemo(() => {
    const rows: Array<{ index: number; white: string; black: string | null }> =
      [];

    for (let i = 0; i < moveHistory.length; i += 2) {
      rows.push({
        index: i / 2 + 1,
        white: moveHistory[i] ?? "",
        black: moveHistory[i + 1] ?? null,
      });
    }

    return rows;
  }, [moveHistory]);

  const statusText = useMemo(() => {
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
  }, [game]);

  useEffect(() => {
    const saved = parseSavedGame(window.localStorage.getItem(STORAGE_KEY));
    setHasSavedGame(Boolean(saved));
    setReadyToPersist(true);
  }, []);

  useEffect(() => {
    if (!readyToPersist) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ fen, pgn }));
    setHasSavedGame(true);
  }, [fen, pgn, readyToPersist]);

  const loadSavedGame = () => {
    const saved = parseSavedGame(window.localStorage.getItem(STORAGE_KEY));

    if (!saved) {
      setHasSavedGame(false);
      return;
    }

    const restored = createGame(saved.fen, saved.pgn);
    setFen(restored.fen());
    setPgn(restored.pgn());
  };

  const resetGame = () => {
    const fresh = new Chess();
    setFen(fresh.fen());
    setPgn("");
  };

  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: {
    sourceSquare: string;
    targetSquare: string | null;
  }) => {
    if (game.isGameOver()) {
      return false;
    }

    if (!targetSquare) {
      return false;
    }

    const nextGame = createGame(fen, pgn);

    try {
      nextGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });
      setFen(nextGame.fen());
      setPgn(nextGame.pgn());
      return true;
    } catch {
      return false;
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf0_0%,_#f6f1e8_45%,_#ede3d2_100%)] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
              Local Chess
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Play Board
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50"
          >
            Home
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-amber-200/80 bg-white p-4 shadow-[0_30px_70px_-45px_rgba(120,53,15,0.45)] sm:p-6">
            <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
              {statusText}
            </div>

            <div className="mx-auto w-full max-w-[560px]">
              <Chessboard
                options={{
                  position: fen,
                  onPieceDrop: handlePieceDrop,
                  darkSquareStyle: { backgroundColor: "#b58863" },
                  lightSquareStyle: { backgroundColor: "#f0d9b5" },
                  boardStyle: {
                    borderRadius: "14px",
                    boxShadow: "0 22px 45px -32px rgba(120, 53, 15, 0.65)",
                  },
                }}
              />
            </div>
          </section>

          <aside className="flex flex-col gap-4 rounded-3xl border border-amber-200/80 bg-white p-4 shadow-[0_22px_50px_-40px_rgba(120,53,15,0.45)]">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <button
                type="button"
                onClick={resetGame}
                className="rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
              >
                New game
              </button>

              <button
                type="button"
                onClick={loadSavedGame}
                disabled={!hasSavedGame}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Load saved
              </button>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                Move list
              </p>
              {groupedMoves.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No moves yet.</p>
              ) : (
                <ol className="mt-3 max-h-72 space-y-1.5 overflow-auto text-sm text-slate-700">
                  {groupedMoves.map((move) => (
                    <li
                      key={move.index}
                      className="grid grid-cols-[2rem_1fr_1fr] gap-2 font-mono"
                    >
                      <span className="text-slate-500">{move.index}.</span>
                      <span>{move.white}</span>
                      <span>{move.black ?? "-"}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                FEN
              </p>
              <p className="mt-2 break-all font-mono text-[11px] text-slate-600">
                {fen}
              </p>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                PGN
              </p>
              <p className="mt-2 max-h-24 overflow-auto font-mono text-[11px] text-slate-600">
                {pgn || "No moves yet."}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
