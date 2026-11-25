import type { ComponentType } from "react";
import type { GameId } from "../../types/games.ts";
import { AdaptiveGameBoundary } from "./AdaptiveGameBoundary.tsx";

/** Envuelve un juego con la medición adaptativa (recomendación de nivel, telemetría y banderas de UX). */
export function withAdaptiveGame(id: GameId, Game: ComponentType): ComponentType {
  return function AdaptiveGame() {
    return (
      <AdaptiveGameBoundary gameId={id}>
        <Game />
      </AdaptiveGameBoundary>
    );
  };
}
