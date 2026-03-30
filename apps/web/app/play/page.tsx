"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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

  const [stockfishEnabled, setStockfishEnabled] = useState(true);

  const engine = useStockfish(view.fen, stockfishEnabled);

  const engineLines = useMemo(() => {
    if (!stockfishEnabled || !engine.ready) {
      return [];
    }

    return engine.lines
      .filter((line) => line.pv.length > 0)
      .map((line) => {
        const firstMove = line.pv[0];
        const san = firstMove ? uciToSan(view.fen, view.pgn, firstMove) : "-";
        const pvSan = pvToSanLine(view.fen, view.pgn, line.pv, 4).join(" ");

        return {
          san,
          scoreText: formatEngineScore(line.scoreType, line.score),
          depth: line.depth,
          pvText: pvSan,
        };
      });
  }, [stockfishEnabled, engine.ready, engine.lines, view.fen, view.pgn]);

  const engineBestMove =
    stockfishEnabled && engine.ready
      ? (engine.lines.find((line) => line.pv.length > 0)?.pv[0] ?? null)
      : null;

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
          stockfishEnabled={stockfishEnabled}
          onReset={resetGame}
          onLoadSaved={loadSavedGame}
          onToggleStockfish={() => setStockfishEnabled((current) => !current)}
        />

        <ChessEnginePanel
          enabled={stockfishEnabled}
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
