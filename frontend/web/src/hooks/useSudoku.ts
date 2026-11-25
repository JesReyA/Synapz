import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyTap,
  completedDigits as computeCompletedDigits,
  findConflicts,
  generatePuzzle,
} from "../lib/sudoku.ts";
import type { SudokuDifficulty, SudokuDigit, SudokuPuzzle } from "../types/challenges.ts";
import { useGameSession } from "./useGameSession.ts";
import { useReportOutcome } from "./useReportOutcome.ts";

export function useSudoku() {
  const { recommendedLevel, noteRestart } = useGameSession();
  const initialLevel: SudokuDifficulty = recommendedLevel ?? "facil";
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>(initialLevel);
  const [puzzle, setPuzzle] = useState<SudokuPuzzle>(() => generatePuzzle(initialLevel));
  /** Jugadas que generaron un conflicto nuevo en el tablero. */
  const errorsRef = useRef(0);
  const [values, setValues] = useState<readonly number[]>(puzzle.cells);
  const [activeDigit, setActiveDigit] = useState<SudokuDigit | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const conflicts = useMemo(() => findConflicts(values), [values]);
  const solved = values.every((v) => v !== 0) && conflicts.size === 0;
  const completedDigits = useMemo(
    () => computeCompletedDigits(values, puzzle.solution),
    [values, puzzle.solution],
  );

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [solved, puzzle.id]);

  useReportOutcome(solved, () => ({
    level: difficulty,
    completed: true,
    metrics: { error_count: errorsRef.current, elapsed_s: elapsed },
  }));
  function load(nextDifficulty: SudokuDifficulty) {
    errorsRef.current = 0;
    const next = generatePuzzle(nextDifficulty);
    setDifficulty(nextDifficulty);
    setPuzzle(next);
    setValues(next.cells);
    setActiveDigit(null);
    setElapsed(0);
  }

  function toggleDigit(digit: SudokuDigit) {
    setActiveDigit((current) => (current === digit ? null : digit));
  }

  function tapCell(index: number) {
    if (solved) return;
    const next = applyTap(values, puzzle.cells, index, activeDigit);
    if (findConflicts(next).size > conflicts.size) errorsRef.current += 1;
    setValues(next);
  }

  return {
    difficulty,
    puzzle,
    values,
    activeDigit,
    elapsed,
    conflicts,
    solved,
    completedDigits,
    filled: values.filter((v) => v !== 0).length,
    changeDifficulty: (d: SudokuDifficulty) => load(d),
    newGame: () => {
      noteRestart();
      load(difficulty);
    },
    toggleDigit,
    tapCell,
  };
}
