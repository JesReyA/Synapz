import type { KeyboardEvent } from "react";
import type { SudokuPuzzle } from "../../types/challenges.ts";

interface SudokuBoardProps {
  puzzle: SudokuPuzzle;
  values: number[];
  selected: number | null;
  conflicts: Set<number>;
  onSelect: (index: number) => void;
  onInput: (value: number) => void;
  onMove: (dRow: number, dCol: number) => void;
}

const COLS: Record<number, string> = { 6: "grid-cols-6", 9: "grid-cols-9" };
const CELL: Record<number, string> = { 6: "size-11 text-xl sm:size-12", 9: "size-8 text-base sm:size-10 sm:text-lg" };

export function SudokuBoard({ puzzle, values, selected, conflicts, onSelect, onInput, onMove }: SudokuBoardProps) {
  const n = puzzle.size;
  const selRow = selected === null ? -1 : Math.floor(selected / n);
  const selCol = selected === null ? -1 : selected % n;

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (/^[1-9]$/.test(e.key)) {
      onInput(Number(e.key));
    } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
      onInput(0);
    } else if (e.key === "ArrowUp") onMove(-1, 0);
    else if (e.key === "ArrowDown") onMove(1, 0);
    else if (e.key === "ArrowLeft") onMove(0, -1);
    else if (e.key === "ArrowRight") onMove(0, 1);
    else return;
    e.preventDefault();
  }

  return (
    <div
      role="grid"
      aria-label={`Tablero de sudoku ${n} por ${n}`}
      tabIndex={0}
      onKeyDown={handleKey}
      className={`grid w-fit ${COLS[n]} overflow-hidden rounded-xl border-2 border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-400 dark:focus-visible:ring-offset-[#131A29]`}
    >
      {values.map((value, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        const given = puzzle.cells[i] !== 0;
        const isSelected = selected === i;
        const related = !isSelected && selected !== null && (r === selRow || c === selCol);
        const wrong = conflicts.has(i);
        const thickRight = (c + 1) % puzzle.boxCols === 0 && c !== n - 1;
        const thickBottom = (r + 1) % puzzle.boxRows === 0 && r !== n - 1;

        const bg = isSelected
          ? "bg-blue-200 dark:bg-blue-500/40"
          : wrong
            ? "bg-rose-100 dark:bg-rose-500/20"
            : related
              ? "bg-blue-50 dark:bg-[#1B2438]"
              : "bg-white dark:bg-[#161E30]";
        const text = wrong
          ? "text-rose-600 dark:text-rose-400"
          : given
            ? "font-bold text-slate-900 dark:text-white"
            : "font-semibold text-blue-600 dark:text-blue-300";

        return (
          <button
            key={i}
            type="button"
            role="gridcell"
            tabIndex={-1}
            aria-selected={isSelected}
            aria-label={`Fila ${r + 1}, columna ${c + 1}${given ? ", pista" : ""}${wrong ? ", error" : ""}: ${value === 0 ? "vacía" : value}`}
            onClick={() => onSelect(i)}
            className={`${CELL[n]} grid place-items-center border-slate-200 tabular-nums transition-colors duration-100 dark:border-[#2A3347] ${bg} ${text} ${
              thickRight ? "border-r-2 border-r-slate-700 dark:border-r-slate-400" : "border-r"
            } ${thickBottom ? "border-b-2 border-b-slate-700 dark:border-b-slate-400" : "border-b"}`}
          >
            {value === 0 ? "" : value}
          </button>
        );
      })}
    </div>
  );
}
