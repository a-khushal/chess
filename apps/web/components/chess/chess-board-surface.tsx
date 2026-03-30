"use client";

import { type Move, type Square } from "chess.js";
import { useMemo, type CSSProperties } from "react";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type PieceHandlerArgs,
} from "react-chessboard";

import { createGame } from "../../features/chess/game-utils";
import { MONO_PIECES } from "../../features/chess/pieces";

type ChessBoardSurfaceProps = {
  fen: string;
  pgn: string;
  selectedSquare: string | null;
  selectedMoves: Move[];
  onSquareChoice: (square: string) => void;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onSourceSquareSelect: (square: string | null) => void;
};

export const ChessBoardSurface = ({
  fen,
  pgn,
  selectedSquare,
  selectedMoves,
  onSquareChoice,
  onPieceDrop,
  onSourceSquareSelect,
}: ChessBoardSurfaceProps) => {
  const selectedPieceKey = useMemo(() => {
    if (!selectedSquare) {
      return null;
    }

    const game = createGame(fen, pgn);
    const piece = game.get(selectedSquare as Square);

    if (!piece) {
      return null;
    }

    return `${piece.color}${piece.type.toUpperCase()}` as keyof typeof MONO_PIECES;
  }, [selectedSquare, fen, pgn]);

  const recommendationBySquare = useMemo(() => {
    const map = new Map<string, boolean>();
    const game = createGame(fen, pgn);

    for (const move of selectedMoves) {
      map.set(move.to, Boolean(game.get(move.to as Square)));
    }

    return map;
  }, [selectedMoves, fen, pgn]);

  const ghostPieceRenderer = useMemo(() => {
    if (!selectedPieceKey) {
      return null;
    }

    return MONO_PIECES[selectedPieceKey];
  }, [selectedPieceKey]);

  const hintSquareStyles = useMemo(() => {
    if (!selectedSquare) {
      return {} as Record<string, CSSProperties>;
    }

    return {
      [selectedSquare]: {
        boxShadow: "inset 0 0 0 3px rgba(63,63,70,0.85)",
        backgroundColor: "rgba(24,24,27,0.14)",
      },
    } satisfies Record<string, CSSProperties>;
  }, [selectedSquare]);

  const handlePieceDrag = ({ square }: PieceHandlerArgs) => {
    onSourceSquareSelect(square);
  };

  return (
    <div className="w-[min(560px,100%)] border border-zinc-700 bg-zinc-100 p-2 shadow-[0_28px_40px_-30px_rgba(0,0,0,0.7)] sm:p-3">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          onPieceDrag: handlePieceDrag,
          onSquareClick: ({ square }) => onSquareChoice(square),
          pieces: MONO_PIECES,
          squareStyles: hintSquareStyles,
          squareRenderer: ({ square, children }) => {
            const isCapture = recommendationBySquare.get(square) ?? false;
            const GhostPiece = recommendationBySquare.has(square)
              ? ghostPieceRenderer
              : null;

            return (
              <div
                style={{ width: "100%", height: "100%", position: "relative" }}
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
                    <GhostPiece square={square} svgStyle={{ opacity: 0.9 }} />
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
  );
};
