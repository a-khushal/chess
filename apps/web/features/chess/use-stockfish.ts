"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { EngineLine } from "./types";

const ENGINE_WORKER_PATH = "/stockfish/stockfish-18-lite-single.js";
const MAX_MULTI_PV = 3;
const SEARCH_DEPTH = 12;
const SEARCH_TIMEOUT_MS = 1400;

const parseInfoLine = (line: string): EngineLine | null => {
  const depthMatch = line.match(/\bdepth\s+(\d+)/);
  const scoreMatch = line.match(/\bscore\s+(cp|mate)\s+(-?\d+)/);
  const pvMatch = line.match(/\bpv\s+(.+)$/);

  if (!depthMatch || !scoreMatch || !pvMatch) {
    return null;
  }

  const pvText = pvMatch[1] ?? "";

  const pv = pvText
    .trim()
    .split(/\s+/)
    .filter((move) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move));

  if (pv.length === 0) {
    return null;
  }

  const multipvMatch = line.match(/\bmultipv\s+(\d+)/);
  const depth = Number(depthMatch[1] ?? "0");
  const scoreType = scoreMatch[1];
  const score = Number(scoreMatch[2] ?? "0");

  if ((scoreType !== "cp" && scoreType !== "mate") || Number.isNaN(depth)) {
    return null;
  }

  return {
    multipv: multipvMatch ? Number(multipvMatch[1]) : 1,
    depth,
    scoreType,
    score,
    pv,
  };
};

type UseStockfishResult = {
  ready: boolean;
  thinking: boolean;
  error: string | null;
  lines: EngineLine[];
};

export const useStockfish = (fen: string): UseStockfishResult => {
  const workerRef = useRef<Worker | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lineMapRef = useRef<Map<number, EngineLine>>(new Map());
  const [ready, setReady] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<EngineLine[]>([]);

  useEffect(() => {
    try {
      const worker = new Worker(ENGINE_WORKER_PATH);
      workerRef.current = worker;

      worker.onmessage = (event: MessageEvent<string>) => {
        const text = typeof event.data === "string" ? event.data : "";

        if (text === "uciok") {
          worker.postMessage("setoption name UCI_AnalyseMode value true");
          worker.postMessage("setoption name Threads value 1");
          worker.postMessage("isready");
          return;
        }

        if (text === "readyok") {
          setReady(true);
          return;
        }

        if (text.startsWith("bestmove")) {
          setThinking(false);
          return;
        }

        if (!text.startsWith("info ")) {
          return;
        }

        const parsed = parseInfoLine(text);

        if (!parsed) {
          return;
        }

        const existing = lineMapRef.current.get(parsed.multipv);

        if (!existing || parsed.depth >= existing.depth) {
          lineMapRef.current.set(parsed.multipv, parsed);
          const sorted = Array.from(lineMapRef.current.values())
            .sort((a, b) => a.multipv - b.multipv)
            .slice(0, MAX_MULTI_PV);
          setLines(sorted);
        }
      };

      worker.onerror = () => {
        setError("Engine failed to load");
        setReady(false);
        setThinking(false);
      };

      worker.postMessage("uci");
    } catch {
      setError("Engine unavailable in this browser");
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (workerRef.current) {
        workerRef.current.postMessage("stop");
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    const worker = workerRef.current;

    if (!worker || !ready) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    lineMapRef.current.clear();
    setLines([]);
    setThinking(true);
    setError(null);

    worker.postMessage("stop");
    worker.postMessage(`setoption name MultiPV value ${MAX_MULTI_PV}`);
    worker.postMessage(`position fen ${fen}`);
    worker.postMessage(`go depth ${SEARCH_DEPTH}`);

    searchTimeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage("stop");
      }
    }, SEARCH_TIMEOUT_MS);
  }, [fen, ready]);

  return useMemo(
    () => ({
      ready,
      thinking,
      error,
      lines,
    }),
    [ready, thinking, error, lines],
  );
};
