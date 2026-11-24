import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { BOX, SIZE } from "../../lib/sudoku.ts";
import { DIGIT_STYLES, SELECTED_CELL } from "../../lib/sudokuPalette.ts";
import type { SudokuDigit, SudokuPuzzle } from "../../types/challenges.ts";

interface SudokuBoardProps {
  puzzle: SudokuPuzzle;
  values: readonly number[];
  activeDigit: SudokuDigit | null;
  /** Números con sus 9 casillas correctas: al activarlos se pintan con su color. */
  completedDigits: ReadonlySet<SudokuDigit>;
  conflicts: ReadonlySet<number>;
  /** Partida resuelta: cada casilla se pinta con el color de su número. */
  solved: boolean;
  /** Partida resuelta: los toques se ignoran. */
  disabled: boolean;
  onCellTap: (index: number) => void;
}

function isDigit(value: number): value is SudokuDigit {
  return Number.isInteger(value) && value >= 1 && value <= 9;
}

export function SudokuBoard({
  puzzle,
  values,
  activeDigit,
  completedDigits,
  conflicts,
  solved,
  disabled,
  onCellTap,
}: SudokuBoardProps) {
  const [focusIndex, setFocusIndex] = useState(0);
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function moveFocus(from: number, dRow: number, dCol: number) {
    const row = Math.floor(from / SIZE) + dRow;
    const col = (from % SIZE) + dCol;
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return;
    const next = row * SIZE + col;
    setFocusIndex(next);
    cellRefs.current[next]?.focus();
  }

  function handleKey(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (e.key === "ArrowUp") moveFocus(index, -1, 0);
    else if (e.key === "ArrowDown") moveFocus(index, 1, 0);
    else if (e.key === "ArrowLeft") moveFocus(index, 0, -1);
    else if (e.key === "ArrowRight") moveFocus(index, 0, 1);
    else return;
    e.preventDefault();
  }

  return (
    <div
      role="grid"
      aria-label={`Tablero de sudoku ${SIZE} por ${SIZE}`}
      className="grid w-full max-w-[22rem] grid-cols-9 overflow-hidden rounded-xl border-2 border-slate-700 sm:max-w-md dark:border-slate-400"
    >
      {values.map((value, i) => {
        const r = Math.floor(i / SIZE);
        const c = i % SIZE;
        const given = puzzle.cells[i] !== 0;
        const wrong = conflicts.has(i);
        const highlighted = activeDigit !== null && value === activeDigit && isDigit(value);

        // Partida resuelta: cada casilla lleva el color de su número, sin gris y sin
        // depender del número activo. Si no, blanco por defecto. Solo el número activo
        // se resalta: gris si falta algún lugar, color propio cuando está completo.
        const look =
          solved && isDigit(value)
            ? DIGIT_STYLES[value].cell
            : highlighted
              ? completedDigits.has(value)
                ? DIGIT_STYLES[value].cell
                : SELECTED_CELL
              : given
                ? "bg-white text-slate-900 dark:bg-[#161E30] dark:text-white"
                : "bg-white text-blue-700 dark:bg-[#161E30] dark:text-blue-300";
        const weight = given ? "font-bold" : "font-normal";
        const conflictMark = wrong
          ? "outline-2 -outline-offset-2 outline-dashed outline-slate-900 dark:outline-white"
          : "focus-visible:outline-none";
        const borderRight =
          c === SIZE - 1
            ? ""
            : (c + 1) % BOX === 0
              ? "border-r-2 border-r-slate-700 dark:border-r-slate-400"
              : "border-r border-r-slate-200 dark:border-r-[#2A3347]";
        const borderBottom =
          r === SIZE - 1
            ? ""
            : (r + 1) % BOX === 0
              ? "border-b-2 border-b-slate-700 dark:border-b-slate-400"
              : "border-b border-b-slate-200 dark:border-b-[#2A3347]";

        const label = `Fila ${r + 1}, columna ${c + 1}: ${value === 0 ? "vacía" : value}${given ? ", pista" : ""}${wrong ? ", en conflicto" : ""}`;

        return (
          <button
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            type="button"
            role="gridcell"
            tabIndex={i === focusIndex ? 0 : -1}
            aria-label={label}
            aria-disabled={disabled || undefined}
            onFocus={() => setFocusIndex(i)}
            onClick={() => {
              setFocusIndex(i);
              if (!disabled) onCellTap(i);
            }}
            onKeyDown={(e) => handleKey(e, i)}
            className={`grid aspect-square min-w-0 place-items-center text-base tabular-nums transition-colors duration-100 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset sm:text-lg dark:focus-visible:ring-blue-300 ${look} ${weight} ${conflictMark} ${borderRight} ${borderBottom}`}
          >
            {value === 0 ? "" : value}
          </button>
        );
      })}
    </div>
  );
}
