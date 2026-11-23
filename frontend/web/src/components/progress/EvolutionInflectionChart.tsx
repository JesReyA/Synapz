import { useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Lightbulb } from "lucide-react";
import { chartTheme, tooltipStyle } from "../../lib/chartTheme.ts";
import { SUBJECT_LABEL, buildEvolutionSeries, formatShortDate, toDay } from "../../lib/progressAnalysis.ts";
import type { InflectionPoint, SubjectFilter, ProgressTopic } from "../../types/progress.ts";

interface EvolutionInflectionChartProps {
  topics: ProgressTopic[];
  inflections: InflectionPoint[];
  windowStart: string;
  dark: boolean;
}

const FILTERS: { id: SubjectFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "math", label: SUBJECT_LABEL.math },
  { id: "reading", label: SUBJECT_LABEL.reading },
  { id: "science", label: SUBJECT_LABEL.science },
];

export function EvolutionInflectionChart({ topics, inflections, windowStart, dark }: EvolutionInflectionChartProps) {
  const [filter, setFilter] = useState<SubjectFilter>("all");
  const theme = chartTheme(dark);

  const { rows, lines } = useMemo(() => buildEvolutionSeries(topics, filter, windowStart), [topics, filter, windowStart]);
  const topicById = useMemo(() => new Map(topics.map((t) => [t.topic_id, t])), [topics]);

  const visibleInflections = inflections
    .filter((p) => toDay(p.applied_at) >= windowStart)
    .filter((p) => {
      const t = p.topic_id ? topicById.get(p.topic_id) : undefined;
      return filter === "all" || t?.subject_area === filter;
    })
    .sort((a, b) => a.applied_at.localeCompare(b.applied_at));

  return (
    <section
      aria-label="Evolución por tema"
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Evolución desde tu diagnóstico</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Las líneas punteadas numeradas marcan cuándo cambió tu tendencia.
          </p>
        </div>
        <div role="radiogroup" aria-label="Filtrar por materia" className="inline-flex flex-wrap rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="radio"
              aria-checked={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                filter === f.id
                  ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500/25 dark:text-white dark:shadow-none"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 16, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tick={{ fill: theme.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: theme.grid }}
              minTickGap={32}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: theme.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle(theme)}
              labelFormatter={(label) => formatShortDate(String(label))}
              formatter={(value) => [`${String(value)}%`, undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: theme.axis }} />
            {visibleInflections.map((p, i) => (
              <ReferenceLine
                key={p.strategy_id}
                x={toDay(p.applied_at)}
                stroke={theme.marker}
                strokeDasharray="4 4"
                label={{ value: String(i + 1), position: "top", fill: theme.marker, fontSize: 12, fontWeight: 700 }}
              />
            ))}
            {lines.map((l) => (
              <Line
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.label}
                stroke={theme.palette[l.colorIndex % theme.palette.length]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Lightbulb className="size-4 text-amber-500 dark:text-amber-400" strokeWidth={1.75} />
          Puntos de inflexión: qué te funcionó
        </h3>
        {visibleInflections.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-[#161E30] dark:text-slate-300">
            No hubo puntos de inflexión en este periodo y materia.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {visibleInflections.map((p, i) => {
              const t = p.topic_id ? topicById.get(p.topic_id) : undefined;
              const up = p.delta >= 0;
              return (
                <li key={p.strategy_id} className="flex gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#161E30]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
                    {i + 1}
                  </span>
                  <p className="min-w-0 text-sm text-slate-700 dark:text-slate-300">
                    <strong className="font-semibold text-slate-900 dark:text-white">{t?.title ?? "Tema"}</strong>{" "}
                    <span
                      className={`font-semibold ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                    >
                      {up ? "subió +" : "bajó "}
                      {p.delta}%
                    </span>{" "}
                    tras esta estrategia: {p.description.charAt(0).toLowerCase() + p.description.slice(1)}.
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      {formatShortDate(toDay(p.applied_at))} · de {p.avg_before}% a {p.avg_after}%
                    </span>
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
