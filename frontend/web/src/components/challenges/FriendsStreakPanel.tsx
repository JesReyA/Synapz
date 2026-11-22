import { useEffect, useRef, useState } from "react";
import { Check, Copy, Flame, Users } from "lucide-react";
import type { FriendWeekly, StreakInfo } from "../../types/challenges.ts";
import { SECONDARY_BUTTON } from "./ChallengeCard.tsx";

interface FriendsStreakPanelProps {
  streak: StreakInfo;
  friends: FriendWeekly[];
  inviteCode: string;
}

export function FriendsStreakPanel({ streak, friends, inviteCode }: FriendsStreakPanelProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const ranked = [...friends].sort((a, b) => b.weekly_points - a.weekly_points);
  const top = ranked[0]?.weekly_points ?? 1;

  return (
    <aside
      aria-label="Rachas y amigos"
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-orange-100 p-5 text-center dark:bg-amber-900/40">
        <Flame className="size-12 fill-amber-400 text-orange-500 dark:text-amber-400" strokeWidth={1.5} aria-hidden="true" />
        <div>
          <p className="text-5xl leading-none font-bold text-slate-900 tabular-nums dark:text-white">{streak.current}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-amber-100">días de racha</p>
        </div>
        <ul className="flex gap-1.5" aria-label="Actividad de la semana">
          {streak.week.map((d, i) => (
            <li key={i} className="flex flex-col items-center gap-1">
              <span
                aria-label={`${d.label}: ${d.active ? "activo" : "sin actividad"}${d.today ? " (hoy)" : ""}`}
                className={`grid size-7 place-items-center rounded-full ${
                  d.active
                    ? "bg-amber-400 text-slate-900"
                    : "bg-white/70 text-slate-400 dark:bg-white/10 dark:text-slate-500"
                } ${d.today ? "ring-2 ring-orange-500 dark:ring-amber-300" : ""}`}
              >
                {d.active ? <Check className="size-3.5" strokeWidth={3} /> : null}
              </span>
              <span className="text-[10px] font-medium text-slate-600 dark:text-amber-100/80">{d.label}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-600 dark:text-amber-100/80">Tu mejor racha: {streak.best} días</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Users className="size-4 text-blue-500 dark:text-blue-300" strokeWidth={1.75} />
          Invita a tus amigos
        </h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-xl bg-slate-50 px-3 py-2 text-center text-sm font-bold tracking-widest text-slate-900 dark:bg-[#161E30] dark:text-white">
            {inviteCode}
          </code>
          <button
            type="button"
            onClick={() => void copyCode()}
            aria-label="Copiar código de invitación"
            className={SECONDARY_BUTTON}
          >
            {copied ? <Check className="size-3.5" strokeWidth={2.5} /> : <Copy className="size-3.5" strokeWidth={2} />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? "Código copiado al portapapeles" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Puntos de la semana</h2>
        <ol className="flex flex-col gap-2">
          {ranked.map((f, i) => (
            <li
              key={f.id}
              aria-current={f.is_me ? "true" : undefined}
              className={`flex flex-col gap-1.5 rounded-xl px-3 py-2 ${
                f.is_me ? "bg-amber-50 ring-1 ring-amber-300 dark:bg-amber-400/10 dark:ring-amber-400/40" : ""
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="w-4 text-xs font-bold text-slate-500 tabular-nums dark:text-slate-400">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">{f.name}</span>
                <span className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">
                  {f.weekly_points.toLocaleString("es-MX")}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-[#2A3347]">
                <div
                  className={`h-full rounded-full ${f.is_me ? "bg-amber-400" : "bg-blue-500 dark:bg-blue-400"}`}
                  style={{ width: `${(f.weekly_points / top) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
