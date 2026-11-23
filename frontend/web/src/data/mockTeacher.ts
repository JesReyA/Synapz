/**
 * Datos de ejemplo del docente. Las series son semanales, desde el diagnóstico (10 feb 2025).
 * Los puntos de inflexión se calculan a partir de esas series para que los números sean coherentes.
 */
import { shiftDays } from "../lib/progressAnalysis.ts";
import type {
  AtRiskStudent,
  ClassroomReport,
  InflectionPoint,
  TeacherClassroomSummary,
  TeacherTopic,
  TopicPerformance,
  TopicRecommendation,
} from "../types/teacher.ts";

export const MOCK_TEACHER_ID = "t-laura";
export const MOCK_MATH_CLASSROOM_ID = "c-mate";
export const MOCK_READING_CLASSROOM_ID = "c-lect";

const START = "2025-02-10";
const WEEKS = 12;


/** `anchors`: [semana, promedio]. Interpolación lineal entre anclajes. */
function weeklyTrend(anchors: [number, number][]): { date: string; avg_score: number }[] {
  return Array.from({ length: WEEKS + 1 }, (_, week) => {
    let i = 0;
    while (i < anchors.length - 2 && week > (anchors[i + 1]?.[0] ?? 0)) i++;
    const [w0, s0] = anchors[i] ?? [0, 0];
    const [w1, s1] = anchors[i + 1] ?? [w0, s0];
    const t = w1 === w0 ? 0 : (week - w0) / (w1 - w0);
    return { date: shiftDays(START, week * 7), avg_score: Math.round(s0 + (s1 - s0) * t) };
  });
}

function topic(topic_id: string, title: string, anchors: [number, number][], below: number): TopicPerformance {
  const trend = weeklyTrend(anchors);
  return { topic_id, title, avg_score: trend[trend.length - 1]?.avg_score ?? 0, students_below_threshold: below, trend };
}

function inflection(
  all: TopicPerformance[],
  strategy_id: string,
  topic_id: string,
  week: number,
  description: string,
): InflectionPoint {
  const trend = all.find((t) => t.topic_id === topic_id)?.trend ?? [];
  const before = trend[week]?.avg_score ?? 0;
  const after = trend[week + 2]?.avg_score ?? 0;
  return {
    strategy_id,
    topic_id,
    applied_at: `${shiftDays(START, week * 7)}T00:00:00Z`,
    description,
    avg_before: before,
    avg_after: after,
    delta: after - before,
  };
}

function build(
  classroom_id: string,
  student_count: number,
  topics: TopicPerformance[],
  extra: {
    at_risk: AtRiskStudent[];
    recommendations: TopicRecommendation[];
    inflections: [string, string, number, string][];
    integrity_flags: number;
  },
): ClassroomReport {
  const overall = Math.round(topics.reduce((s, t) => s + t.avg_score, 0) / Math.max(1, topics.length));
  const byScore = [...topics].sort((a, b) => a.avg_score - b.avg_score);
  return {
    classroom_id,
    generated_at: "2025-05-11T12:00:00Z",
    student_count,
    overall_avg: overall,
    topics,
    hardest_topics: byScore.slice(0, 3),
    easiest_topics: [...byScore].reverse().slice(0, 3),
    at_risk_students: extra.at_risk,
    recommendations: extra.recommendations,
    inflection_points: extra.inflections.map(([id, topicId, week, text]) => inflection(topics, id, topicId, week, text)),
    integrity_flags: extra.integrity_flags,
    reference: {
      framework: "PISA",
      group_level: {
        framework: "PISA",
        level: 4,
        max_level: 6,
        label: "Competencia sólida",
        description: "El grupo resuelve problemas de varios pasos con apoyo en representaciones.",
      },
      target_level: 4,
      target_min_score: 60,
    },
  };
}

const MATH_TOPICS: TopicPerformance[] = [
  topic("t-mate-1", "Fracciones y operaciones", [[0, 46], [5, 49], [7, 67], [12, 68]], 6),
  topic("t-mate-2", "Números decimales", [[0, 50], [12, 52]], 11),
  topic("t-mate-3", "Perímetro y área", [[0, 60], [12, 74]], 4),
  topic("t-prev-1", "Suma con llevadas", [[0, 70], [12, 86]], 2),
  topic("t-prev-2", "Fracciones como partes de un todo", [[0, 55], [8, 58], [10, 69], [12, 71]], 5),
];

const READING_TOPICS: TopicPerformance[] = [
  topic("t-lect-1", "Inferencias en textos", [[0, 50], [9, 56], [11, 68], [12, 66]], 9),
  topic("t-lect-2", "Vocabulario en contexto", [[0, 65], [12, 78]], 3),
  topic("t-lect-3", "Ideas principales", [[0, 72], [12, 83]], 2),
];

export const MOCK_REPORTS: Record<string, ClassroomReport> = {
  [MOCK_MATH_CLASSROOM_ID]: build(MOCK_MATH_CLASSROOM_ID, 28, MATH_TOPICS, {
    at_risk: [
      { student_id: "s4", full_name: "Mateo López", reasons: ["Menos de 60 % en Números decimales", "Rezago en Fracciones como partes de un todo"] },
      { student_id: "s5", full_name: "Sofía Paredes", reasons: ["Cálculo mental lento: más de 8 s por suma", "Sin actividad en los últimos 7 días"] },
      { student_id: "s6", full_name: "Iker Domínguez", reasons: ["Diagnóstico invalidado por cambios de pestaña"] },
    ],
    recommendations: [
      { topic_id: "t-mate-2", text: "Repasa décimos y centésimos con una barra de 10 partes antes de comparar decimales. 11 alumnos están por debajo de 60 %." },
      { topic_id: "t-mate-1", text: "Mantén las explicaciones visuales con ejemplos de videojuegos: el grupo subió tras ese cambio." },
      { topic_id: "t-prev-2", text: "Asigna la nivelación «Fracciones base» a los 5 alumnos con rezago antes de la siguiente unidad." },
    ],
    inflections: [
      ["s1", "t-mate-1", 5, "Explicación visual con mecánicas de Minecraft en la clase de fracciones"],
      ["s2", "t-prev-2", 8, "Nivelación en casa con ejercicios sin reloj"],
    ],
    integrity_flags: 2,
  }),
  [MOCK_READING_CLASSROOM_ID]: build(MOCK_READING_CLASSROOM_ID, 26, READING_TOPICS, {
    at_risk: [
      { student_id: "s7", full_name: "Renata Gil", reasons: ["Menos de 60 % en Inferencias en textos", "Lectura en voz alta con puntaje bajo"] },
    ],
    recommendations: [
      { topic_id: "t-lect-1", text: "Practica inferencias con textos cortos sobre intereses del grupo y pide justificar con una frase del texto." },
    ],
    inflections: [["s3", "t-lect-1", 9, "Lectura en voz alta con retroalimentación de Feyn dos veces por semana"]],
    integrity_flags: 0,
  }),
};

/* ---------- Aulas y temario ---------- */

export const MOCK_CLASSROOMS: TeacherClassroomSummary[] = [
  {
    id: MOCK_MATH_CLASSROOM_ID,
    name: "Matemáticas 6.º B",
    subject: "Matemáticas",
    subject_area: "math",
    grade_group: "6.º B",
    invite_code: "MATE6B",
    student_count: 28,
    overall_avg: MOCK_REPORTS[MOCK_MATH_CLASSROOM_ID]?.overall_avg ?? null,
    at_risk_count: 3,
    topics_pending_review: 1,
  },
  {
    id: MOCK_READING_CLASSROOM_ID,
    name: "Comprensión lectora 6.º B",
    subject: "Comprensión lectora",
    subject_area: "reading",
    grade_group: "6.º B",
    invite_code: "LECT6B",
    student_count: 26,
    overall_avg: MOCK_REPORTS[MOCK_READING_CLASSROOM_ID]?.overall_avg ?? null,
    at_risk_count: 1,
    topics_pending_review: 0,
  },
];

const pdf = "application/pdf";
const pptx = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

export const MOCK_TOPICS: Record<string, TeacherTopic[]> = {
  [MOCK_MATH_CLASSROOM_ID]: [
    { id: "t-mate-1", classroom_id: MOCK_MATH_CLASSROOM_ID, title: "Fracciones y operaciones", kind: "cycle", scheduled_date: "2025-03-10", status: "taught", position: 1, material_files: [
      { id: "m-1", storage_path: "materials/c-mate/fracciones.pptx", filename: "Fracciones_presentacion.pptx", mime: pptx, chars: 18420 },
      { id: "m-2", storage_path: "materials/c-mate/apuntes.pdf", filename: "Apuntes_fracciones.pdf", mime: pdf, chars: 6210 },
    ] },
    { id: "t-mate-2", classroom_id: MOCK_MATH_CLASSROOM_ID, title: "Números decimales", kind: "cycle", scheduled_date: "2025-03-24", status: "review", position: 2, material_files: [
      { id: "m-3", storage_path: "materials/c-mate/decimales.pdf", filename: "Decimales.pdf", mime: pdf, chars: 9340 },
    ] },
    { id: "t-mate-3", classroom_id: MOCK_MATH_CLASSROOM_ID, title: "Perímetro y área", kind: "cycle", scheduled_date: "2025-04-14", status: "taught", position: 3, material_files: [
      { id: "m-4", storage_path: "materials/c-mate/area.pptx", filename: "Perimetro_area.pptx", mime: pptx, chars: 12010 },
    ] },
    { id: "t-mate-4", classroom_id: MOCK_MATH_CLASSROOM_ID, title: "Proporcionalidad", kind: "cycle", scheduled_date: "2025-06-02", status: "pending", position: 4, material_files: [] },
    { id: "t-prev-1", classroom_id: MOCK_MATH_CLASSROOM_ID, title: "Suma con llevadas", kind: "prerequisite", scheduled_date: "2025-02-10", status: "taught", position: 5, material_files: [
      { id: "m-5", storage_path: "materials/c-mate/suma.pdf", filename: "Suma_llevadas.pdf", mime: pdf, chars: 3120 },
    ] },
    { id: "t-prev-2", classroom_id: MOCK_MATH_CLASSROOM_ID, title: "Fracciones como partes de un todo", kind: "prerequisite", scheduled_date: "2025-02-17", status: "taught", position: 6, material_files: [
      { id: "m-6", storage_path: "materials/c-mate/partes.pdf", filename: "Partes_de_un_todo.pdf", mime: pdf, chars: 4870 },
    ] },
  ],
  [MOCK_READING_CLASSROOM_ID]: [
    { id: "t-lect-1", classroom_id: MOCK_READING_CLASSROOM_ID, title: "Inferencias en textos", kind: "cycle", scheduled_date: "2025-03-17", status: "taught", position: 1, material_files: [
      { id: "m-7", storage_path: "materials/c-lect/inferencias.pdf", filename: "Inferencias.pdf", mime: pdf, chars: 7600 },
    ] },
    { id: "t-lect-2", classroom_id: MOCK_READING_CLASSROOM_ID, title: "Vocabulario en contexto", kind: "cycle", scheduled_date: "2025-04-07", status: "taught", position: 2, material_files: [
      { id: "m-8", storage_path: "materials/c-lect/vocabulario.pptx", filename: "Vocabulario.pptx", mime: pptx, chars: 5400 },
    ] },
    { id: "t-lect-3", classroom_id: MOCK_READING_CLASSROOM_ID, title: "Ideas principales", kind: "cycle", scheduled_date: "2025-05-19", status: "pending", position: 3, material_files: [] },
  ],
};
