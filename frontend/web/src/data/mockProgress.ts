/**
 * Datos de ejemplo de "Progreso". Las series se generan cada 2 días desde el diagnóstico inicial
 * (10 feb 2025) hasta hoy (11 may 2025) con interpolación entre puntos clave.
 */
import { shiftDays } from "../lib/progressAnalysis.ts";
import type {
  InflectionPoint,
  MentalMathSession,
  SubjectArea,
  ReadingScoreSession,
  StudentProgressResponse,
  ProgressTopic,
  TrendPoint,
} from "../types/progress.ts";

export const MOCK_CYCLE_START = "2025-02-10";
export const MOCK_TODAY = "2025-05-11";
const TOTAL_DAYS = 90;
const CLASSROOM_ID = "c-mate";

const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)));

/** `anchors`: [día desde el diagnóstico, puntaje]. Fuera de los anclajes se añade un ruido pequeño. */
function buildTrend(anchors: [number, number][], seed: number): TrendPoint[] {
  const anchorDays = new Set(anchors.map(([d]) => d));
  const points: TrendPoint[] = [];
  for (let day = 0; day <= TOTAL_DAYS; day += 2) {
    let i = 0;
    while (i < anchors.length - 2 && day > (anchors[i + 1]?.[0] ?? 0)) i++;
    const [d0, s0] = anchors[i] ?? [0, 0];
    const [d1, s1] = anchors[i + 1] ?? [d0, s0];
    const t = d1 === d0 ? 0 : (day - d0) / (d1 - d0);
    const noise = anchorDays.has(day) ? 0 : Math.sin(day * 1.3 + seed) * 1.4;
    points.push({ date: shiftDays(MOCK_CYCLE_START, day), score: clamp(s0 + (s1 - s0) * t + noise) });
  }
  return points;
}

function topic(
  topic_id: string,
  title: string,
  subject_area: SubjectArea,
  anchors: [number, number][],
  seed: number,
  feyn_mastered: boolean,
): ProgressTopic {
  const trend = buildTrend(anchors, seed);
  return { topic_id, classroom_id: CLASSROOM_ID, title, subject_area, trend, score: trend[trend.length - 1]?.score ?? 0, feyn_mastered };
}

const TOPICS: ProgressTopic[] = [
  topic("t-mate-1", "Fracciones y operaciones", "math", [[0, 42], [32, 48], [46, 72], [90, 78]], 1, false),
  topic("t-mate-2", "Números decimales", "math", [[0, 50], [60, 52], [90, 58]], 2, false),
  topic("t-prev-1", "Suma con llevadas", "math", [[0, 60], [46, 74], [90, 88]], 3, true),
  topic("t-lect-1", "Inferencias en textos", "reading", [[0, 50], [60, 55], [74, 68], [90, 72]], 4, false),
  topic("t-lect-2", "Vocabulario en contexto", "reading", [[0, 65], [90, 84]], 5, true),
  topic("t-cien-1", "Estados de la materia", "science", [[0, 70], [90, 91]], 6, true),
  topic("t-cien-2", "Cadenas alimenticias", "science", [[0, 62], [46, 66], [60, 78], [90, 80]], 7, true),
];

function scoreAt(topicId: string, date: string): number {
  return TOPICS.find((t) => t.topic_id === topicId)?.trend.find((p) => p.date === date)?.score ?? 0;
}

/** `avg_before` es el puntaje el día de la estrategia y `avg_after`, 14 días después. */
function inflection(strategy_id: string, topic_id: string, applied_at: string, description: string): InflectionPoint {
  const avg_before = scoreAt(topic_id, applied_at);
  const avg_after = scoreAt(topic_id, shiftDays(applied_at, 14));
  return { strategy_id, topic_id, applied_at: `${applied_at}T00:00:00Z`, description, avg_before, avg_after, delta: avg_after - avg_before };
}

const INFLECTIONS: InflectionPoint[] = [
  inflection("s1", "t-mate-1", "2025-03-14", "Cambié a explicación visual con mecánicas de Minecraft (cofres y bloques)"),
  inflection("s2", "t-cien-2", "2025-03-28", "Usé la canción mnemotécnica en formato auditivo"),
  inflection("s3", "t-lect-1", "2025-04-11", "Leí en voz alta con retroalimentación de Feyn dos veces por semana"),
];

const MENTAL: MentalMathSession[] = Array.from({ length: 31 }, (_, k) => ({
  id: `mm-${k + 1}`,
  date: shiftDays(MOCK_CYCLE_START, k * 3),
  total: 10,
  correct: Math.min(10, Math.max(3, Math.round(5 + 4.4 * (k / 30) + Math.sin(k * 1.7) * 0.9))),
  avg_response_ms: Math.round(8200 - 4100 * (k / 30) + Math.sin(k * 2.3) * 350),
  max_level: 1 + Math.floor(k / 8),
}));

const READING: ReadingScoreSession[] = Array.from({ length: 13 }, (_, k) => ({
  id: `rd-${k + 1}`,
  date: shiftDays(MOCK_CYCLE_START, k * 7),
  comprehension_score: clamp(52 + 34 * (k / 12) + Math.sin(k * 1.9) * 4),
  audio_score: k < 2 ? null : clamp(58 + 26 * ((k - 2) / 10) + Math.sin(k * 2.7) * 3),
}));

export const MOCK_PROGRESS: StudentProgressResponse = {
  student_id: "me",
  generated_at: `${MOCK_TODAY}T12:00:00Z`,
  cycle_start: MOCK_CYCLE_START,
  topics: TOPICS,
  inflection_points: INFLECTIONS,
  mental_math_sessions: MENTAL,
  reading_sessions: READING,
  streak: { current_days: 5, best_days: 12 },
  reference_level: {
    framework: "PISA",
    level: 4,
    max_level: 6,
    label: "Competencia sólida",
    description: "Resuelves problemas con varios pasos y comparas fracciones. Siguiente meta: interpretar y justificar tus resultados.",
  },
  recommendations: [
    { topic_id: "t-mate-2", text: "Repasa los décimos con la barra de vida de tus videojuegos antes de pasar a los centésimos." },
    { topic_id: "t-mate-2", text: "Haz la nivelación «Fracciones base»: los decimales dependen de entender partes de un todo." },
    { topic_id: "t-mate-2", text: "Explícale a Feyn cómo comparar 0.7 y 0.45. Si lo logras, el tema queda validado." },
    { topic_id: "t-cien-1", text: "Ya dominas este tema. Reta a un amigo con una pregunta sobre cambios de estado para fijarlo." },
  ],
};
