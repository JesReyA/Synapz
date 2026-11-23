import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, CheckCircle2, Lightbulb, PartyPopper, RotateCcw } from "lucide-react";
import type { RemedialSet } from "../../types/learning.ts";
import { Modal } from "../classes/Modal.tsx";
import { AMBER_BUTTON, OUTLINE_BUTTON } from "./styles.ts";

interface RemedialPracticeModalProps {
  set: RemedialSet;
  onClose: () => void;
  /** Se llama al terminar con los pasos resueltos sin pista. */
  onFinish: (firstTryCorrect: number, total: number) => void;
}

type Status = "answering" | "wrong" | "correct";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "").replace(",", ".");
}

export function RemedialPracticeModal({ set, onClose, onFinish }: RemedialPracticeModalProps) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [failedCurrent, setFailedCurrent] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [done, setDone] = useState(false);

  const total = set.exercises.length;
  const exercise = set.exercises[index];

  function check(e: FormEvent) {
    e.preventDefault();
    if (!exercise || value.trim() === "") return;
    if (exercise.accepted_answers.includes(normalize(value))) {
      setStatus("correct");
    } else {
      setStatus("wrong");
      setFailedCurrent(true);
    }
  }

  function next() {
    const gained = firstTry + (failedCurrent ? 0 : 1);
    if (index + 1 >= total) {
      setFirstTry(gained);
      setDone(true);
      onFinish(gained, total);
      return;
    }
    setFirstTry(gained);
    setIndex(index + 1);
    setValue("");
    setStatus("answering");
    setFailedCurrent(false);
  }

  function restart() {
    setIndex(0);
    setValue("");
    setStatus("answering");
    setFailedCurrent(false);
    setFirstTry(0);
    setDone(false);
  }

  return (
    <Modal
      title={set.title}
      description={`Sin reloj. Refuerzas: ${set.prerequisite.title}.`}
      onClose={onClose}
      wide
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <PartyPopper className="size-10 text-amber-400" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-lg font-bold text-slate-900 dark:text-white">¡Terminaste la práctica!</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Resolviste {firstTry} de {total} a la primera. Lo demás lo lograste con ayuda de una pista, y eso también cuenta.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={restart} className={OUTLINE_BUTTON}>
              <RotateCcw className="size-3.5" strokeWidth={2} />
              Practicar otra vez
            </button>
            <button type="button" onClick={onClose} className={AMBER_BUTTON}>
              Listo
            </button>
          </div>
        </div>
      ) : (
        exercise && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div
                role="progressbar"
                aria-label="Avance de la práctica"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={index}
                className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-[#2A3347]"
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-200 dark:bg-emerald-400"
                  style={{ width: `${(index / total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                {index + 1}/{total}
              </span>
            </div>

            <form onSubmit={check} className="flex flex-col items-center gap-4">
              <p className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {exercise.prompt}
                {exercise.prompt.includes("+") ? " = ?" : ""}
              </p>
              <div className="flex items-center gap-2">
                <label htmlFor="remedial-answer" className="sr-only">
                  Tu respuesta
                </label>
                <input
                  id="remedial-answer"
                  key={exercise.id}
                  autoFocus
                  autoComplete="off"
                  inputMode={exercise.skill === "fractions" ? "text" : "numeric"}
                  value={value}
                  disabled={status === "correct"}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                  placeholder={exercise.skill === "fractions" ? "ej. 3/4" : "?"}
                  className="h-12 w-40 rounded-2xl border border-slate-200 bg-white text-center text-xl font-bold text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-60 dark:border-[#2A3347] dark:bg-[#161E30] dark:text-white"
                />
                {status !== "correct" && (
                  <button type="submit" disabled={value.trim() === ""} className={AMBER_BUTTON}>
                    Comprobar
                  </button>
                )}
              </div>
            </form>

            <div aria-live="polite" className="flex flex-col gap-3">
              {status === "correct" && (
                <div className="flex flex-col items-center gap-3">
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" strokeWidth={2} />
                    {failedCurrent ? "¡Eso es! Ya lo lograste." : "¡Correcto!"}
                  </p>
                  <button type="button" onClick={next} className={AMBER_BUTTON}>
                    {index + 1 >= total ? "Terminar" : "Siguiente"}
                    <ArrowRight className="size-4" strokeWidth={2} />
                  </button>
                </div>
              )}

              {failedCurrent && status !== "correct" && (
                <div role="status" className="rounded-2xl bg-orange-100 p-4 text-sm text-orange-900 dark:bg-amber-900/40 dark:text-amber-100">
                  <p className="flex items-center gap-2 font-semibold">
                    <Lightbulb className="size-4 shrink-0" strokeWidth={1.75} />
                    Todavía no. Sin prisa, mira esta pista: {exercise.hint_title}
                  </p>
                  <p className="mt-2 leading-relaxed">{exercise.everyday_hint}</p>
                  <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 font-mono text-xs dark:bg-black/20">
                    {exercise.worked_example}
                  </p>
                  <p className="mt-2 text-xs">Cambia tu respuesta y vuelve a comprobar. Puedes intentarlo las veces que quieras.</p>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </Modal>
  );
}
