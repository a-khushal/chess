import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-900 via-slate-950 to-black px-6 py-16 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6">
        <p className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
          Local MVP
        </p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          Chess clone, starting with a playable board.
        </h1>
        <p className="max-w-xl text-base text-slate-300 sm:text-lg">
          Build fast: play locally first, then layer in multiplayer, clocks, and
          ratings.
        </p>
        <Link
          href="/play"
          className="inline-flex items-center rounded-lg bg-cyan-500 px-8 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Play
        </Link>
      </div>
    </main>
  );
}
