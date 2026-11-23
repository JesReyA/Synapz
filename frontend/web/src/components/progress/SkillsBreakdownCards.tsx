import type { ReactNode } from "react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calculator, Mic } from "lucide-react";
import { chartTheme, tooltipStyle } from "../../lib/chartTheme.ts";
import { formatShortDate } from "../../lib/progressAnalysis.ts";
import type { MentalMathSession, ReadingScoreSession } from "../../types/progress.ts";

interface SkillsBreakdownCardsProps {
  mentalMath: MentalMathSession[];
  reading: ReadingScoreSession[];
  dark: boolean;
}

function SkillCard({
  title,
  subtitle,
  icon,
  tile,
  summary,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tile: string;
  summary: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none">
      <header className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tile}`}>{icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </header>
      <div className="text-xs text-slate-600 dark:text-slate-300">{summary}</div>
      {children}
    </article>
  );
}

const pct = (s: MentalMathSession) => Math.round((s.correct / Math.max(1, s.total)) * 100);

function Change({ from, to, unit, lowerIsBetter = false }: { from: string; to: string; unit?: string; lowerIsBetter?: boolean }) {
  return (
    <span>
      {from}
      {unit} → <strong className="font-semibold text-slate-900 dark:text-white">{to}{unit}</strong>
      {lowerIsBetter ? " (menos es mejor)" : ""}
    </span>
  );
}

export function SkillsBreakdownCards({ mentalMath, reading, dark }: SkillsBreakdownCardsProps) {
  const theme = chartTheme(dark);
  const axis = { fill: theme.axis, fontSize: 11 };
  const mmRows = mentalMath.map((s) => ({ date: s.date, accuracy: pct(s), avg_ms: s.avg_response_ms }));
  const rdRows = reading.map((s) => ({
    date: s.date,
    comprehension: s.comprehension_score,
    audio: s.audio_score,
  }));
  const firstMm = mentalMath[0];
  const lastMm = mentalMath[mentalMath.length - 1];
  const firstRd = reading[0];
  const lastRd = reading[reading.length - 1];
  const audioScores = reading.map((s) => s.audio_score).filter((v): v is number => v !== null);
  const bestAudio = audioScores.length ? Math.max(...audioScores) : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <SkillCard
        title="Fluidez en cálculo mental"
        subtitle="Precisión (barras) y tiempo medio por respuesta en ms (línea)"
        icon={<Calculator className="size-5" strokeWidth={1.75} />}
        tile="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
        summary={
          firstMm && lastMm ? (
            <div className="flex flex-col gap-0.5">
              <p>Precisión: <Change from={String(pct(firstMm))} to={String(pct(lastMm))} unit="%" /></p>
              <p>Tiempo medio: <Change from={String(firstMm.avg_response_ms)} to={String(lastMm.avg_response_ms)} unit=" ms" lowerIsBetter /></p>
            </div>
          ) : (
            "Sin sesiones en este periodo."
          )
        }
      >
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mmRows} margin={{ top: 8, right: 0, bottom: 0, left: -18 }}>
              <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={axis} tickLine={false} axisLine={{ stroke: theme.grid }} minTickGap={28} />
              <YAxis yAxisId="acc" domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} tick={axis} tickLine={false} axisLine={false} />
              <YAxis yAxisId="ms" orientation="right" domain={[0, "dataMax + 1000"]} tick={axis} tickLine={false} axisLine={false} width={44} />
              <Tooltip
                contentStyle={tooltipStyle(theme)}
                labelFormatter={(l) => formatShortDate(String(l))}
                formatter={(value, name) => (name === "Tiempo medio" ? [`${String(value)} ms`, name] : [`${String(value)}%`, name])}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: theme.axis }} />
              <Bar yAxisId="acc" dataKey="accuracy" name="Precisión" fill={theme.palette[0]} fillOpacity={0.8} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Line yAxisId="ms" dataKey="avg_ms" name="Tiempo medio" type="monotone" stroke={theme.marker} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </SkillCard>

      <SkillCard
        title="Comprensión lectora y voz"
        subtitle="Comprensión y dicción/fluidez en lectura en voz alta (0-100)"
        icon={<Mic className="size-5" strokeWidth={1.75} />}
        tile="bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"
        summary={
          firstRd && lastRd ? (
            <div className="flex flex-col gap-0.5">
              <p>Comprensión: <Change from={String(firstRd.comprehension_score)} to={String(lastRd.comprehension_score)} /></p>
              <p>Mejor puntaje en voz alta: <strong className="font-semibold text-slate-900 dark:text-white">{bestAudio ?? "sin grabaciones"}</strong></p>
            </div>
          ) : (
            "Sin lecturas en este periodo."
          )
        }
      >
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rdRows} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tick={axis} tickLine={false} axisLine={{ stroke: theme.grid }} minTickGap={28} />
              <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tick={axis} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle(theme)} labelFormatter={(l) => formatShortDate(String(l))} />
              <Legend wrapperStyle={{ fontSize: 12, color: theme.axis }} />
              <Line dataKey="comprehension" name="Comprensión" type="monotone" stroke={theme.palette[2]} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
              <Line dataKey="audio" name="Voz en alto" type="monotone" stroke={theme.palette[1]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SkillCard>
    </div>
  );
}
