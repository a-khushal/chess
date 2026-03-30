import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f6f1e8_45%,_#ece4d7_100%)] px-6 py-16 text-slate-800 sm:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-7 rounded-3xl border border-amber-200/70 bg-white/70 p-8 shadow-[0_24px_80px_-50px_rgba(120,53,15,0.5)] backdrop-blur sm:p-12">
        <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
          Chess MVP
        </p>
        <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
          A calm, clean chess board.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Start with local play, keep the interface minimal, and layer in
          multiplayer once the core experience feels right.
        </p>
        <Link
          href="/play"
          className="inline-flex items-center rounded-xl bg-emerald-700 px-8 py-3 text-base font-semibold text-white transition hover:bg-emerald-600"
        >
          Play
        </Link>
      </div>
    </main>
  );
}
