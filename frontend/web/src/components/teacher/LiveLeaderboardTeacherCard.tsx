import { useState } from "react";
import { Crown, Loader2 } from "lucide-react";
import type { LeaderboardEntry } from "../../types/challenges.ts";

const BONUS_POINTS = 10;
const MAX_REASON_LENGTH = 140;

interface LiveLeaderboardTeacherCardProps {
  entries: LeaderboardEntry[];
  /** Otorga puntos extra (§2.16). Debe lanzar un error si falla. */
  onGrant: (studentId: string, points: number, reason: string) => Promise<void>;
}

export function LiveLeaderboardTeacherCard({ entries, onGrant }: LiveLeaderboardTeacherCardProps) {
  const [reason, setReason] = useState("Participación destacada");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const trimmed = reason.trim();

  async function grant(entry: LeaderboardEntry) {
    if (!trimmed || busyId) return;
    setBusyId(entry.student_id);
    try {
      await onGrant(entry.student_id, BONUS_POINTS, trimmed);
      setNotice({ ok: true, text: `+${BONUS_POINTS} puntos para ${entry.name}.` });
    } catch {
      setNotice({ ok: false, text: `No se pudieron otorgar los puntos a ${entry.name}.` });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section
      aria-label="Ranking grupal del juego rápido"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Ranking del juego rápido</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Los puntos extra se suman al ranking de todo el grupo.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" aria-hidden="true" />
          En vivo
        </span>
      </header>

      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        Motivo de los puntos extra
        <input
          value={reason}
          maxLength={MAX_REASON_LENGTH}
          onChange={(e) => setReason(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2A3347] dark:bg-[#161E30] dark:text-white"
        />
      </label>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] text-left text-sm">
          <thead>
            <tr className="text-xs text-slate-500 dark:text-slate-400">
              <th scope="col" className="w-10 pb-2 font-medium">Pos.</th>
              <th scope="col" className="pb-2 font-medium">Alumno</th>
              <th scope="col" className="pb-2 text-right font-medium">Puntos</th>
              <th scope="col" className="pb-2 pl-3 text-right font-medium"><span className="sr-only">Acción</span></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.student_id} className="border-t border-slate-100 dark:border-[#222B3E]">
                <td className="py-2 text-xs font-bold text-slate-500 tabular-nums dark:text-slate-400">
                  {i === 0 ? <Crown className="size-4 text-amber-500" strokeWidth={2} aria-label="Primer lugar" /> : i + 1}
                </td>
                <td className="py-2 font-medium text-slate-900 dark:text-white">{entry.name}</td>
                <td className="py-2 text-right font-semibold text-slate-700 tabular-nums dark:text-slate-200">
                  {entry.points.toLocaleString("es-MX")}
                </td>
                <td className="py-2 pl-3 text-right">
                  <button
                    type="button"
                    onClick={() => void grant(entry)}
                    disabled={!trimmed || busyId !== null}
                    aria-label={`Dar ${BONUS_POINTS} puntos extra a ${entry.name}`}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 dark:focus-visible:ring-offset-[#131A29]"
                  >
                    {busyId === entry.student_id && <Loader2 className="size-3.5 animate-spin" />}
                    +{BONUS_POINTS} pts extra
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`min-h-4 text-xs ${notice?.ok === false ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}
      >
        {notice?.text}
      </p>
    </section>
  );
}
