import type { FeynChatRequest, FeynChatResult } from "../types/feyn.ts";
import { API_URL } from "./api.ts";

const TIMEOUT_MS = 30_000;

export type FeynApiErrorCode = "CONFIG" | "NETWORK" | "TIMEOUT" | "SERVER" | "INVALID_RESPONSE" | "ABORTED";

/** Error con un mensaje apto para mostrar al alumno. */
export class FeynApiError extends Error {
  readonly code: FeynApiErrorCode;
  constructor(code: FeynApiErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Valida la respuesta del backend. `mastery_score` llega como texto y se convierte a número de 0 a 100. */
function parseResponse(data: unknown): FeynChatResult {
  if (!isRecord(data) || typeof data.reply !== "string" || !Array.isArray(data.missing_concepts)) {
    throw new FeynApiError("INVALID_RESPONSE", "Feyn respondió algo que no pude entender. Intenta de nuevo.");
  }
  const raw = data.mastery_score;
  const score = typeof raw === "number" ? raw : typeof raw === "string" ? Number.parseFloat(raw) : Number.NaN;
  if (!Number.isFinite(score)) {
    throw new FeynApiError("INVALID_RESPONSE", "Feyn respondió algo que no pude entender. Intenta de nuevo.");
  }
  return {
    reply: data.reply,
    mastery_score: Math.min(100, Math.max(0, Math.round(score))),
    missing_concepts: data.missing_concepts.filter((c): c is string => typeof c === "string" && c.trim() !== ""),
  };
}

/** `POST /api/feyn/chat` (API_CONTRACT.md §2.5.1). */
export async function sendExplanationToFeyn(request: FeynChatRequest, signal?: AbortSignal): Promise<FeynChatResult> {
  if (!API_URL) {
    throw new FeynApiError("CONFIG", "Falta configurar VITE_API_BASE_URL para hablar con Feyn.");
  }

  if (signal?.aborted) throw new FeynApiError("ABORTED", "Solicitud cancelada.");

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}/api/feyn/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new FeynApiError(
        "SERVER",
        response.status >= 500
          ? "Feyn no está disponible en este momento. Intenta de nuevo en unos segundos."
          : "No pude enviar tu explicación. Revísala e intenta de nuevo.",
      );
    }
    return parseResponse(await response.json());
  } catch (err) {
    if (err instanceof FeynApiError) throw err;
    if (signal?.aborted) throw new FeynApiError("ABORTED", "Solicitud cancelada.");
    if (controller.signal.aborted) throw new FeynApiError("TIMEOUT", "Feyn tardó demasiado en responder. Intenta de nuevo.");
    throw new FeynApiError("NETWORK", "No pude conectar con el servidor de Feyn. Revisa tu conexión.");
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}
