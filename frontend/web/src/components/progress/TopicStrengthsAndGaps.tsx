import { ArrowRight, BadgeCheck, TrendingDown, Trophy } from "lucide-react";
import { SUBJECT_LABEL, topicStatus } from "../../lib/progressAnalysis.ts";
import type { ProgressTopic, TopicAnalysis, TopicRecommendation, TopicStatus } from "../../types/progress.ts";

interface TopicStrengthsAndGapsProps {
  topics: ProgressTopic[];
  analysis: TopicAnalysis;
  recommendations: TopicRecommendation[];
  /** Lleva al alumno a la vista Aprender. */
  onReinforce: (topic: ProgressTopic) => void;
}

const STATUS: Record<TopicStatus, { label: string; tone: string }> = {
  mastered: {
    label: "Dominado",
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  },
  in_progress: {
    label: "En progreso",
    tone: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
  },
  needs_support: {
    label: "Requiere refuerzo",
    tone: "bg-orange-100 text-orange-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
};

const CARD = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none";

export function TopicStrengthsAndGaps({ topics, analysis, recommendations, onReinforce }: TopicStrengthsAndGapsProps) {
  const { strongest, weakest } = analysis;
  const forTopic = (id: string) => recommendations.filter((r) => r.topic_id === id).map((r) => r.text);
  const strongTip = forTopic(strongest.topic_id)[0];
  const weakTips = forTopic(weakest.topic_id);
  const ordered = [...topics].sort((a, b) => b.score - a.score);

  return (
    <section aria-label="Fortalezas y áreas de rezago" className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className={`${CARD} flex flex-col gap-3`}>
          <header className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
              <Trophy className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tu mayor fortaleza</h3>
          </header>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{strongest.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{SUBJECT_LABEL[strongest.subject_area]}</p>
          </div>
          <p className="text-3xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">{strongest.score}%</p>
          {strongTip && (
            <p className="mt-auto flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-[#161E30] dark:text-slate-300">
              <img src="/feyn.png" alt="" className="size-5 shrink-0 rounded-full object-contain" />
              {strongTip}
            </p>
          )}
        </article>

        <article className={`${CARD} flex flex-col gap-3`}>
          <header className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-orange-100 text-orange-600 dark:bg-amber-900/40 dark:text-amber-400">
              <TrendingDown className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">Área prioritaria de rezago</h3>
          </header>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{weakest.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{SUBJECT_LABEL[weakest.subject_area]}</p>
          </div>
          <p className="text-3xl font-bold text-orange-600 tabular-nums dark:text-amber-400">{weakest.score}%</p>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-[#161E30]">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <img src="/feyn.png" alt="" className="size-5 shrink-0 rounded-full object-contain" />
              Feyn te recomienda
            </p>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {weakTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
              {weakTips.length === 0 && <li>Practica este tema con una lección adaptada y explícaselo a Feyn.</li>}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onReinforce(weakest)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-[#131A29]"
          >
            Reforzar ahora
            <ArrowRight className="size-4" strokeWidth={2} />
          </button>
        </article>
      </div>

      <div className={CARD}>
        <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Progreso por tema</h3>
        <ul className="flex flex-col gap-3">
          {ordered.map((t) => {
            const status = STATUS[topicStatus(t.score)];
            return (
              <li key={t.topic_id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto_auto]">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-900 dark:text-white">
                    {t.title}
                    {t.feyn_mastered && (
                      <BadgeCheck
                        className="size-4 shrink-0 text-emerald-500 dark:text-emerald-400"
                        strokeWidth={2}
                        aria-label="Validado con Feyn"
                      />
                    )}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{SUBJECT_LABEL[t.subject_area]}</p>
                </div>
                <span
                  className={`row-start-1 inline-flex justify-self-end rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap sm:order-4 ${status.tone}`}
                >
                  {status.label}
                </span>
                <div
                  role="progressbar"
                  aria-label={`Progreso en ${t.title}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={t.score}
                  className="col-span-2 h-2 rounded-full bg-slate-200 sm:col-span-1 sm:order-2 dark:bg-[#2A3347]"
                >
                  <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${t.score}%` }} />
                </div>
                <span className="hidden w-10 text-right text-sm font-semibold text-slate-700 tabular-nums sm:order-3 sm:block dark:text-slate-200">
                  {t.score}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
