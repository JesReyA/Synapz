export type TetrominoKind = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type TetrisRotation = 0 | 1 | 2 | 3;

/** Celda como `[fila, columna]`. */
export type TetrisCell = readonly [number, number];

/**
 * Pieza en juego. `row` y `col` son la esquina superior izquierda de su caja
 * de rotación (4×4 para I y O, 3×3 para el resto). `row` puede ser negativo
 * (la I aparece con la caja una fila por encima del tablero), pero las celdas
 * ocupadas nunca salen del tablero.
 */
export interface ActivePiece {
  kind: TetrominoKind;
  rotation: TetrisRotation;
  row: number;
  col: number;
}

export type TetrisStatus = "playing" | "paused" | "over";

export interface TetrisState {
  /** ROWS * COLS celdas en orden de filas; `null` es una celda vacía. */
  board: readonly (TetrominoKind | null)[];
  active: ActivePiece;
  /** Cola de piezas siguientes. Siempre tiene al menos 7 elementos. */
  next: readonly TetrominoKind[];
  score: number;
  lines: number;
  level: number;
  status: TetrisStatus;
}
