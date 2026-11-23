import { useState } from "react";
import { Check, X } from "lucide-react";
import type { ComprehensionQuestion } from "../../types/learning.ts";
import { AMBER_BUTTON, INNER_CARD, OUTLINE_BUTTON } from "./styles.ts";

interface ComprehensionQuizProps {
  questions: ComprehensionQuestion[];
  onChecked: (correct: number, total: number) => void;
}

export function ComprehensionQuiz({ questions, onChecked }: ComprehensionQuizProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);

  const correct = questions.filter((q) => answers[q.id] === q.correct_index).length;
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function check() {
    setChecked(true);
    onChecked(correct, questions.length);
  }

  function retry() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, qi) => (
        <fieldset key={q.id} className={INNER_CARD}>
          <legend className="sr-only">{q.question}</legend>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {qi + 1}. {q.question}
          </p>
          <div className="mt-2 flex flex-col gap-2" role="radiogroup" aria-label={q.question}>
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              const isRight = oi === q.correct_index;
              const state = !checked
                ? selected
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-[#2A3347] dark:bg-[#131A29] dark:text-slate-200"
                : isRight
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-200"
                  : selected
                    ? "border-rose-500 bg-rose-50 text-rose-800 dark:border-rose-400 dark:bg-rose-500/10 dark:text-rose-200"
                    : "border-slate-200 bg-white text-slate-500 dark:border-[#2A3347] dark:bg-[#131A29] dark:text-slate-400";
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={checked}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${state}`}
                >
                  {opt}
                  {checked && isRight && <Check className="size-4 shrink-0" strokeWidth={2.5} />}
                  {checked && selected && !isRight && <X className="size-4 shrink-0" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3" aria-live="polite">
        {!checked ? (
          <button type="button" onClick={check} disabled={!allAnswered} className={AMBER_BUTTON}>
            Comprobar respuestas
          </button>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Acertaste {correct} de {questions.length}
            </p>
            <button type="button" onClick={retry} className={OUTLINE_BUTTON}>
              Intentar otra vez
            </button>
          </>
        )}
      </div>
    </div>
  );
}
