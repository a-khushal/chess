"use client";

import { type Move, type Square } from "chess.js";
import { useMemo, type CSSProperties } from "react";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";

import { createGame } from "../../features/chess/game-utils";
import { MONO_PIECES } from "../../features/chess/pieces";

type ChessBoardSurfaceProps = {
  fen: string;
  pgn: string;
  turn: "w" | "b";
  selectedSquare: string | null;
  selectedMoves: Move[];
  engineBestMove: string | null;
  lastMoveFrom: string | null;
  lastMoveTo: string | null;
  checkSquare: string | null;
  onSquareChoice: (square: string) => void;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onSourceSquareSelect: (square: string | null) => void;
};

export const ChessBoardSurface = ({
  fen,
  pgn,
  turn,
  selectedSquare,
  selectedMoves,
  engineBestMove,
  lastMoveFrom,
  lastMoveTo,
  checkSquare,
  onSquareChoice,
  onPieceDrop,
  onSourceSquareSelect,
}: ChessBoardSurfaceProps) => {
  const engineHint = useMemo(() => {
    if (selectedSquare || !engineBestMove) {
      return null;
    }

    const match = engineBestMove.match(/^([a-h][1-8])([a-h][1-8])[qrbn]?$/);

    if (!match) {
      return null;
    }

    const from = match[1] as Square;
    const to = match[2] as Square;
    const game = createGame(fen, pgn);
    const piece = game.get(from);

    if (!piece || piece.color !== game.turn()) {
      return null;
    }

    return {
      to,
      pieceKey:
        `${piece.color}${piece.type.toUpperCase()}` as keyof typeof MONO_PIECES,
      isCapture: Boolean(game.get(to)),
    };
  }, [selectedSquare, engineBestMove, fen, pgn]);

  const selectedPieceKey = useMemo(() => {
    if (selectedSquare) {
      const game = createGame(fen, pgn);
      const piece = game.get(selectedSquare as Square);

      if (!piece) {
        return null;
      }

      return `${piece.color}${piece.type.toUpperCase()}` as keyof typeof MONO_PIECES;
    }

    return engineHint?.pieceKey ?? null;
  }, [selectedSquare, fen, pgn, engineHint]);

  const recommendationBySquare = useMemo(() => {
    const map = new Map<string, boolean>();

    if (selectedSquare) {
      const game = createGame(fen, pgn);

      for (const move of selectedMoves) {
        map.set(move.to, Boolean(game.get(move.to as Square)));
      }
    } else if (engineHint) {
      map.set(engineHint.to, engineHint.isCapture);
    }

    return map;
  }, [selectedSquare, selectedMoves, fen, pgn, engineHint]);

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

  const handleSquareMouseDown = ({ square, piece }: SquareHandlerArgs) => {
    if (!piece) {
      return;
    }

    if (piece.pieceType[0] === turn) {
      onSourceSquareSelect(square);
    }
  };

  const mergedSquareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = { ...hintSquareStyles };

    if (lastMoveFrom) {
      styles[lastMoveFrom] = {
        ...(styles[lastMoveFrom] ?? {}),
        boxShadow: "inset 0 0 0 2px rgba(63,63,70,0.45)",
      };
    }

    if (lastMoveTo) {
      styles[lastMoveTo] = {
        ...(styles[lastMoveTo] ?? {}),
        backgroundColor: "rgba(113,113,122,0.22)",
      };
    }

    if (checkSquare) {
      styles[checkSquare] = {
        ...(styles[checkSquare] ?? {}),
        boxShadow:
          "inset 0 0 0 3px rgba(127,29,29,0.9), inset 0 0 0 6px rgba(220,38,38,0.35)",
      };
    }

    return styles;
  }, [hintSquareStyles, lastMoveFrom, lastMoveTo, checkSquare]);

  return (
    <div className="w-[min(560px,100%)] border border-zinc-700 bg-zinc-100 p-2 shadow-[0_28px_40px_-30px_rgba(0,0,0,0.7)] sm:p-3">
      <Chessboard
        options={{
          position: fen,
          onPieceDrop,
          onSquareMouseDown: handleSquareMouseDown,
          onSquareClick: ({ square }) => onSquareChoice(square),
          pieces: MONO_PIECES,
          squareStyles: mergedSquareStyles,
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
