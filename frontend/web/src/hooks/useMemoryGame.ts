import { useCallback, useEffect, useState } from "react";
import { MEMORY_LEVELS, MISMATCH_DELAY_MS, createMemory, flip, isLocked, resolveMismatch } from "../lib/games/memory.ts";
import type { MemoryDifficulty, MemoryState } from "../types/memory.ts";
import { useGameSession } from "./useGameSession.ts";
import { useGameTimer } from "./useGameTimer.ts";
import { useReportOutcome } from "./useReportOutcome.ts";

export interface MemoryGameApi {
  difficulty: MemoryDifficulty;
  state: MemoryState;
  /** Segundos desde el primer volteo; se detiene al ganar. */
  elapsed: number;
  /** Hay un par fallido a la vista: no se aceptan más volteos. */
  locked: boolean;
  /** Partida ganada. */
  finished: boolean;
  flipCard: (index: number) => void;
  changeDifficulty: (difficulty: MemoryDifficulty) => void;
  reset: () => void;
}

/** Estado, espera del par fallido y cronómetro del Memorama. */
export function useMemoryGame(): MemoryGameApi {
  const { recommendedLevel } = useGameSession();
  const initialLevel: MemoryDifficulty = recommendedLevel ?? "facil";
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>(initialLevel);
  const [state, setState] = useState<MemoryState>(() => createMemory(initialLevel));
  const [started, setStarted] = useState(false);

  const finished = state.status === "won";
  const locked = isLocked(state);
  const timer = useGameTimer(started && !finished);
  const resetTimer = timer.reset;
  useReportOutcome(finished, () => {
    const { rows, cols } = MEMORY_LEVELS[difficulty];
    return {
      level: difficulty,
      completed: true,
      metrics: { attempts: state.attempts, pairs: (rows * cols) / 2, elapsed_s: timer.elapsed },
    };
  });

  // Con un par fallido a la vista, lo oculta tras la espera. El cleanup cancela
  // la espera al reiniciar, cambiar de nivel o desmontar.
  useEffect(() => {
    if (!locked) return;
    const id = setTimeout(() => setState((current) => resolveMismatch(current)), MISMATCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [locked]);

  const flipCard = useCallback(
    (index: number) => {
      const next = flip(state, index);
      if (next === state) return;
      setStarted(true);
      setState(next);
    },
    [state],
  );

  const start = useCallback(
    (level: MemoryDifficulty) => {
      setState(createMemory(level));
      setStarted(false);
      resetTimer();
    },
    [resetTimer],
  );

  const changeDifficulty = useCallback(
    (level: MemoryDifficulty) => {
      setDifficulty(level);
      start(level);
    },
    [start],
  );

  const reset = useCallback(() => start(difficulty), [start, difficulty]);

  return { difficulty, state, elapsed: timer.elapsed, locked, finished, flipCard, changeDifficulty, reset };
}
