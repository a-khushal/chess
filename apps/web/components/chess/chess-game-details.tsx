import type { GroupedMoveRow } from "../../features/chess/types";

type ChessGameDetailsProps = {
  groupedMoves: GroupedMoveRow[];
  fen: string;
  pgn: string;
};

export const ChessGameDetails = ({
  groupedMoves,
  fen,
  pgn,
}: ChessGameDetailsProps) => {
  return (
    <details className="w-[min(560px,100%)] border border-zinc-400 bg-zinc-100">
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">
        Game details
      </summary>
      <div className="space-y-3 border-t border-zinc-300 px-3 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Move list
          </p>
          {groupedMoves.length === 0 ? (
            <p className="mt-2 text-xs text-zinc-600">No moves yet.</p>
          ) : (
            <ol className="mt-2 max-h-44 space-y-1 overflow-auto text-xs text-zinc-700">
              {groupedMoves.map((move) => (
                <li
                  key={move.index}
                  className="grid grid-cols-[2rem_1fr_1fr] gap-2 font-mono"
                >
                  <span className="text-zinc-500">{move.index}.</span>
                  <span>{move.white}</span>
                  <span>{move.black ?? "-"}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            FEN
          </p>
          <p className="mt-1 break-all font-mono text-[11px] text-zinc-600">
            {fen}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            PGN
          </p>
          <p className="mt-1 max-h-20 overflow-auto font-mono text-[11px] text-zinc-600">
            {pgn || "No moves yet."}
          </p>
        </div>
      </div>
    </details>
  );
};
