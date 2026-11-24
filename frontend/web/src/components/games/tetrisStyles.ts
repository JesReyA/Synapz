import type { TetrominoKind } from "../../types/tetris.ts";

/** Relleno de cada pieza. Clases literales para que Tailwind las detecte. */
export const PIECE_FILL: Record<TetrominoKind, string> = {
  I: "bg-cyan-400 dark:bg-cyan-400/90",
  O: "bg-yellow-300 dark:bg-yellow-300/90",
  T: "bg-violet-500 dark:bg-violet-400/90",
  S: "bg-emerald-500 dark:bg-emerald-400/90",
  Z: "bg-red-500 dark:bg-red-400/90",
  J: "bg-blue-500 dark:bg-blue-400/90",
  L: "bg-orange-500 dark:bg-orange-400/90",
};

/** Sombra de caída: borde punteado y fondo tenue del color de la pieza. */
export const PIECE_GHOST: Record<TetrominoKind, string> = {
  I: "border border-dashed border-cyan-500 bg-cyan-400/15 dark:border-cyan-300",
  O: "border border-dashed border-yellow-500 bg-yellow-300/15 dark:border-yellow-300",
  T: "border border-dashed border-violet-500 bg-violet-500/15 dark:border-violet-300",
  S: "border border-dashed border-emerald-500 bg-emerald-500/15 dark:border-emerald-300",
  Z: "border border-dashed border-red-500 bg-red-500/15 dark:border-red-300",
  J: "border border-dashed border-blue-500 bg-blue-500/15 dark:border-blue-300",
  L: "border border-dashed border-orange-500 bg-orange-500/15 dark:border-orange-300",
};
