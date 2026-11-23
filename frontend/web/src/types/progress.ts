/**
 * Tipos de "Progreso". La primera parte refleja API_CONTRACT.md §2.8 y §2.10
 * (`GET /api/progress/me`) campo por campo. La segunda son tipos derivados en el cliente.
 */

/* ---------- Contrato ---------- */

export interface TrendPoint {
  date: string; // YYYY-MM-DD
  score: number; // 0-100
}

/** §2.8. `applied_at` llega como datetime ISO: el cliente usa los 10 primeros caracteres. */
export interface InflectionPoint {
  strategy_id: string;
  applied_at: string;
  description: string; // estrategia aplicada
  avg_before: number;
  avg_after: number;
  delta: number; // avg_after - avg_before, en puntos porcentuales
  topic_id?: string;
}

export type SubjectArea = "math" | "reading" | "science";

export interface ProgressTopic {
  topic_id: string;
  classroom_id: string;
  title: string;
  subject_area: SubjectArea;
  score: number; // 0-100, valor más reciente
  trend: TrendPoint[]; // el primer punto es el diagnóstico inicial
  feyn_mastered: boolean;
}

export interface MentalMathSession {
  id: string;
  date: string; // YYYY-MM-DD
  correct: number;
  total: number;
  avg_response_ms: number;
  max_level: number;
}

export interface ReadingScoreSession {
  id: string;
  date: string; // YYYY-MM-DD
  comprehension_score: number; // 0-100
  audio_score: number | null; // 0-100; null si no grabó voz
}

export interface ReferenceLevel {
  framework: "PISA";
  level: number; // 1..max_level
  max_level: number;
  label: string;
  description: string;
}

export interface TopicRecommendation {
  topic_id: string;
  text: string;
}

export interface StudentProgressResponse {
  student_id: string;
  generated_at: string;
  cycle_start: string; // YYYY-MM-DD
  topics: ProgressTopic[];
  inflection_points: InflectionPoint[];
  mental_math_sessions: MentalMathSession[];
  reading_sessions: ReadingScoreSession[];
  streak: { current_days: number; best_days: number };
  reference_level: ReferenceLevel;
  recommendations: TopicRecommendation[];
}

/* ---------- Derivados en el cliente ---------- */

export type SubjectFilter = "all" | SubjectArea;
export type ProgressPeriod = "week" | "month" | "cycle";
export type TopicStatus = "mastered" | "in_progress" | "needs_support";

export interface GlobalMetrics {
  overall_mastery: number; // 0-100
  baseline_mastery: number; // 0-100, del diagnóstico inicial
  delta_vs_baseline: number;
  feyn_validated_topics: number;
  total_topics: number;
  streak_days: number;
  best_streak_days: number;
  reference_level: ReferenceLevel;
}

export interface TopicAnalysis {
  strongest: ProgressTopic;
  weakest: ProgressTopic;
}

export interface SeriesLine {
  key: string;
  label: string;
  colorIndex: number;
}

export interface EvolutionSeries {
  rows: Record<string, string | number>[];
  lines: SeriesLine[];
}
