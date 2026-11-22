import { useEffect, useMemo, useState } from "react";
import { findConflicts, generatePuzzle } from "../lib/sudoku.ts";
import type { SudokuDifficulty, SudokuPuzzle, SudokuSize } from "../types/challenges.ts";

export function useSudoku() {
  const [size, setSize] = useState<SudokuSize>(6);
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>("facil");
  const [puzzle, setPuzzle] = useState<SudokuPuzzle>(() => generatePuzzle(6, "facil"));
  const [values, setValues] = useState<number[]>(puzzle.cells);
  const [selected, setSelected] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const conflicts = useMemo(() => findConflicts(values, puzzle), [values, puzzle]);
  const solved = values.every((v) => v !== 0) && conflicts.size === 0;

  useEffect(() => {
    if (solved) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [solved, puzzle.id]);

  function load(nextSize: SudokuSize, nextDifficulty: SudokuDifficulty) {
    const next = generatePuzzle(nextSize, nextDifficulty);
    setSize(nextSize);
    setDifficulty(nextDifficulty);
    setPuzzle(next);
    setValues(next.cells);
    setSelected(null);
    setElapsed(0);
  }

  function setCell(value: number) {
    if (selected === null || solved || puzzle.cells[selected] !== 0) return;
    if (value < 0 || value > puzzle.size) return;
    setValues((prev) => prev.map((v, i) => (i === selected ? value : v)));
  }

  function moveSelection(dRow: number, dCol: number) {
    const n = puzzle.size;
    const from = selected ?? 0;
    const row = Math.min(n - 1, Math.max(0, Math.floor(from / n) + dRow));
    const col = Math.min(n - 1, Math.max(0, (from % n) + dCol));
    setSelected(row * n + col);
  }

  return {
    size,
    difficulty,
    puzzle,
    values,
    selected,
    elapsed,
    conflicts,
    solved,
    filled: values.filter((v) => v !== 0).length,
    changeSize: (s: SudokuSize) => load(s, difficulty),
    changeDifficulty: (d: SudokuDifficulty) => load(size, d),
    restart: () => load(size, difficulty),
    select: setSelected,
    setCell,
    moveSelection,
  };
}
