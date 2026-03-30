"use client";

import { Chess, type Move, type Square } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PieceDropHandlerArgs } from "react-chessboard";

import { createGame, parseSavedGame, STORAGE_KEY, toView } from "./game-utils";
import type { GameView, GroupedMoveRow } from "./types";

type UseChessControllerResult = {
  view: GameView;
  selectedSquare: string | null;
  selectedMoves: Move[];
  groupedMoves: GroupedMoveRow[];
  hasSavedGame: boolean;
  handleSquareChoice: (square: string) => void;
  handlePieceDrop: (args: PieceDropHandlerArgs) => boolean;
  selectSourceSquare: (square: string | null) => void;
  resetGame: () => void;
  loadSavedGame: () => void;
};

export const useChessController = (): UseChessControllerResult => {
  const gameRef = useRef(new Chess());
  const [view, setView] = useState<GameView>(() => toView(gameRef.current));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [readyToPersist, setReadyToPersist] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const groupedMoves = useMemo(() => {
    const rows: GroupedMoveRow[] = [];

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

  const selectSourceSquare = (square: string | null) => {
    if (!square) {
      return;
    }

    const piece = gameRef.current.get(square as Square);

    if (piece && piece.color === gameRef.current.turn()) {
      setSelectedSquare(square);
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

  const handlePieceDrop = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs) => {
    if (!targetSquare) {
      return false;
    }

    return tryMove(sourceSquare, targetSquare);
  };

  return {
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
  };
};
