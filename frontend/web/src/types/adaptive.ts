// Tipos del motor adaptativo. Reflejan API_CONTRACT.md §2.17 campo por campo.
import type { GameId } from "./games.ts";

export type DomainId = "MATH" | "READ" | "SCIE" | "COMP";
export type DifficultyLevel = "facil" | "medio" | "dificil";

export interface UxAdaptationFlags {
  hide_timers: boolean;
  auto_enable_scaffolding: boolean;
}

export interface DomainAbility {
  domain_id: DomainId;
  theta: number;
  pisa_scaled_score: number;
  pisa_level: number; // 1..6
  pisa_label: string;
  items_completed: number;
}

export interface SocioemotionalIndices {
  anxiety: number;
  self_efficacy: number;
  perseverance: number;
  metacognition: number;
}

/* ---------- POST /api/adaptive/game-attempts ---------- */

export interface GeneralMetrics {
  first_action_latency_ms: number | null;
  total_duration_ms: number;
  idle_time_ms: number;
  tab_blur_count: number;
  hints_requested_count: number;
  restart_click_count: number;
}

export interface TelemetryEvent {
  event_type: "WINDOW_BLUR" | "WINDOW_FOCUS";
  elapsed_ms: number;
}

/** Métricas propias del juego (por ejemplo `error_count` en Sudoku). Todas numéricas. */
export type GameMetrics = Record<string, number>;

export interface GameAttemptRequest {
  game_id: GameId;
  level: DifficultyLevel | null;
  completed: boolean;
  general: GeneralMetrics;
  metrics: GameMetrics;
  events: TelemetryEvent[]; // máx. 200
}

export interface GameAttemptResponse {
  attempt_id: string;
  is_rapid_guess: boolean;
  score_ratio: number; // 0-1
  beta: number;
  theta_before: number;
  ability: DomainAbility;
  ux_adaptation: UxAdaptationFlags;
}

/* ---------- GET /api/adaptive/difficulty/{game_id} ---------- */

export interface DifficultyRecommendation {
  game_id: GameId;
  domain_id: DomainId;
  theta: number;
  target_beta: number;
  recommended_level: DifficultyLevel | null;
  ux_adaptation: UxAdaptationFlags;
}

/* ---------- Solo cliente ---------- */

/** Resultado que cada juego entrega al terminar una partida. */
export interface GameOutcome {
  level: DifficultyLevel | null;
  completed: boolean;
  metrics: GameMetrics;
}
