import { useState } from "react";
import type { ClozeBlank } from "../../types/learning.ts";
import { AMBER_BUTTON, INNER_CARD, OUTLINE_BUTTON } from "./styles.ts";

interface ClozeExerciseProps {
  text: string;
  blanks: ClozeBlank[];
  onChecked: (correct: number, total: number) => void;
}

export function ClozeExercise({ text, blanks, onChecked }: ClozeExerciseProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const tokens = text.split(/\s+/);
  const byPosition = new Map(blanks.map((b) => [b.position, b]));
  const correct = blanks.filter((b) => answers[b.id] === b.answer).length;
  const allAnswered = blanks.every((b) => Boolean(answers[b.id]));

  function check() {
    setChecked(true);
    onChecked(correct, blanks.length);
  }

  function retry() {
    setAnswers({});
    setChecked(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className={`${INNER_CARD} text-sm leading-10 text-slate-800 dark:text-slate-200`}>
        {tokens.map((token, i) => {
          const blank = byPosition.get(i);
          if (!blank) return <span key={i}>{token} </span>;
          const trailing = token.replace(/^_+/, "");
          const value = answers[blank.id] ?? "";
          const ok = checked && value === blank.answer;
          const bad = checked && value !== blank.answer;
          return (
            <span key={i}>
              <select
                aria-label={`Palabra faltante ${blanks.indexOf(blank) + 1}`}
                value={value}
                disabled={checked}
                onChange={(e) => setAnswers((a) => ({ ...a, [blank.id]: e.target.value }))}
                className={`mx-0.5 rounded-lg border px-2 py-1 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  ok
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-400/10 dark:text-emerald-200"
                    : bad
                      ? "border-rose-500 bg-rose-50 text-rose-800 dark:border-rose-400 dark:bg-rose-500/10 dark:text-rose-200"
                      : "border-blue-300 bg-white text-blue-700 dark:border-blue-400/50 dark:bg-[#131A29] dark:text-blue-200"
                }`}
              >
                <option value="">____</option>
                {(blank.options ?? [blank.answer]).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              {trailing}{" "}
            </span>
          );
        })}
      </p>

      <div className="flex flex-wrap items-center gap-3" aria-live="polite">
        {!checked ? (
          <button type="button" onClick={check} disabled={!allAnswered} className={AMBER_BUTTON}>
            Comprobar palabras
          </button>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Completaste bien {correct} de {blanks.length}
              {correct < blanks.length &&
                `. Correctas: ${blanks.filter((b) => answers[b.id] !== b.answer).map((b) => b.answer).join(", ")}`}
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
