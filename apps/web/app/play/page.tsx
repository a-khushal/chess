"use client";

import Link from "next/link";

import { ChessBoardSurface } from "../../components/chess/chess-board-surface";
import { ChessGameDetails } from "../../components/chess/chess-game-details";
import { ChessToolbar } from "../../components/chess/chess-toolbar";
import { useChessController } from "../../features/chess/use-chess-controller";

export default function PlayPage() {
  const {
    view,
    selectedSquare,
    selectedMoves,
    groupedMoves,
    hasSavedGame,
    handleSquareChoice,
    handlePieceDrop,
    selectSourceSquare,
    resetGame,
    loadSavedGame,
  } = useChessController();

  return (
    <main className="flex min-h-screen justify-center bg-[#c8c8c8] px-4 py-8 sm:py-12">
      <div className="flex w-full max-w-[760px] flex-col items-center gap-5">
        <div className="flex w-[min(560px,100%)] items-center justify-between">
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

        <ChessBoardSurface
          fen={view.fen}
          pgn={view.pgn}
          selectedSquare={selectedSquare}
          selectedMoves={selectedMoves}
          onSquareChoice={handleSquareChoice}
          onPieceDrop={handlePieceDrop}
          onSourceSquareSelect={selectSourceSquare}
        />

        <ChessToolbar
          status={view.status}
          hasSavedGame={hasSavedGame}
          onReset={resetGame}
          onLoadSaved={loadSavedGame}
        />

        <ChessGameDetails
          groupedMoves={groupedMoves}
          fen={view.fen}
          pgn={view.pgn}
        />
      </div>
    </main>
  );
}
