import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Globe2, TrendingDown, Trophy } from "lucide-react";
import { chartTheme, tooltipStyle } from "../../lib/chartTheme.ts";
import { formatShortDate, toDay } from "../../lib/progressAnalysis.ts";
import type { ClassroomReport, TopicPerformance } from "../../types/teacher.ts";
import { InflectionTimeline, RecommendationsPanel } from "./ClassInsights.tsx";

interface ClassAnalyticsChartsProps {
  report: ClassroomReport;
  dark: boolean;
}

const PANEL =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none";

function Highlight({
  title,
  icon,
  tile,
  topic,
  note,
}: {
  title: string;
  icon: ReactNode;
  tile: string;
  topic: TopicPerformance | undefined;
  note: (t: TopicPerformance) => string;
}) {
  return (
    <article className={`${PANEL} flex flex-col gap-2`}>
      <header className="flex items-center gap-2.5">
        <span className={`grid size-9 place-items-center rounded-lg ${tile}`}>{icon}</span>
        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">{title}</h3>
      </header>
      {topic ? (
        <>
          <p className="text-base font-bold text-slate-900 dark:text-white">{topic.title}</p>
          <p className="text-3xl font-bold text-slate-900 tabular-nums dark:text-white">{topic.avg_score}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{note(topic)}</p>
        </>
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">Sin datos.</p>
      )}
    </article>
  );
}

export function ClassAnalyticsCharts({ report, dark }: ClassAnalyticsChartsProps) {
  const theme = chartTheme(dark);
  const axis = { fill: theme.axis, fontSize: 11 };
  const { reference } = report;
  const hardest = report.hardest_topics[0];
  const easiest = report.easiest_topics[0];

  const barData = useMemo(
    () => [...report.topics].sort((a, b) => a.avg_score - b.avg_score).map((t) => ({ title: t.title, score: t.avg_score })),
    [report.topics],
  );

  const lineRows = useMemo(
    () =>
      (hardest?.trend ?? []).map((p, i) => ({
        date: p.date,
        hardest: p.avg_score,
        easiest: easiest?.trend[i]?.avg_score ?? null,
      })),
    [hardest, easiest],
  );

  const inflections = [...report.inflection_points].sort((a, b) => a.applied_at.localeCompare(b.applied_at));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className={`${PANEL} flex flex-col gap-2`}>
          <header className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300">
              <Globe2 className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">Nivel de referencia del grupo (PISA)</h3>
          </header>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            Nivel {reference.group_level.level}
            <span className="text-base font-medium text-slate-500 dark:text-slate-400"> de {reference.group_level.max_level}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {reference.group_level.label}. Meta del ciclo: nivel {reference.target_level} ({reference.target_min_score} % o más).
            Referencia aproximada, no es una evaluación PISA oficial.
          </p>
        </article>
        <Highlight
          title="Tema con mayor dificultad"
          icon={<TrendingDown className="size-5" strokeWidth={1.75} />}
          tile="bg-orange-100 text-orange-600 dark:bg-amber-900/40 dark:text-amber-400"
          topic={hardest}
          note={(t) => `${t.students_below_threshold} alumnos por debajo de 60 %.`}
        />
        <Highlight
          title="Tema con mejor dominio"
          icon={<Trophy className="size-5" strokeWidth={1.75} />}
          tile="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
          topic={easiest}
          note={(t) => `Solo ${t.students_below_threshold} alumnos por debajo de 60 %.`}
        />
      </div>

      <section aria-label="Rendimiento por tema" className={PANEL}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Rendimiento del grupo por tema</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Promedio por tema frente a la meta PISA nivel {reference.target_level}. Las barras ámbar quedan por debajo.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 8, right: 24, bottom: 0, left: 8 }}>
              <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={axis} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="title" width={150} tick={axis} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle(theme)} formatter={(v) => [`${String(v)}%`, "Promedio"]} cursor={{ fill: theme.grid, opacity: 0.4 }} />
              <ReferenceLine
                x={reference.target_min_score}
                stroke={theme.marker}
                strokeDasharray="4 4"
                label={{ value: `Meta ${reference.target_min_score}%`, position: "top", fill: theme.marker, fontSize: 11 }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {barData.map((d) => (
                  <Cell key={d.title} fill={d.score >= reference.target_min_score ? theme.palette[0] : theme.palette[3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-label="Evolución del grupo" className={PANEL}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Evolución: tema más difícil frente al mejor dominado</h3>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Las líneas punteadas numeradas marcan estrategias aplicadas.</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineRows} margin={{ top: 16, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={axis} tickLine={false} axisLine={{ stroke: theme.grid }} minTickGap={32} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v}%`} tick={axis} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle(theme)} labelFormatter={(l) => formatShortDate(String(l))} formatter={(v) => [`${String(v)}%`, undefined]} />
              <Legend wrapperStyle={{ fontSize: 12, color: theme.axis }} />
              {inflections.map((p, i) => (
                <ReferenceLine
                  key={p.strategy_id}
                  x={toDay(p.applied_at)}
                  stroke={theme.marker}
                  strokeDasharray="4 4"
                  label={{ value: String(i + 1), position: "top", fill: theme.marker, fontSize: 12, fontWeight: 700 }}
                />
              ))}
              <Line dataKey="hardest" name={hardest?.title ?? "Más difícil"} type="monotone" stroke={theme.palette[3]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line dataKey="easiest" name={easiest?.title ?? "Mejor dominio"} type="monotone" stroke={theme.palette[1]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <InflectionTimeline report={report} />
      <RecommendationsPanel report={report} />
    </div>
  );
}
