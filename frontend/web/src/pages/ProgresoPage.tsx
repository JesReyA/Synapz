import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { EvolutionInflectionChart } from "../components/progress/EvolutionInflectionChart.tsx";
import { ProgressOverviewKpis } from "../components/progress/ProgressOverviewKpis.tsx";
import { SkillsBreakdownCards } from "../components/progress/SkillsBreakdownCards.tsx";
import { TopicStrengthsAndGaps } from "../components/progress/TopicStrengthsAndGaps.tsx";
import { MOCK_PROGRESS } from "../data/mockProgress.ts";
import { analyzeTopics, computeGlobalMetrics, toDay, windowStartFor } from "../lib/progressAnalysis.ts";
import type { ProgressPeriod } from "../types/progress.ts";

interface ProgresoPageProps {
  dark: boolean;
  /** Lleva al alumno a la vista Aprender. */
  onReinforce: () => void;
}

const PERIODS: { id: ProgressPeriod; label: string }[] = [
  { id: "week", label: "Últimos 7 días" },
  { id: "month", label: "Este mes" },
  { id: "cycle", label: "Todo el ciclo" },
];

export function ProgresoPage({ dark, onReinforce }: ProgresoPageProps) {
  const data = MOCK_PROGRESS;
  const [period, setPeriod] = useState<ProgressPeriod>("cycle");

  const windowStart = windowStartFor(period, toDay(data.generated_at), data.cycle_start);
  const metrics = useMemo(() => computeGlobalMetrics(data), [data]);
  const analysis = useMemo(() => analyzeTopics(data.topics), [data.topics]);
  const mentalMath = useMemo(() => data.mental_math_sessions.filter((s) => s.date >= windowStart), [data.mental_math_sessions, windowStart]);
  const reading = useMemo(() => data.reading_sessions.filter((s) => s.date >= windowStart), [data.reading_sessions, windowStart]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <CalendarRange className="size-4 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
          Resumen de tu avance
        </h2>
        <div role="radiogroup" aria-label="Periodo" className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                period === p.id
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500/25 dark:text-white dark:shadow-none"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ProgressOverviewKpis metrics={metrics} />
      <EvolutionInflectionChart topics={data.topics} inflections={data.inflection_points} windowStart={windowStart} dark={dark} />
      {analysis && (
        <TopicStrengthsAndGaps
          topics={data.topics}
          analysis={analysis}
          recommendations={data.recommendations}
          onReinforce={onReinforce}
        />
      )}
      <SkillsBreakdownCards mentalMath={mentalMath} reading={reading} dark={dark} />
    </>
  );
}
