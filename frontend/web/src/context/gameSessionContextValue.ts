import { createContext } from "react";
import type { DifficultyLevel, GameOutcome } from "../types/adaptive.ts";

export interface GameSessionValue {
  /** Nivel que el motor recomienda al abrir el juego; `null` si no hay recomendación. */
  recommendedLevel: DifficultyLevel | null;
  /** Ansiedad alta: se ocultan los relojes que no son parte de la mecánica. */
  hideTimers: boolean;
  /** Autoeficacia baja: los juegos con pistas deben ofrecerlas sin penalización. */
  autoScaffolding: boolean;
  /** El alumno pulsó "Nueva partida". */
  noteRestart: () => void;
  /** El alumno pidió una pista. */
  noteHint: () => void;
  /** Envía el resultado de una partida terminada. */
  report: (outcome: GameOutcome) => void;
}

/** Valor por defecto: fuera de `AdaptiveGameBoundary` los juegos funcionan igual, sin medir. */
export const DEFAULT_GAME_SESSION: GameSessionValue = {
  recommendedLevel: null,
  hideTimers: false,
  autoScaffolding: false,
  noteRestart: () => undefined,
  noteHint: () => undefined,
  report: () => undefined,
};

export const GameSessionContext = createContext<GameSessionValue>(DEFAULT_GAME_SESSION);
