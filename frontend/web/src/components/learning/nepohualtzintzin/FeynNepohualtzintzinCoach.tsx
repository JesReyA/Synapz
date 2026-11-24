import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Lightbulb, RotateCcw, Timer } from "lucide-react";
import { base20Equation, describeColumns, formatBig, generateChallenge } from "../../../lib/nepohualtzintzin.ts";
import type {
  ChallengeKind,
  CoachDifficulty,
  CoachFeedback,
  CoachStatus,
  NepohualtzintzinChallenge,
} from "../../../types/nepohualtzintzin.ts";

interface FeynNepohualtzintzinCoachProps {
  /** Valor actual del tablero donde el alumno deja la respuesta. */
  value: bigint;
  /** Nombre de ese tablero, para la instrucción. */
  answerLabel: string;
}

const LEVELS: { id: CoachDifficulty; label: string; detail: string }[] = [
  { id: "basic", label: "Básico", detail: "Representar números" },
  { id: "intermediate", label: "Intermedio", detail: "Sumas y restas" },
  { id: "advanced", label: "Avanzado", detail: "Multiplicación y cálculo rápido" },
];

const STRATEGY: Record<ChallengeKind, string> = {
  represent: "Divide el número entre 20. El residuo va en la columna de 1 y el cociente en la de 20. Si el cociente pasa de 19, sigue dividiendo.",
  add: "Suma columna por columna, de derecha a izquierda. Si una columna pasa de 19, deja el sobrante y suma 1 en la columna de la izquierda.",
  subtract: "Resta de derecha a izquierda. Si no te alcanza, toma 1 de la columna de la izquierda: ahí vale 20 en la columna de tu derecha.",
  multiply: "Descompón un factor, por ejemplo 14 × 6 = 10 × 6 + 4 × 6. Forma cada parte en el tablero y suma los resultados.",
  shift: "Multiplicar por 20 mueve cada cuenta una columna hacia la izquierda.",
};

function buildHint(challenge: NepohualtzintzinChallenge, value: bigint, level: number): CoachFeedback {
  const direction = value < challenge.target ? "Todavía te falta cantidad." : "Te pasaste de la cantidad.";
  const first = [`${direction} Tu tablero marca ${formatBig(value)}.`];
  if (level <= 1) return { tone: "wrong", lines: first };
  if (level === 2) return { tone: "hint", lines: [...first, `Pista: ${STRATEGY[challenge.kind]}`] };
  return {
    tone: "hint",
    lines: [
      ...first,
      `Descomposición en base 20: ${base20Equation(challenge.target)}.`,
      ...describeColumns(challenge.target),
    ],
  };
}

const seconds = (ms: number) => (ms / 1000).toFixed(1);

export function FeynNepohualtzintzinCoach({ value, answerLabel }: FeynNepohualtzintzinCoachProps) {
  const [difficulty, setDifficulty] = useState<CoachDifficulty>("basic");
  const [status, setStatus] = useState<CoachStatus>("idle");
  const [challenge, setChallenge] = useState<NepohualtzintzinChallenge | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [failedChecks, setFailedChecks] = useState(0);
  const [feedback, setFeedback] = useState<CoachFeedback | null>(null);
  const startRef = useRef(0);

  // Verificación automática: cuando el tablero coincide con el objetivo, el reto queda resuelto.
  if (status === "running" && challenge && value === challenge.target) {
    setStatus("solved");
    setFeedback(null);
  }

  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => setElapsedMs(Date.now() - startRef.current), 100);
    return () => window.clearInterval(id);
  }, [status]);

  function requestChallenge() {
    setChallenge(generateChallenge(difficulty));
    setStatus("running");
    setFailedChecks(0);
    setFeedback(null);
    setElapsedMs(0);
    startRef.current = Date.now();
  }

  function check() {
    if (!challenge || status !== "running") return;
    const level = failedChecks + 1;
    setFailedChecks(level);
    setFeedback(buildHint(challenge, value, level));
  }

  return (
    <section
      aria-label="Retos con Feyn"
      className="flex flex-col gap-4 rounded-2xl border border-amber-300 bg-amber-50/60 p-5 shadow-sm dark:border-amber-400/30 dark:bg-amber-400/5 dark:shadow-none"
    >
      <header className="flex items-center gap-3">
        <img src="/feyn.png" alt="" className="size-10 shrink-0 rounded-full bg-amber-400 p-1.5 object-contain" />
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Retos de destreza con Feyn</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">Feyn te propone una cantidad u operación y comprueba tu tablero al instante.</p>
        </div>
      </header>

      <div role="radiogroup" aria-label="Dificultad" className="grid gap-2 sm:grid-cols-3">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={difficulty === l.id}
            onClick={() => setDifficulty(l.id)}
            className={`rounded-2xl border px-4 py-2.5 text-left transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              difficulty === l.id
                ? "border-amber-400 bg-amber-100 dark:border-amber-400 dark:bg-amber-400/15"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-[#2A3347] dark:bg-[#161E30]"
            }`}
          >
            <span className="block text-sm font-semibold text-slate-900 dark:text-white">{l.label}</span>
            <span className="block text-xs text-slate-600 dark:text-slate-300">{l.detail}</span>
          </button>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={requestChallenge}
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-[#0B0F1A]"
        >
          <img src="/feyn.png" alt="" className="size-5 rounded-full object-contain" />
          {status === "idle" ? "Pedir reto a Feyn" : "Pedir otro reto"}
        </button>
      </div>

      {challenge && (
        <div aria-live="polite" className="flex flex-col gap-3 rounded-2xl bg-white p-4 dark:bg-[#161E30]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{challenge.prompt}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 tabular-nums dark:bg-[#1B2438] dark:text-white">
              <Timer className="size-4 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
              <span role="timer" aria-label="Tiempo del reto">{seconds(elapsedMs)} s</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Deja la respuesta en: {answerLabel}.</p>

          {status === "running" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={check}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-[#161E30]"
              >
                <Lightbulb className="size-3.5" strokeWidth={1.75} />
                Comprobar con Feyn
              </button>
              <button
                type="button"
                onClick={requestChallenge}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2A3347] dark:text-slate-200 dark:hover:bg-white/5"
              >
                <RotateCcw className="size-3.5" strokeWidth={1.75} />
                Cambiar reto
              </button>
            </div>
          )}

          {status === "solved" && (
            <p className="flex items-start gap-2 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
              <span>
                ¡Correcto! Lo lograste en <strong>{seconds(elapsedMs)} s</strong>
                {failedChecks > 0 ? ` con ${failedChecks} ${failedChecks === 1 ? "pista" : "pistas"}` : " sin pistas"}.
                <span className="mt-1 block text-xs">En base 20: {base20Equation(challenge.target)}</span>
              </span>
            </p>
          )}

          {status === "running" && feedback && (
            <div
              role="status"
              className={`rounded-xl p-3 text-sm ${
                feedback.tone === "wrong"
                  ? "bg-orange-100 text-orange-900 dark:bg-amber-900/40 dark:text-amber-100"
                  : "bg-blue-50 text-slate-800 dark:bg-blue-500/10 dark:text-slate-200"
              }`}
            >
              <ul className="flex flex-col gap-1">
                {feedback.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
