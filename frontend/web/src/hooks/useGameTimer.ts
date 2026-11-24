import { useCallback, useEffect, useState } from "react";
import { formatTime } from "../lib/sudoku.ts";

export { formatTime };

/** Cronómetro en segundos: avanza cada 1 s mientras `running` es verdadero. */
export function useGameTimer(running: boolean): { elapsed: number; reset: () => void } {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = useCallback(() => setElapsed(0), []);

  return { elapsed, reset };
}
