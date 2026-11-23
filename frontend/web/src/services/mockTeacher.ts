/**
 * Servicio mock del docente. Cada función mantiene la firma del acceso real:
 *  - fetchTeacherWorkspace → `GET /api/teacher/overview` (§2.15) + `syllabus_topics` en Supabase (§3)
 *  - fetchClassroomReport  → `GET /api/reports/classroom/{id}` (§2.8)
 *  - createClassroom       → insert en `classrooms` (el trigger SQL genera `invite_code`)
 *  - createTopic           → insert en `syllabus_topics`
 *  - uploadMaterial        → `POST /api/materials/upload` (§2.1)
 */
import { validateMaterialFile } from "../lib/materialFiles.ts";
import { MOCK_CLASSROOMS, MOCK_REPORTS, MOCK_TEACHER_ID, MOCK_TOPICS } from "../data/mockTeacher.ts";
import type {
  ClassroomReport,
  CreateClassroomInput,
  CreateTopicInput,
  TeacherClassroomSummary,
  TeacherOverviewResponse,
  TeacherTopic,
  UploadMaterialResponse,
} from "../types/teacher.ts";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const MIME_BY_EXT = {
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
} as const;

/** Sin 0/O ni 1/I para evitar confusiones al dictar el código. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateInviteCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => CODE_ALPHABET.charAt(b % CODE_ALPHABET.length)).join("");
}

export async function fetchTeacherWorkspace(): Promise<{
  overview: TeacherOverviewResponse;
  topics: Record<string, TeacherTopic[]>;
}> {
  await delay(300);
  return {
    overview: { teacher_id: MOCK_TEACHER_ID, generated_at: new Date().toISOString(), classrooms: MOCK_CLASSROOMS },
    topics: MOCK_TOPICS,
  };
}

export async function fetchClassroomReport(classroomId: string): Promise<ClassroomReport | null> {
  await delay(350);
  return MOCK_REPORTS[classroomId] ?? null;
}

export async function createClassroom(input: CreateClassroomInput): Promise<TeacherClassroomSummary> {
  await delay(400);
  return {
    id: crypto.randomUUID(),
    ...input,
    invite_code: generateInviteCode(),
    student_count: 0,
    overall_avg: null,
    at_risk_count: 0,
    topics_pending_review: 0,
  };
}

export async function createTopic(
  classroomId: string,
  input: CreateTopicInput,
  position: number,
): Promise<TeacherTopic> {
  await delay(250);
  return { id: crypto.randomUUID(), classroom_id: classroomId, ...input, status: "pending", position, material_files: [] };
}

/** El mock simula la extracción de texto. Un nombre con "scan" simula un PDF sin texto. */
export async function uploadMaterial(topicId: string, file: File): Promise<UploadMaterialResponse> {
  const invalid = validateMaterialFile(file);
  if (invalid) throw new Error(invalid);
  await delay(1400);
  const ext = file.name.toLowerCase().endsWith(".pptx") ? "pptx" : "pdf";
  const scanned = file.name.toLowerCase().includes("scan");
  const chars = scanned ? 0 : Math.max(400, Math.round(file.size / 6));
  return {
    material_id: crypto.randomUUID(),
    topic_id: topicId,
    filename: file.name,
    mime: MIME_BY_EXT[ext],
    extracted_chars: chars,
    page_count: Math.max(1, Math.round(file.size / 90_000)),
    preview: scanned ? "" : "Vista previa del texto extraído (simulada).",
    warnings: scanned ? ["No se encontró texto extraíble. Sube una versión con texto seleccionable."] : [],
  };
}
