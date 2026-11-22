/**
 * Datos y llamadas simuladas. Cada función mantiene la firma del contrato real
 * para sustituirla por Supabase / FastAPI sin tocar los componentes.
 */
import type {
  AdaptLessonRequest,
  AdaptLessonResponse,
  ApiError,
  ClassroomSummary,
  InterestProfile,
  JoinClassResult,
  LessonBlock,
  Modality,
  SyllabusTopic,
} from "../types/classes.ts";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const MOCK_PROFILE: InterestProfile = {
  likes: ["Minecraft", "Videojuegos", "Música"],
  hobbies: ["Dibujar", "Fútbol"],
  daily_activities: ["Jugar en línea con amigos", "Escuchar música camino a la escuela"],
  aspirations: ["Diseñar videojuegos"],
  preferred_modality: "visual",
  improvement_areas: ["Fracciones", "Comprender textos largos"],
};

export const MOCK_CLASSES: ClassroomSummary[] = [
  {
    id: "c-mate",
    name: "Matemáticas",
    subject: "Matemáticas",
    grade_group: "6.º B",
    teacher_name: "Prof. Laura Méndez",
    accent: "blue",
    progress: 72,
    diagnostic_pending: false,
    topics: [
      {
        id: "t-mate-1",
        classroom_id: "c-mate",
        title: "Fracciones y operaciones",
        kind: "cycle",
        status: "taught",
        scheduled_date: "2025-03-10",
        position: 1,
        student_state: "in_progress",
        materials: [
          { id: "m-1", filename: "Fracciones_presentacion.pptx", kind: "pptx", pages: 18 },
          { id: "m-2", filename: "Apuntes_fracciones.pdf", kind: "pdf", pages: 6 },
        ],
      },
      {
        id: "t-mate-2",
        classroom_id: "c-mate",
        title: "Números decimales",
        kind: "cycle",
        status: "pending",
        scheduled_date: "2025-03-24",
        position: 2,
        student_state: "not_started",
        materials: [{ id: "m-3", filename: "Decimales.pdf", kind: "pdf", pages: 9 }],
      },
      {
        id: "t-mate-3",
        classroom_id: "c-mate",
        title: "Proporcionalidad",
        kind: "cycle",
        status: "pending",
        scheduled_date: "2025-04-07",
        position: 3,
        student_state: "not_started",
        materials: [],
      },
      {
        id: "t-mate-p1",
        classroom_id: "c-mate",
        title: "Multiplicación y división",
        kind: "prerequisite",
        status: "review",
        scheduled_date: "2025-03-03",
        position: 4,
        student_state: "in_progress",
        materials: [{ id: "m-4", filename: "Repaso_multiplicar.pdf", kind: "pdf", pages: 4 }],
      },
      {
        id: "t-mate-p2",
        classroom_id: "c-mate",
        title: "Sumas y restas con reagrupación",
        kind: "prerequisite",
        status: "taught",
        scheduled_date: "2025-02-24",
        position: 5,
        student_state: "mastered",
        materials: [{ id: "m-5", filename: "Reagrupacion.pptx", kind: "pptx", pages: 10 }],
      },
    ],
  },
  {
    id: "c-lectura",
    name: "Comprensión lectora",
    subject: "Español",
    grade_group: "6.º B",
    teacher_name: "Prof. Andrés Ruiz",
    accent: "violet",
    progress: 61,
    diagnostic_pending: true,
    topics: [
      {
        id: "t-lec-1",
        classroom_id: "c-lectura",
        title: "Idea principal e ideas secundarias",
        kind: "cycle",
        status: "taught",
        scheduled_date: "2025-03-12",
        position: 1,
        student_state: "in_progress",
        materials: [{ id: "m-6", filename: "Idea_principal.pdf", kind: "pdf", pages: 7 }],
      },
      {
        id: "t-lec-2",
        classroom_id: "c-lectura",
        title: "Inferencias en textos narrativos",
        kind: "cycle",
        status: "pending",
        scheduled_date: "2025-03-26",
        position: 2,
        student_state: "not_started",
        materials: [{ id: "m-7", filename: "Inferencias.pptx", kind: "pptx", pages: 14 }],
      },
      {
        id: "t-lec-p1",
        classroom_id: "c-lectura",
        title: "Signos de puntuación",
        kind: "prerequisite",
        status: "review",
        scheduled_date: "2025-03-05",
        position: 3,
        student_state: "not_started",
        materials: [{ id: "m-8", filename: "Puntuacion.pdf", kind: "pdf", pages: 5 }],
      },
    ],
  },
  {
    id: "c-ciencias",
    name: "Ciencias",
    subject: "Ciencias naturales",
    grade_group: "6.º B",
    teacher_name: "Prof. Sofía Herrera",
    accent: "teal",
    progress: 80,
    diagnostic_pending: false,
    topics: [
      {
        id: "t-cie-1",
        classroom_id: "c-ciencias",
        title: "Estados de la materia",
        kind: "cycle",
        status: "taught",
        scheduled_date: "2025-03-11",
        position: 1,
        student_state: "mastered",
        materials: [{ id: "m-9", filename: "Estados_materia.pptx", kind: "pptx", pages: 16 }],
      },
      {
        id: "t-cie-2",
        classroom_id: "c-ciencias",
        title: "Cambios de estado",
        kind: "cycle",
        status: "pending",
        scheduled_date: "2025-03-25",
        position: 2,
        student_state: "not_started",
        materials: [{ id: "m-10", filename: "Cambios_estado.pdf", kind: "pdf", pages: 8 }],
      },
      {
        id: "t-cie-p1",
        classroom_id: "c-ciencias",
        title: "Medición de temperatura",
        kind: "prerequisite",
        status: "taught",
        scheduled_date: "2025-03-01",
        position: 3,
        student_state: "in_progress",
        materials: [{ id: "m-11", filename: "Temperatura.pdf", kind: "pdf", pages: 3 }],
      },
    ],
  },
];

/** Aulas a las que se puede entrar con un código de invitación (demo: HIS123). */
const JOINABLE: Record<string, ClassroomSummary> = {
  HIS123: {
    id: "c-historia",
    name: "Historia",
    subject: "Historia",
    grade_group: "6.º B",
    teacher_name: "Prof. Carlos Beltrán",
    accent: "violet",
    progress: 0,
    diagnostic_pending: true,
    topics: [
      {
        id: "t-his-1",
        classroom_id: "c-historia",
        title: "Civilizaciones mesoamericanas",
        kind: "cycle",
        status: "pending",
        scheduled_date: "2025-04-02",
        position: 1,
        student_state: "not_started",
        materials: [{ id: "m-12", filename: "Mesoamerica.pptx", kind: "pptx", pages: 20 }],
      },
    ],
  },
};

export async function mockJoinClass(code: string, alreadyJoined: string[]): Promise<JoinClassResult> {
  await delay(500);
  const classroom = JOINABLE[code.trim().toUpperCase()];
  if (!classroom) return { ok: false, message: "El código no existe. Revisa que esté bien escrito." };
  if (alreadyJoined.includes(classroom.id)) return { ok: false, message: "Ya perteneces a esta aula." };
  return { ok: true, classroom };
}

export async function mockSaveProfile(profile: InterestProfile): Promise<InterestProfile> {
  await delay(300);
  return profile;
}

/* ---- Lecciones adaptadas ---- */

export class AdaptLessonError extends Error {
  readonly apiError: ApiError;
  constructor(apiError: ApiError) {
    super(apiError.message);
    this.apiError = apiError;
  }
}

function findTopic(classes: ClassroomSummary[], req: AdaptLessonRequest): SyllabusTopic | undefined {
  return classes.flatMap((c) => c.topics).find((t) => t.id === req.topic_id);
}

function buildBlocks(title: string, interest: string, modality: Modality): LessonBlock[] {
  const minecraft = interest.toLowerCase() === "minecraft";
  const example = minecraft
    ? "Un zombi tiene 20 puntos de vida, o sea 10 corazones. Si una espada le quita 3 de cada 4 partes de su vida, le quita 3/4 de 20 = 15 puntos."
    : `Piensa en ${interest}: si repartes una tarea en 4 partes iguales y ya hiciste 3, llevas 3/4 del total.`;
  const blocks: LessonBlock[] = [
    {
      heading: `¿Qué es "${title}"?`,
      body: "Una fracción reparte un entero en partes iguales. El número de abajo (denominador) dice en cuántas partes se dividió. El de arriba (numerador) dice cuántas partes tomas.",
      ...(modality === "visual"
        ? { visual_description: "Un círculo dividido en 4 sectores iguales con 3 coloreados: 3/4." }
        : {}),
    },
    {
      heading: minecraft ? "Con mobs de Minecraft" : `Con ejemplos de ${interest}`,
      body: example,
      ...(modality === "visual"
        ? { visual_description: "Una barra de vida de 10 corazones: 7,5 corazones llenos y 2,5 vacíos." }
        : {}),
    },
    {
      heading: "Para sumar fracciones",
      body: "Si el denominador es el mismo, se suman los numeradores y el denominador queda igual: 1/4 + 2/4 = 3/4.",
    },
  ];
  return blocks;
}

export async function mockAdaptLesson(
  req: AdaptLessonRequest,
  classes: ClassroomSummary[],
  profile: InterestProfile | null,
): Promise<AdaptLessonResponse> {
    await delay(700);
    const topic = findTopic(classes, req);
    if (!topic) throw new AdaptLessonError({ code: "NOT_FOUND", message: "No encontramos el tema." });
    if (topic.materials.length === 0 || topic.materials.every((m) => m.pages === 0)) {
      throw new AdaptLessonError({
        code: "NO_TEACHER_MATERIAL",
        message: "Tu profesor aún no ha subido material de este tema. Feyn no puede explicarlo todavía.",
      });
    }
    const interest = profile?.likes[0] ?? "tus actividades favoritas";
    const first = topic.materials[0];
    return {
      topic_id: topic.id,
      modality: req.modality,
      title: topic.title,
      blocks: buildBlocks(topic.title, interest, req.modality),
      ...(req.modality === "auditory"
        ? {
            narration_script: `Escucha con atención. Imagina que ${interest} te pide dividir un todo en partes iguales. Cada parte es una fracción del total.`,
            mnemonic_song: "Arriba cuento, abajo parto; cuántas tomo y en cuántas reparto.",
          }
        : {}),
      interests_used: profile ? profile.likes.slice(0, 2) : [],
      grounding: [
        { source_id: first.id, topic_id: topic.id, quote: `${first.filename}, pp. 1-${Math.min(first.pages, 3)}` },
      ],
  };
}

