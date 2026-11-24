import { useCallback, useState } from "react";
import { createMineState, reveal, toggleFlag } from "../lib/games/minesweeper.ts";
import type { MineDifficulty, MineState } from "../types/minesweeper.ts";
import { useGameTimer } from "./useGameTimer.ts";

export interface UseMinesweeper {
  difficulty: MineDifficulty;
  state: MineState;
  flagMode: boolean;
  /** Segundos desde la primera casilla revelada. */
  elapsed: number;
  /** `mines - flags`; puede ser negativo. */
  minesLeft: number;
  /** Partida ganada o perdida: el tablero no acepta acciones. */
  finished: boolean;
  open: (index: number) => void;
  flag: (index: number) => void;
  toggleFlagMode: () => void;
  changeDifficulty: (difficulty: MineDifficulty) => void;
  reset: () => void;
}

/** Estado y acciones del Buscaminas. El cronómetro corre solo mientras `status === "playing"`. */
export function useMinesweeper(): UseMinesweeper {
  const [difficulty, setDifficulty] = useState<MineDifficulty>("facil");
  const [state, setState] = useState<MineState>(() => createMineState("facil"));
  const [flagMode, setFlagMode] = useState(false);
  const timer = useGameTimer(state.status === "playing");
  const resetTimer = timer.reset;

  const open = useCallback(
    (index: number) => {
      // Las funciones del motor devuelven la misma referencia si no cambian nada,
      // así que React no vuelve a renderizar en jugadas inválidas.
      setState((current) => (flagMode ? toggleFlag(current, index) : reveal(current, index)));
    },
    [flagMode],
  );

  const flag = useCallback((index: number) => {
    setState((current) => toggleFlag(current, index));
  }, []);

  const toggleFlagMode = useCallback(() => setFlagMode((value) => !value), []);

  const changeDifficulty = useCallback(
    (next: MineDifficulty) => {
      setDifficulty(next);
      setState(createMineState(next));
      resetTimer();
    },
    [resetTimer],
  );

  const reset = useCallback(() => {
    setState(createMineState(difficulty));
    resetTimer();
  }, [difficulty, resetTimer]);

  return {
    difficulty,
    state,
    flagMode,
    elapsed: timer.elapsed,
    minesLeft: state.mines - state.flags,
    finished: state.status === "won" || state.status === "lost",
    open,
    flag,
    toggleFlagMode,
    changeDifficulty,
    reset,
  };
}
