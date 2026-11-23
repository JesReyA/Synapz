import type { LucideIcon } from "lucide-react";
import { ArrowRight, Mic, MessageSquareQuote, RotateCcw, SkipForward, TrendingUp } from "lucide-react";
import type { AudioErrorType, EvaluateAudioResponse } from "../../types/learning.ts";
import { AMBER_BUTTON, INNER_CARD, OUTLINE_BUTTON } from "./styles.ts";

interface VoiceFeedbackProps {
  result: EvaluateAudioResponse;
  onRepeat: () => void;
  onContinue: () => void;
}

const ERROR_META: Record<AudioErrorType, { label: string; icon: LucideIcon; tone: string }> = {
  mispronounced: {
    label: "Pronunciación",
    icon: Mic,
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
  omitted: {
    label: "Palabra omitida",
    icon: SkipForward,
    tone: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200",
  },
  inserted: {
    label: "Palabra añadida",
    icon: MessageSquareQuote,
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  },
  punctuation: {
    label: "Puntuación",
    icon: MessageSquareQuote,
    tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  },
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
      <span className="w-24 shrink-0">{label}</span>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-[#2A3347]"
      >
        <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-semibold tabular-nums">{Math.round(value)}</span>
    </div>
  );
}

export function VoiceFeedback({ result, onRepeat, onContinue }: VoiceFeedbackProps) {
  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <img src="/feyn.png" alt="Feyn" className="size-10 shrink-0 rounded-full bg-amber-400 p-1.5 object-contain" />
        <p className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800 dark:bg-[#1B2438] dark:text-slate-100">
          {result.read_the_text
            ? result.feedback
            : "No reconocí el texto en tu audio. Lee la lectura de arriba en voz alta e inténtalo otra vez."}
        </p>
      </div>

      <div className={`${INNER_CARD} grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center`}>
        <div className="text-center">
          <p className="text-5xl font-bold text-slate-900 tabular-nums dark:text-white">{Math.round(result.score)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">de 100 · Intento {result.attempt}</p>
          {result.improved && result.attempt > 1 && (
            <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
              <TrendingUp className="size-3" strokeWidth={2} />
              ¡Mejoraste!
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <ScoreBar label="Dicción" value={result.diction_score} />
          <ScoreBar label="Puntuación" value={result.punctuation_score} />
          <ScoreBar label="Texto leído" value={result.completeness * 100} />
          <p className="text-xs text-slate-500 dark:text-slate-400">Tu mejor puntaje: {Math.round(result.best_score)}</p>
        </div>
      </div>

      {result.errors.length > 0 ? (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Para mejorar</h3>
          <ul className="flex flex-col gap-2">
            {result.errors.map((err) => {
              const meta = ERROR_META[err.type];
              const Icon = meta.icon;
              return (
                <li key={`${err.type}-${err.position}`} className="flex items-start gap-3 text-sm">
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.tone}`}>
                    <Icon className="size-3" strokeWidth={2} />
                    {meta.label}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-900 dark:text-white">«{err.word}»</strong> {err.suggestion}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Sin errores detectados. Lectura limpia.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onRepeat} className={OUTLINE_BUTTON}>
          <RotateCcw className="size-3.5" strokeWidth={2} />
          Repetir lectura para mejorar puntaje
        </button>
        <button type="button" onClick={onContinue} className={AMBER_BUTTON}>
          Continuar a comprensión
          <ArrowRight className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
