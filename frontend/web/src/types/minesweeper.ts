export type MineDifficulty = "facil" | "medio" | "dificil";

export interface MineCell {
  mine: boolean;
  /** Minas en las 8 casillas vecinas. Vale 0 hasta que se colocan las minas. */
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
}

export type MineStatus = "ready" | "playing" | "won" | "lost";

export interface MineState {
  rows: number;
  cols: number;
  mines: number;
  /** Casillas en orden de filas: índice = fila * cols + columna. */
  cells: readonly MineCell[];
  status: MineStatus;
  /** Casillas sin mina reveladas. La casilla que explota no cuenta. */
  revealedCount: number;
  /** Banderas puestas. Puede superar a `mines`. */
  flags: number;
  /** Índice de la mina revelada al perder; `null` en cualquier otro estado. */
  explodedIndex: number | null;
}
