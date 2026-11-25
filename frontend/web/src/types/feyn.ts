/**
 * Tipos del chat con Feyn. `FeynChatRequest` y `FeynChatResponse` reflejan API_CONTRACT.md §2.5.1
 * (versión implementada hoy en el backend). `FeynChatResult` y `ChatMessage` son del cliente.
 */

export interface FeynChatRequest {
  topic_title: string;
  teacher_material: string;
  student_explanation: string;
}

export interface FeynChatResponse {
  reply: string;
  mastery_score: string; // entero de 0 a 100 como texto
  missing_concepts: string[];
}

/** Respuesta ya validada. `mastery_score` es un número entre 0 y 100. */
export interface FeynChatResult {
  reply: string;
  mastery_score: number;
  missing_concepts: string[];
}

export interface ChatMessage {
  id: number;
  role: "student" | "feyn";
  text: string;
}
