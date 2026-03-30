type EngineDisplayLine = {
  san: string;
  scoreText: string;
  depth: number;
  pvText: string;
};

type ChessEnginePanelProps = {
  ready: boolean;
  thinking: boolean;
  error: string | null;
  lines: EngineDisplayLine[];
};

export const ChessEnginePanel = ({
  ready,
  thinking,
  error,
  lines,
}: ChessEnginePanelProps) => {
  return (
    <div className="w-[min(560px,100%)] border border-zinc-400 bg-zinc-100 px-3 py-2 text-xs text-zinc-700">
      <div className="mb-1 flex items-center justify-between">
        <p className="font-semibold uppercase tracking-[0.1em] text-zinc-700">
          Engine
        </p>
        <p className="uppercase tracking-[0.08em] text-zinc-500">
          {error
            ? "offline"
            : !ready
              ? "starting"
              : thinking
                ? "thinking"
                : "ready"}
        </p>
      </div>

      {error ? (
        <p className="text-zinc-500">{error}</p>
      ) : lines.length === 0 ? (
        <p className="text-zinc-500">
          {ready ? "Analyzing position..." : "Loading Stockfish..."}
        </p>
      ) : (
        <ol className="space-y-1">
          {lines.map((line, index) => (
            <li
              key={`${line.san}-${index}`}
              className="font-mono text-zinc-700"
            >
              <span className="font-semibold">{index + 1}.</span>{" "}
              <span>{line.san}</span>{" "}
              <span className="text-zinc-500">
                ({line.scoreText}, d{line.depth})
              </span>{" "}
              <span className="text-zinc-500">{line.pvText}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
