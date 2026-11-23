import { useEffect, useMemo, useState } from "react";
import {
  applyTap,
  completedDigits as computeCompletedDigits,
  findConflicts,
  generatePuzzle,
} from "../lib/sudoku.ts";
import type { SudokuDifficulty, SudokuDigit, SudokuPuzzle } from "../types/challenges.ts";

export function useSudoku() {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("facil");
  const [puzzle, setPuzzle] = useState<SudokuPuzzle>(() => generatePuzzle("facil"));
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

  function load(nextDifficulty: SudokuDifficulty) {
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
    setValues((prev) => applyTap(prev, puzzle.cells, index, activeDigit));
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
    newGame: () => load(difficulty),
    toggleDigit,
    tapCell,
  };
}
