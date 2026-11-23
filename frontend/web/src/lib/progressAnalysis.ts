import type {
  EvolutionSeries,
  GlobalMetrics,
  ProgressPeriod,
  SubjectArea,
  StudentProgressResponse,
  SubjectFilter,
  TopicAnalysis,
  ProgressTopic,
  TopicStatus,
  TrendPoint,
} from "../types/progress.ts";

export const SUBJECT_LABEL: Record<SubjectArea, string> = {
  math: "Matemáticas",
  reading: "Comprensión lectora",
  science: "Ciencias",
};

/** Índice de color en la paleta de la gráfica. */
const SUBJECT_COLOR: Record<SubjectArea, number> = { math: 0, science: 1, reading: 2 };

const SUBJECT_ORDER: readonly SubjectArea[] = ["math", "reading", "science"];

export const MASTERED_FROM = 80;
export const IN_PROGRESS_FROM = 60;

export function topicStatus(score: number): TopicStatus {
  if (score >= MASTERED_FROM) return "mastered";
  if (score >= IN_PROGRESS_FROM) return "in_progress";
  return "needs_support";
}

export function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function windowStartFor(period: ProgressPeriod, today: string, cycleStart: string): string {
  if (period === "week") return shiftDays(today, -6);
  if (period === "month") return shiftDays(today, -29);
  return cycleStart;
}

/** Los datetime ISO del contrato se reducen a su fecha (YYYY-MM-DD). */
export function toDay(iso: string): string {
  return iso.slice(0, 10);
}

export function formatShortDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;
}

export function computeGlobalMetrics(data: StudentProgressResponse): GlobalMetrics {
  const overall = Math.round(average(data.topics.map((t) => t.score)));
  const baseline = Math.round(average(data.topics.map((t) => t.trend[0]?.score ?? t.score)));
  return {
    overall_mastery: overall,
    baseline_mastery: baseline,
    delta_vs_baseline: overall - baseline,
    feyn_validated_topics: data.topics.filter((t) => t.feyn_mastered).length,
    total_topics: data.topics.length,
    streak_days: data.streak.current_days,
    best_streak_days: data.streak.best_days,
    reference_level: data.reference_level,
  };
}

export function analyzeTopics(topics: ProgressTopic[]): TopicAnalysis | null {
  const sorted = [...topics].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  return strongest && weakest ? { strongest, weakest } : null;
}

function scoreByDate(trend: TrendPoint[]): Map<string, number> {
  return new Map(trend.map((p) => [p.date, p.score]));
}

/** Con "Todas": una línea por materia (promedio). Con una materia: una línea por tema. */
export function buildEvolutionSeries(
  topics: ProgressTopic[],
  filter: SubjectFilter,
  windowStart: string,
): EvolutionSeries {
  const dates = (topics[0]?.trend ?? []).map((p) => p.date).filter((d) => d >= windowStart);
  const lookup = new Map(topics.map((t) => [t.topic_id, scoreByDate(t.trend)]));

  if (filter === "all") {
    const subjects = SUBJECT_ORDER.filter((s) => topics.some((t) => t.subject_area === s));
    const rows = dates.map((date) => {
      const row: Record<string, string | number> = { date };
      for (const s of subjects) {
        const scores = topics
          .filter((t) => t.subject_area === s)
          .map((t) => lookup.get(t.topic_id)?.get(date))
          .filter((v): v is number => v !== undefined);
        row[s] = Math.round(average(scores));
      }
      return row;
    });
    const lines = subjects.map((s) => ({ key: s, label: SUBJECT_LABEL[s], colorIndex: SUBJECT_COLOR[s] }));
    return { rows, lines };
  }

  const scoped = topics.filter((t) => t.subject_area === filter);
  const rows = dates.map((date) => {
    const row: Record<string, string | number> = { date };
    for (const t of scoped) row[t.topic_id] = lookup.get(t.topic_id)?.get(date) ?? 0;
    return row;
  });
  const lines = scoped.map((t, i) => ({ key: t.topic_id, label: t.title, colorIndex: i }));
  return { rows, lines };
}
