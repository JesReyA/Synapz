import { AlertTriangle, Lightbulb, Sparkles, UserRound } from "lucide-react";
import { formatShortDate, toDay } from "../../lib/progressAnalysis.ts";
import type { ClassroomReport } from "../../types/teacher.ts";

const PANEL =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none";

export function InflectionTimeline({ report }: { report: ClassroomReport }) {
  const titleOf = (id?: string) => report.topics.find((t) => t.topic_id === id)?.title ?? "Tema";
  const points = [...report.inflection_points].sort((a, b) => a.applied_at.localeCompare(b.applied_at));

  return (
    <section aria-label="Puntos de inflexión" className={PANEL}>
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <Lightbulb className="size-4 text-amber-500 dark:text-amber-400" strokeWidth={1.75} />
        Puntos de inflexión: qué estrategias funcionaron
      </h3>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Cambio del promedio del tema entre la fecha de la estrategia y 14 días después.
      </p>
      {points.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-[#161E30] dark:text-slate-300">
          Aún no hay estrategias con impacto medido.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {points.map((p, i) => (
            <li key={p.strategy_id} className="flex gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-[#161E30]">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-400 text-xs font-bold text-slate-900">
                {i + 1}
              </span>
              <p className="min-w-0 text-sm text-slate-700 dark:text-slate-300">
                <strong className="font-semibold text-slate-900 dark:text-white">{titleOf(p.topic_id)}</strong>{" "}
                <span
                  className={`font-semibold ${p.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                >
                  {p.delta >= 0 ? "subió +" : "bajó "}
                  {p.delta}%
                </span>{" "}
                tras: {p.description.charAt(0).toLowerCase() + p.description.slice(1)}.
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                  {formatShortDate(toDay(p.applied_at))} · de {p.avg_before}% a {p.avg_after}%
                </span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function RecommendationsPanel({ report }: { report: ClassroomReport }) {
  const titleOf = (id: string) => report.topics.find((t) => t.topic_id === id)?.title ?? "Tema";

  return (
    <section aria-label="Recomendaciones" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className={PANEL}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Sparkles className="size-4 text-blue-500 dark:text-blue-300" strokeWidth={1.75} />
          Recomendaciones para el grupo
        </h3>
        {report.recommendations.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">Sin recomendaciones por ahora.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {report.recommendations.map((r) => (
              <li key={`${r.topic_id}-${r.text}`} className="rounded-2xl bg-blue-50 p-3 text-sm text-slate-700 dark:bg-[#161E30] dark:text-slate-300">
                <span className="mb-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                  {titleOf(r.topic_id)}
                </span>
                <p>{r.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={PANEL}>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <AlertTriangle className="size-4 text-orange-500 dark:text-amber-400" strokeWidth={1.75} />
          Alumnos que necesitan apoyo ({report.at_risk_students.length})
        </h3>
        {report.at_risk_students.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">Ningún alumno en riesgo.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {report.at_risk_students.map((s) => (
              <li key={s.student_id} className="rounded-2xl bg-orange-50 p-3 dark:bg-amber-900/20">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <UserRound className="size-4 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
                  {s.full_name}
                </p>
                <ul className="mt-1.5 flex list-disc flex-col gap-0.5 pl-6 text-xs text-slate-700 dark:text-slate-300">
                  {s.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
