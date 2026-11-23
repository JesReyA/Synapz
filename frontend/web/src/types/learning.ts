/**
 * Tipos de "Aprender".
 * Los tipos de §2.2 (lecciones), §2.3 (lecturas) y §2.4 (audio) reflejan API_CONTRACT.md campo por campo.
 * Los marcados "solo cliente" (tarjetas, enfoque diario, nivelación) no tienen endpoint todavía.
 */
import type { AdaptLessonResponse, FeynTopicContext, Modality, SubjectAccent } from "./classes.ts";

export type { AdaptLessonResponse, FeynTopicContext, Modality };

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

/* ---------- Solo cliente: paquetes mock por lección y lectura ---------- */

/** Una explicación por modalidad. En producción cada una es una llamada a `POST /api/lessons/adapt`. */
export interface LessonBundle {
  id: string;
  topic: FeynTopicContext;
  preferred: Modality;
  lessons: Record<Modality, AdaptLessonResponse>;
}

/** Texto de lectura con sus dos modos de ejercicio. */
export interface ReadingBundle {
  id: string;
  topic: FeynTopicContext;
  comprehension: GenerateReadingResponse;
  cloze: GenerateReadingResponse;
}

/* ---------- Solo cliente: nivelación sin reloj ---------- */

export type RemedialSkill = "addition" | "fractions";

export interface RemedialExercise {
  id: string;
  skill: RemedialSkill;
  prompt: string;
  /** Respuestas válidas ya normalizadas (minúsculas, sin espacios). */
  accepted_answers: string[];
  display_answer: string;
  hint_title: string;
  everyday_hint: string;
  worked_example: string;
}

export interface RemedialSet {
  id: string;
  title: string;
  /** Tema previo (prerrequisito) que se refuerza. */
  prerequisite: FeynTopicContext;
  exercises: RemedialExercise[];
}

/* ---------- Solo cliente: tarjetas de estudio y enfoque diario ---------- */

export type StudyCategory = "lessons" | "reading" | "remedial";
export type StudyFilter = "all" | StudyCategory;
export type ModalityBadge = "visual" | "audio" | "live_voice" | "practice";

export interface StudyCard {
  id: string;
  category: StudyCategory;
  /** id del `LessonBundle`, `ReadingBundle` o `RemedialSet` según `category`. */
  ref_id: string;
  subject: string;
  accent: SubjectAccent;
  title: string;
  description: string;
  badge: ModalityBadge;
  progress: number; // 0-100
  minutes: number;
  topic: FeynTopicContext;
}

export interface DailyFocus {
  card_id: string;
  headline: string;
  reason: string;
  based_on: string[];
}

/* ---------- Grabación de voz (navegador) ---------- */

export type RecorderStatus = "idle" | "requesting" | "recording" | "stopped" | "denied";

export interface RecordingResult {
  blob: Blob | null; // null en modo simulación
  url: string | null;
  duration_sec: number;
  simulated: boolean;
}
