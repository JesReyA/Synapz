import { useCallback, useEffect, useState } from "react";
import {
  createTetris,
  dropIntervalMs,
  hardDrop,
  moveHorizontal,
  rotate,
  softDrop,
  tick,
  togglePause as togglePauseState,
} from "../lib/games/tetris.ts";
import type { TetrisState } from "../types/tetris.ts";

export interface TetrisApi {
  state: TetrisState;
  left: () => void;
  right: () => void;
  rotateCw: () => void;
  rotateCcw: () => void;
  soft: () => void;
  hard: () => void;
  togglePause: () => void;
  reset: () => void;
}

/**
 * Estado del Tetris y gravedad. El intervalo solo existe mientras la partida
 * está en curso y se reprograma al subir de nivel, al reanudar y al reiniciar.
 * El teclado lo gestiona el componente, en su contenedor.
 */
export function useTetris(): TetrisApi {
  const [state, setState] = useState<TetrisState>(createTetris);
  // Cambia en cada reinicio para que la gravedad empiece con un intervalo nuevo.
  const [session, setSession] = useState(0);

  const { status, level } = state;
  useEffect(() => {
    if (status !== "playing") return undefined;
    const id = setInterval(() => {
      setState(tick);
    }, dropIntervalMs(level));
    return () => {
      clearInterval(id);
    };
  }, [status, level, session]);

  const left = useCallback(() => {
    setState((prev) => moveHorizontal(prev, -1));
  }, []);
  const right = useCallback(() => {
    setState((prev) => moveHorizontal(prev, 1));
  }, []);
  const rotateCw = useCallback(() => {
    setState((prev) => rotate(prev, 1));
  }, []);
  const rotateCcw = useCallback(() => {
    setState((prev) => rotate(prev, -1));
  }, []);
  const soft = useCallback(() => {
    setState(softDrop);
  }, []);
  const hard = useCallback(() => {
    setState(hardDrop);
  }, []);
  const togglePause = useCallback(() => {
    setState(togglePauseState);
  }, []);
  const reset = useCallback(() => {
    setState(createTetris());
    setSession((n) => n + 1);
  }, []);

  return { state, left, right, rotateCw, rotateCcw, soft, hard, togglePause, reset };
}
