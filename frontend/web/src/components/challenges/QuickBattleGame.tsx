import { Flame, RotateCcw, Timer, Trophy, Zap } from "lucide-react";
import { comboMultiplier } from "../../lib/quickGame.ts";
import { useQuickGame } from "../../hooks/useQuickGame.ts";
import type { AnswerFeedback } from "../../hooks/useQuickGame.ts";
import { ChallengeCard, PRIMARY_BUTTON } from "./ChallengeCard.tsx";

interface QuickBattleGameProps {
  classroomId: string;
}

const OPTION_BASE =
  "relative flex min-h-28 items-center justify-center rounded-2xl px-4 py-6 text-3xl font-bold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-default dark:focus-visible:ring-offset-[#131A29]";

function optionStyle(index: 0 | 1, feedback: AnswerFeedback | null, isCorrect: boolean): string {
  if (feedback) {
    if (isCorrect) return "bg-emerald-500 text-white scale-[1.02] dark:bg-emerald-400 dark:text-slate-900";
    if (feedback.chosen === index) return "bg-rose-500 text-white dark:bg-rose-400 dark:text-slate-900";
    return "bg-slate-200 text-slate-400 dark:bg-[#1B2438] dark:text-slate-500";
  }
  return index === 0
    ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98]"
    : "bg-amber-400 text-slate-900 hover:bg-amber-300 active:scale-[0.98]";
}

function ComboChip({ combo }: { combo: number }) {
  const mult = comboMultiplier(combo);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        combo >= 3
          ? "bg-amber-400 text-slate-900"
          : "bg-slate-100 text-slate-600 dark:bg-[#1B2438] dark:text-slate-300"
      }`}
    >
      <Flame className="size-3.5" strokeWidth={2} />
      Combo x{mult}
    </span>
  );
}

export function QuickBattleGame({ classroomId }: QuickBattleGameProps) {
  const { phase, game, question, index, remainingMs, stats, feedback, result, start, answer } =
    useQuickGame(classroomId);

  const totalMs = (game?.duration_seconds ?? 1) * 1000;
  const fraction = Math.max(0, Math.min(1, remainingMs / totalMs));
  const seconds = Math.ceil(remainingMs / 1000);
  const barColor =
    fraction > 0.5
      ? "bg-emerald-500 dark:bg-emerald-400"
      : fraction > 0.2
        ? "bg-amber-400"
        : "bg-rose-500 dark:bg-rose-400";

  return (
    <ChallengeCard
      title="Duelo rápido"
      subtitle="2 opciones, contra el reloj. Acierta rápido y encadena combos."
      icon={Zap}
      tone="amber"
      action={
        phase === "playing" ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 tabular-nums dark:bg-[#1B2438] dark:text-white">
            {stats.points} pts
          </span>
        ) : undefined
      }
    >
      {(phase === "idle" || phase === "loading") && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Responde la mayor cantidad de operaciones y preguntas del temario antes de que se acabe el tiempo.
            Cada 3 aciertos seguidos suben tu multiplicador. Al terminar, tu puntaje actualiza el ranking.
          </p>
          <button type="button" onClick={() => void start()} disabled={phase === "loading"} className={PRIMARY_BUTTON}>
            <Zap className="size-4" strokeWidth={2} />
            {phase === "loading" ? "Preparando…" : "Jugar ahora"}
          </button>
        </div>
      )}

      {phase === "playing" && question && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Timer className="size-4 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
            <div
              role="progressbar"
              aria-label="Tiempo restante"
              aria-valuemin={0}
              aria-valuemax={game?.duration_seconds ?? 0}
              aria-valuenow={seconds}
              className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-[#2A3347]"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-100 ease-linear ${barColor}`}
                style={{ width: `${fraction * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-sm font-bold text-slate-900 tabular-nums dark:text-white">
              {seconds}s
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pregunta {index + 1}</span>
            <ComboChip combo={stats.combo} />
          </div>

          <p className="min-h-16 text-center text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            {question.prompt}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {([0, 1] as const).map((i) => (
              <button
                key={`${question.id}-${i}`}
                type="button"
                disabled={feedback !== null}
                onClick={() => answer(i)}
                className={`${OPTION_BASE} ${optionStyle(i, feedback, question.correct_index === i)}`}
              >
                {question.options[i]}
              </button>
            ))}
          </div>

          <p className="h-5 text-center text-sm font-semibold" aria-live="assertive">
            {feedback?.correct && (
              <span className="text-emerald-600 dark:text-emerald-400">¡Correcto! +{feedback.gained}</span>
            )}
            {feedback && !feedback.correct && <span className="text-rose-600 dark:text-rose-400">Casi. Sigue.</span>}
          </p>
        </div>
      )}

      {phase === "finished" && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Puntos" value={String(stats.points)} />
            <Stat label="Aciertos" value={`${stats.correct}/${stats.answers.length}`} />
            <Stat label="Mejor combo" value={String(stats.bestCombo)} />
            <Stat label="Tu posición" value={result ? `#${result.rank}` : "…"} highlight />
          </div>
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Trophy className="size-4 text-amber-500" strokeWidth={1.75} />
            {result ? "Ranking grupal actualizado." : "Guardando tu puntaje…"}
          </p>
          <button type="button" onClick={() => void start()} className={`${PRIMARY_BUTTON} self-start`}>
            <RotateCcw className="size-4" strokeWidth={2} />
            Jugar otra vez
          </button>
        </div>
      )}
    </ChallengeCard>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${
        highlight ? "bg-amber-400 text-slate-900" : "bg-slate-50 text-slate-900 dark:bg-[#161E30] dark:text-white"
      }`}
    >
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className={`text-xs ${highlight ? "text-slate-800" : "text-slate-500 dark:text-slate-400"}`}>{label}</p>
    </div>
  );
}
