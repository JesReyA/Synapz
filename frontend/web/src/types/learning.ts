/**
 * Tipos de "Aprender".
 * Reflejan API_CONTRACT.md campo por campo: §2.2 (lecciones), §2.3 (lecturas), §2.4 (audio),
 * §2.13 (tarjetas y enfoque diario) y §2.14 (nivelación). Los tipos de "Derivados" y "Navegador"
 * no viajan por la red.
 */
import type { AdaptLessonResponse, FeynTopicContext, Modality } from "./classes.ts";
import type { SubjectArea } from "./progress.ts";

export type { AdaptLessonResponse, FeynTopicContext, Modality, SubjectArea };

/* ---------- Contrato: lecturas (§2.3) ---------- */

export type ReadingMode = "comprehension" | "cloze";

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[]; // 3 o 4 opciones
  correct_index: number;
}

export interface ClozeBlank {
  id: string;
  position: number; // índice de la palabra en `text`
  answer: string;
  options?: string[];
}

export interface GenerateReadingResponse {
  reading_session_id: string;
  mode: ReadingMode;
  title: string;
  text: string; // en modo cloze, las palabras ocultas aparecen como "____"
  word_count: number;
  questions?: ComprehensionQuestion[]; // solo mode = "comprehension"
  blanks?: ClozeBlank[]; // solo mode = "cloze"
  interests_used: string[];
  grounding: { source_id: string; topic_id: string; quote: string }[];
}

/* ---------- Contrato: evaluación de voz (§2.4) ---------- */

export type AudioErrorType = "omitted" | "mispronounced" | "inserted" | "punctuation";

export interface AudioError {
  type: AudioErrorType;
  word: string;
  expected?: string;
  position: number; // índice de la palabra en el texto
  suggestion: string;
}

export interface EvaluateAudioResponse {
  reading_session_id: string;
  attempt: number;
  read_the_text: boolean;
  score: number; // 0-100 (calificación general de pronunciación y fluidez)
  diction_score: number; // 0-100
  punctuation_score: number; // 0-100
  completeness: number; // 0-1
  errors: AudioError[];
  feedback: string; // consejo breve de Feyn
  best_score: number;
  improved: boolean;
}

/* ---------- Contrato: tarjetas y enfoque diario (§2.13) ---------- */

export type StudyCategory = "lessons" | "reading" | "remedial";
export type StudyBadge = "visual" | "text" | "audio" | "live_voice" | "practice";

export interface StudyCard {
  id: string;
  category: StudyCategory;
  classroom_id: string;
  topic_id: string;
  topic_title: string;
  subject: string; // `classrooms.subject`
  subject_area: SubjectArea;
  title: string;
  description: string;
  badge: StudyBadge;
  progress: number; // 0-100
  minutes: number; // duración estimada
  remedial_set_id: string | null; // solo si category = "remedial"
}

export interface DailyFocus {
  card_id: string; // id de una tarjeta de `cards`
  headline: string;
  reason: string;
  based_on: string[];
}

export interface LearningHomeResponse {
  generated_at: string;
  daily_focus: DailyFocus | null;
  cards: StudyCard[];
}

/* ---------- Contrato: nivelación sin reloj (§2.14) ---------- */

export type RemedialSkill = "addition" | "fractions"; // ampliable

export interface RemedialExercise {
  id: string;
  skill: RemedialSkill;
  prompt: string;
  /** En minúsculas y sin espacios; el decimal usa punto. */
  accepted_answers: string[];
  display_answer: string;
  hint_title: string;
  everyday_hint: string;
  worked_example: string;
}

export interface RemedialSet {
  id: string;
  title: string;
  prerequisite: { classroom_id: string; topic_id: string; title: string };
  exercises: RemedialExercise[];
}

export interface SubmitRemedialResultRequest {
  first_try_correct: number;
  total: number;
}

export interface SubmitRemedialResultResponse {
  set_id: string;
  progress: number;
  best_first_try_pct: number;
}

/* ---------- Derivados en el cliente ---------- */

export type StudyFilter = "all" | StudyCategory;

/** Una explicación por modalidad. En producción cada una es una llamada a `POST /api/lessons/adapt`. */
export interface LessonBundle {
  id: string;
  topic: FeynTopicContext;
  preferred: Modality;
  lessons: Record<Modality, AdaptLessonResponse>;
}

/** Texto de lectura con sus dos modos. En producción son dos llamadas a `POST /api/reading/generate`. */
export interface ReadingBundle {
  id: string;
  topic: FeynTopicContext;
  comprehension: GenerateReadingResponse;
  cloze: GenerateReadingResponse;
}

/* ---------- Navegador (grabación de voz) ---------- */

export type RecorderStatus = "idle" | "requesting" | "recording" | "stopped" | "denied";

export interface RecordingResult {
  blob: Blob | null; // null en modo simulación
  url: string | null;
  duration_sec: number;
  simulated: boolean;
}
