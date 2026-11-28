import { useEffect, useEffectEvent, useRef } from "react";
import type { GameOutcome } from "../types/adaptive.ts";
import { useGameSession } from "./useGameSession.ts";

/**
 * Envía el resultado una sola vez cuando `done` pasa a verdadero. Vuelve a armarse
 * cuando `done` regresa a falso (nueva partida). `build` se lee en el momento del envío.
 */
export function useReportOutcome(done: boolean, build: () => GameOutcome): void {
  const { report } = useGameSession();
  const sentRef = useRef(false);
  const send = useEffectEvent(() => report(build()));

  useEffect(() => {
    if (!done) {
      sentRef.current = false;
      return;
    }
    if (sentRef.current) return;
    sentRef.current = true;
    send();
  }, [done]);
}
