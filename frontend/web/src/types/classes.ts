/**
 * Tipos de "Mis clases". Reflejan API_CONTRACT.md (snake_case) para conectar luego con
 * Supabase y FastAPI sin transformaciones.
 */

export type Modality = "visual" | "reading" | "auditory";

export type SubjectAccent = "blue" | "violet" | "teal";

/** `cycle`: tema del ciclo actual. `prerequisite`: tema previo de nivelación (rezago). */
export type TopicKind = "cycle" | "prerequisite";

/** Estado que fija el profesor. */
export type TopicStatus = "pending" | "taught" | "review";

/** Avance del alumno en el tema. */
export type StudentTopicState = "not_started" | "in_progress" | "mastered";

/** profiles.interests */
export interface InterestProfile {
  likes: string[];
  hobbies: string[];
  daily_activities: string[];
  aspirations: string[];
  preferred_modality: Modality;
  improvement_areas: string[];
}

export interface TopicMaterial {
  id: string;
  filename: string;
  kind: "pdf" | "pptx" | "notes";
  pages: number;
}

/** syllabus_topics (vista del alumno) */
export interface SyllabusTopic {
  id: string;
  classroom_id: string;
  title: string;
  kind: TopicKind;
  status: TopicStatus;
  scheduled_date: string; // YYYY-MM-DD
  position: number;
  student_state: StudentTopicState;
  materials: TopicMaterial[];
}

/** classrooms + classroom_members + progreso del alumno */
export interface ClassroomSummary {
  id: string;
  name: string;
  subject: string;
  grade_group: string;
  teacher_name: string;
  accent: SubjectAccent;
  progress: number; // 0-100
  diagnostic_pending: boolean;
  topics: SyllabusTopic[];
}

export type JoinClassResult =
  | { ok: true; classroom: ClassroomSummary }
  | { ok: false; message: string };

/* ---- POST /api/lessons/adapt (API_CONTRACT.md §2.2) ---- */

export interface Grounding {
  source_id: string;
  topic_id: string;
  quote: string;
}

export interface AdaptLessonRequest {
  classroom_id: string;
  topic_id: string;
  modality: Modality;
  previous_modality?: Modality;
}

export interface LessonBlock {
  heading: string;
  body: string;
  visual_description?: string;
}

export interface AdaptLessonResponse {
  topic_id: string;
  modality: Modality;
  title: string;
  blocks: LessonBlock[];
  narration_script?: string;
  mnemonic_song?: string;
  interests_used: string[];
  grounding: Grounding[];
}

export interface ApiError {
  code: "NO_TEACHER_MATERIAL" | "AI_INVALID_OUTPUT" | "AI_UNAVAILABLE" | "NOT_FOUND" | "INTERNAL";
  message: string;
}

/** Tema que se precarga en el chat de Feyn. */
export interface FeynTopicContext {
  classroom_id: string;
  topic_id: string;
  /** Se envía como 	opic_title. */
  title: string;
  /** Texto del material del profesor. Se envía como 	eacher_material (API_CONTRACT.md §2.5.1). */
  teacher_material?: string;
}
