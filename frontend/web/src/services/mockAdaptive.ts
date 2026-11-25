import type {
  DifficultyRecommendation,
  GameAttemptRequest,
  GameAttemptResponse,
  UxAdaptationFlags,
} from "../types/adaptive.ts";
import type { GameId } from "../types/games.ts";

/**
 * Servicio mock del motor adaptativo. Cada función mantiene la firma de la versión real:
 *  - fetchDifficulty    → GET  /api/adaptive/difficulty/{game_id} (§2.17)
 *  - submitGameAttempt  → POST /api/adaptive/game-attempts (§2.17)
 * En modo demo no hay recomendación de nivel: cada juego arranca como hasta ahora.
 * Al conectar el backend solo se reemplaza este archivo.
 */
const NO_FLAGS: UxAdaptationFlags = { hide_timers: false, auto_enable_scaffolding: false };
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function fetchDifficulty(gameId: GameId): Promise<DifficultyRecommendation> {
  await delay(30);
  return {
    game_id: gameId,
    domain_id: "MATH",
    theta: 0,
    target_beta: 0.25,
    recommended_level: null,
    ux_adaptation: NO_FLAGS,
  };
}

export async function submitGameAttempt(request: GameAttemptRequest): Promise<GameAttemptResponse> {
  await delay(30);
  return {
    attempt_id: crypto.randomUUID(),
    is_rapid_guess: false,
    score_ratio: request.completed ? 1 : 0,
    beta: 0,
    theta_before: 0,
    ability: {
      domain_id: "MATH",
      theta: 0,
      pisa_scaled_score: 500,
      pisa_level: 3,
      pisa_label: "Nivel 3 (demo)",
      items_completed: 0,
    },
    ux_adaptation: NO_FLAGS,
  };
}
