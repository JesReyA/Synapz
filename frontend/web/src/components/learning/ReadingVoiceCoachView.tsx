import { useState } from "react";
import { ArrowLeft, BookOpen, Mic } from "lucide-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder.ts";
import type {
  AudioError,
  EvaluateAudioResponse,
  GenerateReadingResponse,
  ReadingBundle,
  RecordingResult,
} from "../../types/learning.ts";
import { ClozeExercise } from "./ClozeExercise.tsx";
import { ComprehensionQuiz } from "./ComprehensionQuiz.tsx";
import { VoiceFeedback } from "./VoiceFeedback.tsx";
import { VoiceRecorderPanel } from "./VoiceRecorderPanel.tsx";
import { BACK_LINK, INNER_CARD, PANEL } from "./styles.ts";

export type EvaluateAudio = (
  reading: GenerateReadingResponse,
  attempt: number,
  previousBest: number,
  recording: RecordingResult,
) => Promise<EvaluateAudioResponse>;

interface ReadingVoiceCoachViewProps {
  bundle: ReadingBundle;
  onBack: () => void;
  onEvaluate: EvaluateAudio;
  /** Avance 0-100 de la actividad, para la barra de la tarjeta. */
  onProgress?: (percent: number) => void;
}

type ExerciseTab = "comprehension" | "cloze";

const ERROR_UNDERLINE: Record<AudioError["type"], string> = {
  mispronounced: "bg-rose-200 dark:bg-rose-500/30",
  omitted: "bg-amber-200 dark:bg-amber-400/30",
  inserted: "bg-violet-200 dark:bg-violet-400/30",
  punctuation: "bg-blue-200 dark:bg-blue-500/30",
};

function ReadingText({ text, errors }: { text: string; errors: AudioError[] }) {
  const byPosition = new Map(errors.map((e) => [e.position, e]));
  return (
    <p className="text-base leading-8 text-slate-800 dark:text-slate-100">
      {text.split(/\s+/).map((word, i) => {
        const err = byPosition.get(i);
        return (
          <span key={i}>
            {err ? <mark className={`rounded px-1 text-inherit ${ERROR_UNDERLINE[err.type]}`}>{word}</mark> : word}{" "}
          </span>
        );
      })}
    </p>
  );
}

function StepHeader({ step }: { step: 1 | 2 }) {
  const items = [
    { n: 1, label: "Lectura en voz alta", icon: Mic },
    { n: 2, label: "Comprensión", icon: BookOpen },
  ] as const;
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Pasos">
      {items.map(({ n, label, icon: Icon }) => (
        <li
          key={n}
          aria-current={step === n ? "step" : undefined}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
            step === n
              ? "bg-amber-400 text-slate-900"
              : "bg-slate-100 text-slate-500 dark:bg-[#1B2438] dark:text-slate-400"
          }`}
        >
          <Icon className="size-3.5" strokeWidth={1.75} />
          Paso {n}: {label}
        </li>
      ))}
    </ol>
  );
}

export function ReadingVoiceCoachView({ bundle, onBack, onEvaluate, onProgress }: ReadingVoiceCoachViewProps) {
  const reading = bundle.comprehension;
  const [step, setStep] = useState<1 | 2>(1);
  const [attempt, setAttempt] = useState(1);
  const [evaluation, setEvaluation] = useState<EvaluateAudioResponse | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [tab, setTab] = useState<ExerciseTab>("comprehension");

  const recorder = useVoiceRecorder({
    onFinished: (recording) => {
      setEvaluating(true);
      setEvalError(null);
      onEvaluate(reading, attempt, bestScore, recording)
        .then((result) => {
          setEvaluation(result);
          setBestScore(result.best_score);
          onProgress?.(50);
        })
        .catch(() => setEvalError("No pude evaluar tu lectura. Intenta grabarla de nuevo."))
        .finally(() => setEvaluating(false));
    },
  });

  function repeat() {
    recorder.reset();
    setEvaluation(null);
    setAttempt((a) => a + 1);
  }

  const exerciseDone = () => onProgress?.(100);

  return (
    <section aria-label={`Lectura: ${reading.title}`} className={`${PANEL} flex flex-col gap-5`}>
      <header className="flex flex-col gap-3">
        <button type="button" onClick={onBack} className={BACK_LINK}>
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Volver a Aprender
        </button>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sobre tus gustos: {reading.interests_used.join(", ")} · {reading.word_count} palabras
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{reading.title}</h2>
        </div>
        <StepHeader step={step} />
      </header>

      {step === 1 && (
        <>
          <div className={INNER_CARD}>
            <ReadingText text={reading.text} errors={evaluation?.errors ?? []} />
          </div>

          {!evaluation && (
            <VoiceRecorderPanel
              status={recorder.status}
              elapsed={recorder.elapsed}
              simulated={recorder.simulated}
              recording={recorder.recording}
              error={recorder.error ?? evalError}
              evaluating={evaluating}
              onStart={() => void recorder.start()}
              onStop={recorder.stop}
              onSimulate={recorder.startSimulated}
            />
          )}

          {evaluation && <VoiceFeedback result={evaluation} onRepeat={repeat} onContinue={() => setStep(2)} />}
        </>
      )}

      {step === 2 && (
        <>
          <div role="tablist" aria-label="Tipo de ejercicio" className="inline-flex self-start rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
            {(
              [
                { id: "comprehension", label: "Preguntas" },
                { id: "cloze", label: "Palabras faltantes" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  tab === t.id
                    ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500/25 dark:text-white dark:shadow-none"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "comprehension" && (
            <>
              <div className={INNER_CARD}>
                <ReadingText text={reading.text} errors={[]} />
              </div>
              <ComprehensionQuiz questions={reading.questions ?? []} onChecked={exerciseDone} />
            </>
          )}
          {tab === "cloze" && (
            <ClozeExercise text={bundle.cloze.text} blanks={bundle.cloze.blanks ?? []} onChecked={exerciseDone} />
          )}

          <button type="button" onClick={() => setStep(1)} className={`${BACK_LINK} mt-1`}>
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Volver a la lectura en voz alta
          </button>
        </>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Basado en el material de tu profesor: «{reading.grounding.map((g) => g.quote).join("» «")}»
      </p>
    </section>
  );
}
