import { useContext } from "react";
import { GameSessionContext } from "../context/gameSessionContextValue.ts";
import type { GameSessionValue } from "../context/gameSessionContextValue.ts";

/** Sesión adaptativa del juego abierto (recomendación, banderas de UX y reporte de resultado). */
export function useGameSession(): GameSessionValue {
  return useContext(GameSessionContext);
}
