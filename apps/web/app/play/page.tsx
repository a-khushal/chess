"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ChessBoardSurface } from "../../components/chess/chess-board-surface";
import { ChessEnginePanel } from "../../components/chess/chess-engine-panel";
import { ChessGameDetails } from "../../components/chess/chess-game-details";
import { ChessToolbar } from "../../components/chess/chess-toolbar";
import { pvToSanLine, uciToSan } from "../../features/chess/game-utils";
import { useChessController } from "../../features/chess/use-chess-controller";
import { useStockfish } from "../../features/chess/use-stockfish";

const formatEngineScore = (scoreType: "cp" | "mate", score: number) => {
  if (scoreType === "mate") {
    return `M${score > 0 ? "+" : ""}${score}`;
  }

  const pawns = (score / 100).toFixed(2);
  return `${score >= 0 ? "+" : ""}${pawns}`;
};

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

  const engine = useStockfish(view.fen);

  const engineLines = useMemo(() => {
    return engine.lines.map((line) => {
      const firstMove = line.pv[0] ?? "";
      const san = firstMove ? uciToSan(view.fen, view.pgn, firstMove) : "-";
      const pvSan = pvToSanLine(view.fen, view.pgn, line.pv, 4).join(" ");

      return {
        san,
        scoreText: formatEngineScore(line.scoreType, line.score),
        depth: line.depth,
        pvText: pvSan,
      };
    });
  }, [engine.lines, view.fen, view.pgn]);

  const engineBestMove = engine.lines[0]?.pv[0] ?? null;

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
          engineBestMove={engineBestMove}
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

        <ChessEnginePanel
          ready={engine.ready}
          thinking={engine.thinking}
          error={engine.error}
          lines={engineLines}
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
