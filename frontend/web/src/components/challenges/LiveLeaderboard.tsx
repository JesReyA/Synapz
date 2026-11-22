import { Crown } from "lucide-react";
import type { LeaderboardEntry } from "../../types/challenges.ts";

interface LiveLeaderboardProps {
  entries: LeaderboardEntry[];
}

/** Ranking grupal. Recibe las filas ya ordenadas; el hook las actualiza en vivo (Realtime). */
export function LiveLeaderboard({ entries }: LiveLeaderboardProps) {
  return (
    <section
      aria-label="Ranking grupal"
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Ranking grupal</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden="true" />
          En vivo
        </span>
      </header>
      <ol className="flex flex-col gap-1.5" aria-live="polite">
        {entries.map((entry, i) => (
          <li
            key={entry.student_id}
            aria-current={entry.is_me ? "true" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
              entry.is_me
                ? "bg-amber-50 ring-1 ring-amber-300 dark:bg-amber-400/10 dark:ring-amber-400/40"
                : "bg-slate-50 dark:bg-[#161E30]"
            }`}
          >
            <span className="grid size-6 shrink-0 place-items-center text-xs font-bold text-slate-500 tabular-nums dark:text-slate-400">
              {i === 0 ? <Crown className="size-4 text-amber-500" strokeWidth={2} aria-label="Primer lugar" /> : i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">{entry.name}</span>
            <span className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">
              {entry.points.toLocaleString("es-MX")}
              <span className="ml-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"> pts</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
