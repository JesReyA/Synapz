import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, BookOpen, Eye, Headphones, Loader2, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useAdaptiveLesson } from "../../hooks/useAdaptiveLesson.ts";
import type {
  ClassroomSummary,
  FeynTopicContext,
  InterestProfile,
  Modality,
  SyllabusTopic,
} from "../../types/classes.ts";

interface AdaptiveLessonViewProps {
  classroom: ClassroomSummary;
  topic: SyllabusTopic;
  classes: ClassroomSummary[];
  profile: InterestProfile | null;
  onBack: () => void;
  onExplainToFeyn: (context: FeynTopicContext) => void;
}

const FORMATS: { id: Modality; label: string; icon: LucideIcon }[] = [
  { id: "visual", label: "Visual", icon: Eye },
  { id: "reading", label: "Lectura", icon: BookOpen },
  { id: "auditory", label: "Auditivo", icon: Headphones },
];

const ORDER: Modality[] = ["visual", "reading", "auditory"];

interface FormatState {
  modality: Modality;
  previous: Modality | undefined;
  nonce: number;
}

export function AdaptiveLessonView({
  classroom,
  topic,
  classes,
  profile,
  onBack,
  onExplainToFeyn,
}: AdaptiveLessonViewProps) {
  const [format, setFormat] = useState<FormatState>({
    modality: profile?.preferred_modality ?? "reading",
    previous: undefined,
    nonce: 0,
  });

  const { loading, lesson, error } = useAdaptiveLesson({
    classroomId: classroom.id,
    topicId: topic.id,
    modality: format.modality,
    ...(format.previous ? { previousModality: format.previous } : {}),
    nonce: format.nonce,
    classes,
    profile,
  });

  function choose(modality: Modality) {
    if (modality === format.modality) return;
    setFormat((f) => ({ modality, previous: f.modality, nonce: f.nonce + 1 }));
  }

  function regenerateInOtherFormat() {
    const next = ORDER[(ORDER.indexOf(format.modality) + 1) % ORDER.length] ?? "reading";
    choose(next);
  }

  const noMaterial = error?.code === "NO_TEACHER_MATERIAL";

  return (
    <section
      aria-label={`Estudiar ${topic.title}`}
      className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 self-start rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" strokeWidth={1.75} />
          Volver al temario de {classroom.name}
        </button>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{topic.title}</h2>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Formato de la explicación" className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
          {FORMATS.map(({ id, label, icon: Icon }) => {
            const active = format.modality === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choose(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
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
          onClick={regenerateInOtherFormat}
          disabled={loading || noMaterial}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50 dark:border-[#2A3347] dark:text-slate-200 dark:hover:bg-white/5"
        >
          <RefreshCw className="size-3.5" strokeWidth={1.75} />
          No entiendo, explícalo de otra forma
        </button>
      </div>

      <div aria-live="polite" className="min-h-40">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            Feyn está preparando tu explicación…
          </p>
        )}

        {error && (
          <p
            role="alert"
            className={`rounded-2xl px-4 py-3 text-sm ${
              noMaterial
                ? "bg-orange-100 text-orange-800 dark:bg-amber-900/40 dark:text-amber-200"
                : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"
            }`}
          >
            {error.message}
          </p>
        )}

        {lesson && (
          <article className="flex flex-col gap-4">
            {lesson.interests_used.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explicado con: {lesson.interests_used.join(", ")}
              </p>
            )}

            {lesson.blocks.map((block) => (
              <div
                key={block.heading}
                className="rounded-2xl bg-slate-50 p-4 dark:bg-[#161E30]"
              >
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{block.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{block.body}</p>
                {block.visual_description && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-3 text-xs text-blue-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-200">
                    <Eye className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
                    {block.visual_description}
                  </p>
                )}
              </div>
            ))}

            {lesson.narration_script && (
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-[#161E30]">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  <Headphones className="size-4" strokeWidth={1.75} />
                  Narración
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {lesson.narration_script}
                </p>
                {lesson.mnemonic_song && (
                  <p className="mt-3 border-l-2 border-amber-400 pl-3 text-sm text-slate-700 italic dark:text-slate-200">
                    ♪ {lesson.mnemonic_song}
                  </p>
                )}
              </div>
            )}

            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="size-4 shrink-0 text-emerald-500" strokeWidth={1.75} />
              Basado en el material de tu profesor: {lesson.grounding.map((g) => g.quote).join("; ")}
            </p>
          </article>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-[#222B3E]">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Ya lo entiendes? Compruébalo explicándoselo a Feyn.
        </p>
        <button
          type="button"
          disabled={noMaterial}
          onClick={() =>
            onExplainToFeyn({ classroom_id: classroom.id, topic_id: topic.id, title: topic.title })
          }
          className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50 dark:shadow-none"
        >
          <MessageCircle className="size-4" strokeWidth={1.75} />
          Explicárselo a Feyn
        </button>
      </div>
    </section>
  );
}
