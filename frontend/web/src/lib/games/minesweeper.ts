import type { MineCell, MineDifficulty, MineState } from "../../types/minesweeper.ts";
import { shuffle } from "../random.ts";

export const MINE_LEVELS: Record<MineDifficulty, { rows: number; cols: number; mines: number }> = {
  facil: { rows: 8, cols: 8, mines: 10 },
  medio: { rows: 10, cols: 10, mines: 20 },
  dificil: { rows: 12, cols: 12, mines: 30 },
};

const EMPTY_CELL: MineCell = { mine: false, adjacent: 0, revealed: false, flagged: false };

/** Partida nueva: sin minas colocadas (se colocan en el primer `reveal`). */
export function createMineState(difficulty: MineDifficulty): MineState {
  const { rows, cols, mines } = MINE_LEVELS[difficulty];
  return {
    rows,
    cols,
    mines,
    cells: Array.from({ length: rows * cols }, () => EMPTY_CELL),
    status: "ready",
    revealedCount: 0,
    flags: 0,
    explodedIndex: null,
  };
}

/** Índices de las hasta 8 casillas vecinas de `index`. */
export function neighbors(state: Pick<MineState, "rows" | "cols">, index: number): number[] {
  const { rows, cols } = state;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      result.push(r * cols + c);
    }
  }
  return result;
}

function isValidIndex(state: MineState, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < state.cells.length;
}

/** Coloca las minas fuera de `firstIndex` y sus vecinas y calcula `adjacent`. */
function placeMines(state: MineState, firstIndex: number): MineCell[] {
  const safe = new Set<number>([firstIndex, ...neighbors(state, firstIndex)]);
  const candidates: number[] = [];
  for (let i = 0; i < state.cells.length; i++) {
    if (!safe.has(i)) candidates.push(i);
  }
  const mineSet = new Set<number>(shuffle(candidates).slice(0, state.mines));
  return state.cells.map((cell, i) => {
    let adjacent = 0;
    for (const n of neighbors(state, i)) {
      if (mineSet.has(n)) adjacent++;
    }
    return { ...cell, mine: mineSet.has(i), adjacent };
  });
}

/**
 * Revela las casillas `starts` y expande las de `adjacent === 0` con una cola
 * (sin recursión). Ignora casillas reveladas o con bandera. Si una de las
 * casillas iniciales es una mina, la partida se pierde. Solo cambia `cells`
 * (copia) y los campos derivados; `state` no se modifica.
 */
function revealFrom(state: MineState, starts: readonly number[]): MineState {
  const cells = state.cells.slice();
  const queue: number[] = [];
  let revealedCount = state.revealedCount;
  let exploded: number | null = null;

  for (const start of starts) {
    const cell = cells[start] as MineCell;
    if (cell.revealed || cell.flagged) continue;
    if (cell.mine) {
      exploded = start;
      break;
    }
    cells[start] = { ...cell, revealed: true };
    revealedCount++;
    if (cell.adjacent === 0) queue.push(start);
  }

  if (exploded === null) {
    for (let head = 0; head < queue.length; head++) {
      for (const n of neighbors(state, queue[head] as number)) {
        const next = cells[n] as MineCell;
        if (next.revealed || next.flagged || next.mine) continue;
        cells[n] = { ...next, revealed: true };
        revealedCount++;
        if (next.adjacent === 0) queue.push(n);
      }
    }
  }

  if (exploded !== null) {
    // Derrota. La interfaz, cuando status === "lost", muestra todas las minas
    // (leyendo `cells[i].mine` aunque no estén `revealed`) y marca como erróneas
    // las banderas en casillas con `mine === false`.
    const boom = cells[exploded] as MineCell;
    cells[exploded] = { ...boom, revealed: true };
    return { ...state, cells, status: "lost", explodedIndex: exploded, revealedCount };
  }

  if (revealedCount === state.rows * state.cols - state.mines) {
    // Victoria: se ponen banderas en las minas que faltaban.
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i] as MineCell;
      if (cell.mine && !cell.flagged) cells[i] = { ...cell, flagged: true };
    }
    return { ...state, cells, status: "won", revealedCount, flags: state.mines };
  }

  return { ...state, cells, status: "playing", revealedCount };
}

/**
 * Revela una casilla. En el primer `reveal` (status "ready") coloca las minas
 * dejando libre esa casilla y sus vecinas. No hace nada (misma referencia) si
 * la partida terminó, el índice no es válido o la casilla está revelada o con bandera.
 */
export function reveal(state: MineState, index: number): MineState {
  if (state.status === "won" || state.status === "lost") return state;
  if (!isValidIndex(state, index)) return state;
  const cell = state.cells[index] as MineCell;
  if (cell.revealed || cell.flagged) return state;

  const base: MineState =
    state.status === "ready" ? { ...state, cells: placeMines(state, index), status: "playing" } : state;
  return revealFrom(base, [index]);
}

/** Alterna la bandera de una casilla no revelada. Permitido en "ready" y "playing". */
export function toggleFlag(state: MineState, index: number): MineState {
  if (state.status === "won" || state.status === "lost") return state;
  if (!isValidIndex(state, index)) return state;
  const cell = state.cells[index] as MineCell;
  if (cell.revealed) return state;
  const cells = state.cells.slice();
  cells[index] = { ...cell, flagged: !cell.flagged };
  return { ...state, cells, flags: state.flags + (cell.flagged ? -1 : 1) };
}

/**
 * Sobre un número ya revelado cuyas banderas vecinas igualan su valor, revela
 * las vecinas sin bandera. Si alguna bandera es errónea, puede perder la partida.
 */
export function chord(state: MineState, index: number): MineState {
  if (state.status !== "playing") return state;
  if (!isValidIndex(state, index)) return state;
  const cell = state.cells[index] as MineCell;
  if (!cell.revealed || cell.adjacent === 0) return state;
  const around = neighbors(state, index);
  const flagged = around.filter((n) => (state.cells[n] as MineCell).flagged).length;
  if (flagged !== cell.adjacent) return state;
  const targets = around.filter((n) => {
    const c = state.cells[n] as MineCell;
    return !c.revealed && !c.flagged;
  });
  if (targets.length === 0) return state;
  return revealFrom(state, targets);
}
