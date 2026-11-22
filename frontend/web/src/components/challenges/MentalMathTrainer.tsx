import { useState } from "react";
import type { FormEvent } from "react";
import { Brain, Lightbulb, Play, RotateCcw, Sparkles } from "lucide-react";
import { useMentalTrainer } from "../../hooks/useMentalTrainer.ts";
import type { MentalTestResult } from "../../types/challenges.ts";
import { ChallengeCard, PRIMARY_BUTTON } from "./ChallengeCard.tsx";

function AnswerForm({ onSubmit, disabled }: { onSubmit: (value: number) => void; disabled: boolean }) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = Number(text.trim());
    if (text.trim() === "" || !Number.isFinite(value)) return;
    onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2">
      <label htmlFor="mental-answer" className="sr-only">
        Tu respuesta
      </label>
      <input
        id="mental-answer"
        autoFocus
        inputMode="numeric"
        autoComplete="off"
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value.replace(/[^\d-]/g, ""))}
        placeholder="?"
        className="h-14 w-36 rounded-2xl border border-slate-200 bg-white text-center text-2xl font-bold text-slate-900 tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-60 dark:border-[#2A3347] dark:bg-[#161E30] dark:text-white"
      />
      <button type="submit" disabled={disabled || text.trim() === ""} className={`${PRIMARY_BUTTON} h-14 disabled:opacity-50`}>
        Responder
      </button>
    </form>
  );
}

function ResultView({ result, onRestart }: { result: MentalTestResult; onRestart: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Puntaje" value={`${result.score}`} />
        <Metric label="Exactitud" value={`${Math.round(result.accuracy * 100)}%`} />
        <Metric label="Tiempo medio" value={`${(result.avg_response_ms / 1000).toFixed(1)}s`} />
        <Metric label="Nivel máximo" value={`${result.max_level_reached}`} />
      </div>

      <ul className="flex flex-col gap-2" aria-label="Resultado por nivel">
        {result.per_level.map((l) => (
          <li key={l.level} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="w-14 shrink-0 font-medium">Nivel {l.level}</span>
            <div className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-[#2A3347]">
              <div
                className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                style={{ width: `${(l.correct / l.total) * 100}%` }}
              />
            </div>
            <span className="w-20 shrink-0 text-right tabular-nums">
              {l.correct}/{l.total} · {(l.avg_ms / 1000).toFixed(1)}s
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 md:grid-cols-2">
        <InfoList icon={<Lightbulb className="size-4" strokeWidth={1.75} />} title="Consejos para mejorar" items={result.tips} />
        <InfoList icon={<Sparkles className="size-4" strokeWidth={1.75} />} title="Ejemplos cotidianos" items={result.everyday_examples} />
      </div>

      <button type="button" onClick={onRestart} className={`${PRIMARY_BUTTON} self-start`}>
        <RotateCcw className="size-4" strokeWidth={2} />
        Entrenar de nuevo
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-[#161E30]">
      <p className="text-2xl font-bold text-slate-900 tabular-nums dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function InfoList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-2xl bg-blue-50 p-4 dark:bg-[#161E30]">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-300">
        {icon}
        {title}
      </h3>
      <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm text-slate-700 dark:text-slate-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function MentalMathTrainer() {
  const t = useMentalTrainer();
  const limit = t.question?.time_limit_ms ?? t.level?.time_limit_ms ?? 1;
  const fraction = Math.max(0, Math.min(1, t.remainingMs / limit));

  return (
    <ChallengeCard
      title="Cálculo mental"
      subtitle="Empieza por sumas. Cada nivel da menos tiempo y más dificultad."
      icon={Brain}
      tone="blue"
    >
      {t.phase === "intro" && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Son {t.levelCount} niveles de {t.questionsPerLevel} sumas. Con 2 aciertos o más pasas al siguiente. Al
            final recibes consejos y ejemplos para tu día a día.
          </p>
          <button type="button" onClick={t.start} className={PRIMARY_BUTTON}>
            <Play className="size-4 fill-current" />
            Empezar
          </button>
        </div>
      )}

      {(t.phase === "question" || t.phase === "feedback") && t.question && t.level && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              Nivel {t.level.level}: {t.level.label}
            </span>
            <span>
              Pregunta {t.asked}/{t.questionsPerLevel} · {t.level.time_limit_ms / 1000}s por suma
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Tiempo para responder"
            aria-valuemin={0}
            aria-valuemax={Math.round(limit / 1000)}
            aria-valuenow={Math.ceil(t.remainingMs / 1000)}
            className="h-2 rounded-full bg-slate-200 dark:bg-[#2A3347]"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-75 ease-linear ${
                fraction > 0.3 ? "bg-blue-500 dark:bg-blue-400" : "bg-rose-500 dark:bg-rose-400"
              }`}
              style={{ width: `${fraction * 100}%` }}
            />
          </div>

          <p className="text-center text-4xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
            {t.question.prompt} = ?
          </p>

          <AnswerForm key={t.question.id} onSubmit={t.submit} disabled={t.phase === "feedback"} />

          <p className="h-5 text-center text-sm font-semibold" aria-live="assertive">
            {t.outcome?.correct && <span className="text-emerald-600 dark:text-emerald-400">¡Correcto!</span>}
            {t.outcome && !t.outcome.correct && (
              <span className="text-rose-600 dark:text-rose-400">
                {t.outcome.timedOut ? "Se acabó el tiempo. " : ""}Era {t.outcome.correctAnswer}.
              </span>
            )}
          </p>
        </div>
      )}

      {t.phase === "result" && t.result && <ResultView result={t.result} onRestart={t.start} />}
    </ChallengeCard>
  );
}
