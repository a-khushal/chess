type ChessEvalBarProps = {
  enabled: boolean;
  turn: "w" | "b";
  scoreType: "cp" | "mate";
  score: number;
  orientation?: "horizontal" | "vertical";
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const toWhitePerspective = (
  turn: "w" | "b",
  scoreType: "cp" | "mate",
  score: number,
) => {
  const signed = turn === "w" ? score : -score;

  if (scoreType === "mate") {
    return clamp(signed * 1000, -10000, 10000);
  }

  return clamp(signed, -1000, 1000);
};

export const ChessEvalBar = ({
  enabled,
  turn,
  scoreType,
  score,
  orientation = "horizontal",
}: ChessEvalBarProps) => {
  if (!enabled) {
    return null;
  }

  const whiteScore = toWhitePerspective(turn, scoreType, score);
  const whitePercent = clamp(50 + whiteScore / 20, 0, 100);
  const evalText =
    scoreType === "mate"
      ? `M${whiteScore > 0 ? "+" : ""}${Math.round(whiteScore / 1000)}`
      : `${whiteScore >= 0 ? "+" : ""}${(whiteScore / 100).toFixed(2)}`;

  if (orientation === "vertical") {
    return (
      <div className="flex w-8 flex-col items-center gap-2 border border-zinc-400 bg-zinc-100 px-1 py-2 text-[10px] text-zinc-700">
        <span className="font-mono font-semibold text-zinc-600">
          {evalText}
        </span>
        <div className="relative h-full w-3 overflow-hidden rounded-sm border border-zinc-500 bg-zinc-700">
          <div
            className="absolute bottom-0 left-0 right-0 bg-zinc-100 transition-[height] duration-300"
            style={{ height: `${whitePercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[min(560px,100%)] border border-zinc-400 bg-zinc-100 px-3 py-2 text-xs text-zinc-700">
      <div className="mb-1 flex items-center justify-between font-semibold uppercase tracking-[0.08em]">
        <span>White</span>
        <span className="font-mono text-zinc-600">{evalText}</span>
        <span>Black</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-sm border border-zinc-500 bg-zinc-700">
        <div
          className="h-full bg-zinc-100 transition-[width] duration-300"
          style={{ width: `${whitePercent}%` }}
        />
      </div>
    </div>
  );
};
