import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  Headphones,
  Music,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { FeynTopicContext, LessonBundle, Modality } from "../../types/learning.ts";
import { AudioPlayer } from "./AudioPlayer.tsx";
import { AMBER_BUTTON, BACK_LINK, INNER_CARD, OUTLINE_BUTTON, PANEL } from "./styles.ts";

interface MultimodalLessonViewerProps {
  bundle: LessonBundle;
  onBack: () => void;
  onExplainToFeyn: (context: FeynTopicContext) => void;
}

const FORMATS: { id: Modality; label: string; icon: LucideIcon }[] = [
  { id: "visual", label: "Visual", icon: Eye },
  { id: "reading", label: "Lectura", icon: BookOpen },
  { id: "auditory", label: "Auditivo", icon: Headphones },
];

const MODALITY_NAME: Record<Modality, string> = { visual: "Visual", reading: "Lectura", auditory: "Auditivo" };

const STEP_TONES = [
  "bg-blue-500 text-white",
  "bg-amber-400 text-slate-900",
  "bg-emerald-500 text-white dark:bg-emerald-400 dark:text-slate-900",
  "bg-violet-500 text-white dark:bg-violet-400 dark:text-slate-900",
];

interface FormatState {
  current: Modality;
  previous: Modality | null;
  notice: string | null;
}

/** Elige una modalidad distinta a la actual y, si se puede, distinta a la anterior. */
function alternativeTo(current: Modality, previous: Modality | null): Modality {
  const others = FORMATS.map((f) => f.id).filter((m) => m !== current);
  return others.find((m) => m !== previous) ?? others[0] ?? current;
}

export function MultimodalLessonViewer({ bundle, onBack, onExplainToFeyn }: MultimodalLessonViewerProps) {
  const [format, setFormat] = useState<FormatState>({ current: bundle.preferred, previous: null, notice: null });
  const lesson = bundle.lessons[format.current];

  function choose(modality: Modality) {
    if (modality === format.current) return;
    setFormat((f) => ({ current: modality, previous: f.current, notice: null }));
  }

  function explainDifferently() {
    setFormat((f) => {
      const next = alternativeTo(f.current, f.previous);
      return {
        current: next,
        previous: f.current,
        notice: `Probemos de otra forma. Ahora te lo explico en formato ${MODALITY_NAME[next]}.`,
      };
    });
  }

  return (
    <section aria-label={`Lección: ${bundle.topic.title}`} className={`${PANEL} flex flex-col gap-5`}>
      <header className="flex flex-col gap-3">
        <button type="button" onClick={onBack} className={BACK_LINK}>
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Volver a Aprender
        </button>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{bundle.topic.title}</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{lesson.title}</h2>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Formato de la explicación" className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
          {FORMATS.map(({ id, label, icon: Icon }) => {
            const active = format.current === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choose(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  active
                    ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500/25 dark:text-white dark:shadow-none"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={explainDifferently}
          className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:shadow-none dark:focus-visible:ring-offset-[#131A29]"
        >
          <RefreshCw className="size-4" strokeWidth={2} />
          No me quedó claro, explícalo diferente
        </button>
      </div>

      <div aria-live="polite" className="min-h-6">
        {format.notice && (
          <p className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
            <Sparkles className="size-4 shrink-0" strokeWidth={1.75} />
            {format.notice}
          </p>
        )}
      </div>

      <article key={`${lesson.modality}-${lesson.title}`} className="flex flex-col gap-4">
        {lesson.interests_used.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Conectado con tus gustos: <span className="font-medium">{lesson.interests_used.join(", ")}</span>
          </p>
        )}

        {lesson.modality === "visual" && (
          <ol className="flex flex-col gap-3">
            {lesson.blocks.map((block, i) => (
              <li key={block.heading} className="flex flex-col gap-2">
                <div className={`${INNER_CARD} flex gap-3`}>
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-xl text-sm font-bold ${STEP_TONES[i % STEP_TONES.length]}`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{block.heading}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{block.body}</p>
                    {block.visual_description && (
                      <p className="mt-3 flex items-start gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-200">
                        <Eye className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                        {block.visual_description}
                      </p>
                    )}
                  </div>
                </div>
                {i < lesson.blocks.length - 1 && (
                  <ArrowRight
                    className="size-4 shrink-0 rotate-90 self-center text-slate-400 dark:text-slate-500"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
        )}

        {lesson.modality === "reading" &&
          lesson.blocks.map((block) => (
            <div key={block.heading} className={INNER_CARD}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{block.heading}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{block.body}</p>
            </div>
          ))}

        {lesson.modality === "auditory" && (
          <>
            {lesson.narration_script && (
              <AudioPlayer key={lesson.narration_script} title="Narración" text={lesson.narration_script} icon={Headphones} />
            )}
            {lesson.mnemonic_song && (
              <AudioPlayer key={lesson.mnemonic_song} title="Canción para recordar" text={lesson.mnemonic_song} icon={Music} asLyrics />
            )}
            {lesson.blocks.map((block) => (
              <div key={block.heading} className={INNER_CARD}>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{block.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{block.body}</p>
              </div>
            ))}
          </>
        )}

        <p className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" strokeWidth={1.75} />
          <span>Basado en el material de tu profesor: «{lesson.grounding.map((g) => g.quote).join("» «")}»</span>
        </p>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-[#222B3E]">
        <p className="text-sm text-slate-600 dark:text-slate-300">¿Ya lo entiendes? Compruébalo explicándoselo a Feyn.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onBack} className={OUTLINE_BUTTON}>
            Terminar por ahora
          </button>
          <button type="button" onClick={() => onExplainToFeyn(bundle.topic)} className={AMBER_BUTTON}>
            <img src="/feyn.png" alt="" className="size-5 rounded-full object-contain" />
            Enséñale a Feyn
          </button>
        </div>
      </div>
    </section>
  );
}
