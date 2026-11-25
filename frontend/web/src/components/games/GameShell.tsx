import { RefreshCw, Timer } from "lucide-react";
import type { ReactNode } from "react";
import { useGameSession } from "../../hooks/useGameSession.ts";
import { formatTime } from "../../lib/sudoku.ts";
import { PRIMARY_BUTTON, SECONDARY_BUTTON } from "../challenges/ChallengeCard.tsx";

export type GameStatusTone = "neutral" | "success" | "danger";

export interface GameStat {
  label: string;
  value: string;
}

interface GameShellProps {
  /** Texto de estado; se anuncia en una región aria-live. */
  status: string;
  tone: GameStatusTone;
  /** Segundos transcurridos; si falta, no se muestra el reloj. */
  elapsed?: number;
  stats?: readonly GameStat[];
  onReset: () => void;
  resetLabel?: string;
  /** Partida terminada: el botón de reinicio pasa a ser el principal. */
  finished?: boolean;
  children: ReactNode;
}

const STATUS_TONE: Record<GameStatusTone, string> = {
  neutral: "bg-slate-50 text-slate-600 dark:bg-[#161E30] dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const CHIP =
  "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 tabular-nums dark:bg-[#1B2438] dark:text-white";

/** Marco común de los juegos: estadísticas, contenido, estado anunciado y reinicio. */
export function GameShell({
  status,
  tone,
  elapsed,
  stats,
  onReset,
  resetLabel = "Nueva partida",
  finished = false,
  children,
}: GameShellProps) {
  const { hideTimers, noteRestart } = useGameSession();
  // Con ansiedad alta el reloj se oculta; las estadísticas se quedan.
  const shownElapsed = hideTimers ? undefined : elapsed;
  const hasHeader = shownElapsed !== undefined || (stats !== undefined && stats.length > 0);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {hasHeader && (
        <div className="flex flex-wrap items-center gap-2">
          {shownElapsed !== undefined && (
            <span className={CHIP}>
              <Timer className="size-4 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
              <span role="timer" aria-label="Tiempo transcurrido">
                {formatTime(shownElapsed)}
              </span>
            </span>
          )}
          {stats?.map((stat) => (
            <span key={stat.label} className={CHIP}>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
              <span>{stat.value}</span>
            </span>
          ))}
        </div>
      )}
      {children}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          aria-live="polite"
          className={`min-w-0 flex-1 rounded-xl px-3 py-2 text-sm font-medium ${STATUS_TONE[tone]}`}
        >
          {status}
        </p>
        <button
          type="button"
          onClick={() => {
            noteRestart();
            onReset();
          }}
          className={finished ? PRIMARY_BUTTON : SECONDARY_BUTTON}
        >
          <RefreshCw className="size-3.5" strokeWidth={2} />
          {resetLabel}
        </button>
      </div>
    </div>
  );
}
