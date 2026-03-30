type ChessToolbarProps = {
  status: string;
  hasSavedGame: boolean;
  onReset: () => void;
  onLoadSaved: () => void;
};

export const ChessToolbar = ({
  status,
  hasSavedGame,
  onReset,
  onLoadSaved,
}: ChessToolbarProps) => {
  return (
    <div className="flex w-[min(560px,100%)] flex-wrap items-center justify-between gap-2 border border-zinc-400 bg-zinc-100 px-3 py-2 text-xs text-zinc-700">
      <p className="font-medium uppercase tracking-[0.08em]">{status}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded border border-zinc-500 bg-white px-3 py-1 font-semibold uppercase tracking-[0.08em] transition hover:bg-zinc-200"
        >
          New game
        </button>
        <button
          type="button"
          onClick={onLoadSaved}
          disabled={!hasSavedGame}
          className="rounded border border-zinc-500 bg-white px-3 py-1 font-semibold uppercase tracking-[0.08em] transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Load saved
        </button>
      </div>
    </div>
  );
};
