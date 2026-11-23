import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Flame, Globe2, Target, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import type { GlobalMetrics } from "../../types/progress.ts";

interface ProgressOverviewKpisProps {
  metrics: GlobalMetrics;
}

function KpiCard({
  title,
  icon: Icon,
  tile,
  children,
}: {
  title: string;
  icon: LucideIcon;
  tile: string;
  children: ReactNode;
}) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none">
      <header className="flex items-center gap-2.5">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tile}`}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-300">{title}</h3>
      </header>
      {children}
    </article>
  );
}

function Bar({ percent, label, tone = "bg-emerald-500 dark:bg-emerald-400" }: { percent: number; label: string; tone?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className="h-2 rounded-full bg-slate-200 dark:bg-[#2A3347]"
    >
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

export function ProgressOverviewKpis({ metrics }: ProgressOverviewKpisProps) {
  const ref = metrics.reference_level;
  const gain = metrics.delta_vs_baseline;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard title="Dominio general" icon={Target} tile="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
        <p className="text-3xl font-bold text-slate-900 tabular-nums dark:text-white">{metrics.overall_mastery}%</p>
        <Bar percent={metrics.overall_mastery} label="Dominio general" />
        <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <TrendingUp className="size-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" strokeWidth={2} />
          <span>
            <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
              {gain >= 0 ? "+" : ""}
              {gain} pts
            </strong>{" "}
            desde tu diagnóstico ({metrics.baseline_mastery}%)
          </span>
        </p>
      </KpiCard>

      <KpiCard
        title="Nivel de referencia (estándar PISA)"
        icon={Globe2}
        tile="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"
      >
        <p className="text-3xl font-bold text-slate-900 dark:text-white">
          Nivel {ref.level}
          <span className="text-base font-medium text-slate-500 dark:text-slate-400"> de {ref.max_level}</span>
        </p>
        <div className="flex gap-1" role="img" aria-label={`Nivel ${ref.level} de ${ref.max_level}`}>
          {Array.from({ length: ref.max_level }, (_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < ref.level ? "bg-violet-500 dark:bg-violet-400" : "bg-slate-200 dark:bg-[#2A3347]"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          <strong className="font-semibold text-slate-700 dark:text-slate-200">{ref.label}.</strong> Referencia
          aproximada, no es una evaluación PISA oficial.
        </p>
      </KpiCard>

      <KpiCard
        title="Temas validados con Feyn"
        icon={BadgeCheck}
        tile="bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300"
      >
        <p className="text-3xl font-bold text-slate-900 tabular-nums dark:text-white">
          {metrics.feyn_validated_topics}
          <span className="text-base font-medium text-slate-500 dark:text-slate-400"> de {metrics.total_topics}</span>
        </p>
        <Bar percent={(metrics.feyn_validated_topics / Math.max(1, metrics.total_topics)) * 100} label="Temas validados con Feyn" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Temas que explicaste a Feyn con tus palabras (Técnica Feynman) y aprobaste.
        </p>
      </KpiCard>

      <KpiCard title="Racha y constancia" icon={Flame} tile="bg-amber-100 text-amber-500 dark:bg-amber-400/15 dark:text-amber-400">
        <p className="text-3xl font-bold text-slate-900 tabular-nums dark:text-white">
          {metrics.streak_days}
          <span className="text-base font-medium text-slate-500 dark:text-slate-400"> días seguidos</span>
        </p>
        <Bar
          percent={(metrics.streak_days / Math.max(1, metrics.best_streak_days)) * 100}
          label="Racha frente a tu mejor racha"
          tone="bg-amber-400"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">Tu mejor racha: {metrics.best_streak_days} días.</p>
      </KpiCard>
    </div>
  );
}
