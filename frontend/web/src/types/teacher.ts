/**
 * Tipos de la sección Profesor. Reflejan API_CONTRACT.md campo por campo:
 * §2.1 (material), §2.8 (reporte del aula), §2.15 (resumen docente), §2.16 (puntos extra)
 * y las tablas `classrooms` y `syllabus_topics` (§1). Los tipos "Derivados" no viajan por la red.
 */
import type { TopicKind, TopicStatus } from "./classes.ts";
import type { InflectionPoint, ReferenceLevel, SubjectArea, TopicRecommendation } from "./progress.ts";

export type { InflectionPoint, ReferenceLevel, SubjectArea, TopicKind, TopicRecommendation, TopicStatus };

/* ---------- Contrato: reporte del aula (§2.8) ---------- */

export interface TopicPerformance {
  topic_id: string;
  title: string;
  avg_score: number; // 0-100
  students_below_threshold: number;
  trend: { date: string; avg_score: number }[];
}

export interface AtRiskStudent {
  student_id: string;
  full_name: string;
  reasons: string[];
}

export interface GroupReference {
  framework: "PISA";
  group_level: ReferenceLevel;
  target_level: number;
  target_min_score: number;
}

export interface ClassroomReport {
  classroom_id: string;
  generated_at: string;
  student_count: number;
  overall_avg: number;
  topics: TopicPerformance[];
  hardest_topics: TopicPerformance[]; // top 3 con menor promedio
  easiest_topics: TopicPerformance[]; // top 3 con mayor promedio
  at_risk_students: AtRiskStudent[];
  recommendations: TopicRecommendation[];
  inflection_points: InflectionPoint[];
  integrity_flags: number;
  reference: GroupReference;
}

/* ---------- Contrato: resumen docente (§2.15) ---------- */

export interface TeacherClassroomSummary {
  id: string;
  name: string;
  subject: string;
  subject_area: SubjectArea;
  grade_group: string;
  invite_code: string; // 6 caracteres
  student_count: number;
  overall_avg: number | null;
  at_risk_count: number;
  topics_pending_review: number;
}

export interface TeacherOverviewResponse {
  teacher_id: string;
  generated_at: string;
  classrooms: TeacherClassroomSummary[];
}

/* ---------- Contrato: puntos extra (§2.16) ---------- */

export interface GrantBonusPointsRequest {
  student_id: string;
  points: number; // entre 1 y 50
  reason: string; // máximo 140 caracteres
}

export interface GrantBonusPointsResponse {
  student_id: string;
  bonus_points: number;
  total_points: number;
}

/* ---------- Contrato: material (§2.1) y `syllabus_topics` ---------- */

export interface UploadMaterialResponse {
  material_id: string;
  topic_id: string;
  filename: string;
  mime: "application/pdf" | "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  extracted_chars: number;
  page_count: number;
  preview: string; // primeros 300 caracteres
  warnings: string[];
}

/** Elemento de `syllabus_topics.material_files`. */
export interface MaterialFile {
  id: string;
  storage_path: string;
  filename: string;
  mime: string;
  chars: number;
}

/** Fila de `syllabus_topics` (sin `material_text`, que solo lee el backend). */
export interface TeacherTopic {
  id: string;
  classroom_id: string;
  title: string;
  kind: TopicKind;
  scheduled_date: string; // YYYY-MM-DD
  status: TopicStatus;
  position: number;
  material_files: MaterialFile[];
}

/* ---------- Datos que el docente escribe ---------- */

/** Campos de `classrooms` que el docente captura al crear un aula. El código lo genera la base de datos. */
export interface CreateClassroomInput {
  name: string;
  subject: string;
  subject_area: SubjectArea;
  grade_group: string;
}

export interface CreateTopicInput {
  title: string;
  kind: TopicKind;
  scheduled_date: string;
}

/* ---------- Derivados en el cliente ---------- */

export interface UploadItem {
  key: string;
  filename: string;
  status: "uploading" | "done" | "error";
  chars?: number;
  warnings?: string[];
  message?: string;
}
