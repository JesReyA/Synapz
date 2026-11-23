import type { SudokuDigit } from "../types/challenges.ts";

/** Clases de Tailwind de un número del Sudoku. */
export interface DigitStyle {
  /** Casilla del tablero cuando el número está activo. */
  cell: string;
  /** Botón de la paleta en reposo. */
  button: string;
  /** Botón de la paleta cuando el número está activo. */
  buttonActive: string;
}

// Las clases se escriben completas a propósito: Tailwind v4 solo genera las que
// aparecen como texto literal en el código, así que no se arman con plantillas.
export const DIGIT_STYLES: Record<SudokuDigit, DigitStyle> = {
  1: {
    cell: "bg-blue-200 text-slate-900 dark:bg-blue-400/40 dark:text-white",
    button:
      "bg-blue-100 border border-blue-300 text-slate-900 dark:bg-blue-400/20 dark:border-blue-400/50 dark:text-white",
    buttonActive:
      "bg-blue-200 ring-2 ring-blue-500 scale-110 text-slate-900 dark:bg-blue-400/40 dark:ring-blue-300 dark:text-white",
  },
  2: {
    cell: "bg-orange-200 text-slate-900 dark:bg-orange-400/40 dark:text-white",
    button:
      "bg-orange-100 border border-orange-300 text-slate-900 dark:bg-orange-400/20 dark:border-orange-400/50 dark:text-white",
    buttonActive:
      "bg-orange-200 ring-2 ring-orange-500 scale-110 text-slate-900 dark:bg-orange-400/40 dark:ring-orange-300 dark:text-white",
  },
  3: {
    cell: "bg-emerald-200 text-slate-900 dark:bg-emerald-400/40 dark:text-white",
    button:
      "bg-emerald-100 border border-emerald-300 text-slate-900 dark:bg-emerald-400/20 dark:border-emerald-400/50 dark:text-white",
    buttonActive:
      "bg-emerald-200 ring-2 ring-emerald-500 scale-110 text-slate-900 dark:bg-emerald-400/40 dark:ring-emerald-300 dark:text-white",
  },
  4: {
    cell: "bg-violet-200 text-slate-900 dark:bg-violet-400/40 dark:text-white",
    button:
      "bg-violet-100 border border-violet-300 text-slate-900 dark:bg-violet-400/20 dark:border-violet-400/50 dark:text-white",
    buttonActive:
      "bg-violet-200 ring-2 ring-violet-500 scale-110 text-slate-900 dark:bg-violet-400/40 dark:ring-violet-300 dark:text-white",
  },
  5: {
    cell: "bg-yellow-200 text-slate-900 dark:bg-yellow-400/40 dark:text-white",
    button:
      "bg-yellow-100 border border-yellow-300 text-slate-900 dark:bg-yellow-400/20 dark:border-yellow-400/50 dark:text-white",
    buttonActive:
      "bg-yellow-200 ring-2 ring-yellow-500 scale-110 text-slate-900 dark:bg-yellow-400/40 dark:ring-yellow-300 dark:text-white",
  },
  6: {
    cell: "bg-pink-200 text-slate-900 dark:bg-pink-400/40 dark:text-white",
    button:
      "bg-pink-100 border border-pink-300 text-slate-900 dark:bg-pink-400/20 dark:border-pink-400/50 dark:text-white",
    buttonActive:
      "bg-pink-200 ring-2 ring-pink-500 scale-110 text-slate-900 dark:bg-pink-400/40 dark:ring-pink-300 dark:text-white",
  },
  7: {
    cell: "bg-cyan-200 text-slate-900 dark:bg-cyan-400/40 dark:text-white",
    button:
      "bg-cyan-100 border border-cyan-300 text-slate-900 dark:bg-cyan-400/20 dark:border-cyan-400/50 dark:text-white",
    buttonActive:
      "bg-cyan-200 ring-2 ring-cyan-500 scale-110 text-slate-900 dark:bg-cyan-400/40 dark:ring-cyan-300 dark:text-white",
  },
  8: {
    cell: "bg-red-200 text-slate-900 dark:bg-red-400/40 dark:text-white",
    button:
      "bg-red-100 border border-red-300 text-slate-900 dark:bg-red-400/20 dark:border-red-400/50 dark:text-white",
    buttonActive:
      "bg-red-200 ring-2 ring-red-500 scale-110 text-slate-900 dark:bg-red-400/40 dark:ring-red-300 dark:text-white",
  },
  9: {
    cell: "bg-lime-200 text-slate-900 dark:bg-lime-400/40 dark:text-white",
    button:
      "bg-lime-100 border border-lime-300 text-slate-900 dark:bg-lime-400/20 dark:border-lime-400/50 dark:text-white",
    buttonActive:
      "bg-lime-200 ring-2 ring-lime-500 scale-110 text-slate-900 dark:bg-lime-400/40 dark:ring-lime-300 dark:text-white",
  },
};

/** Gris claro de las casillas del número seleccionado cuando aún no está completo. */
export const SELECTED_CELL = "bg-slate-300 text-slate-900 dark:bg-slate-500/50 dark:text-white";
