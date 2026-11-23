import type { SudokuDifficulty, SudokuDigit, SudokuPuzzle } from "../types/challenges.ts";
import { newId, shuffle } from "./random.ts";

/** Lado del tablero y de cada bloque. */
export const SIZE = 9;
export const BOX = 3;

export const DIFFICULTIES: readonly { id: SudokuDifficulty; label: string }[] = [
  { id: "facil", label: "Fácil" },
  { id: "medio", label: "Medio" },
  { id: "dificil", label: "Difícil" },
];

/** Pistas que quedan visibles. */
const CLUES: Record<SudokuDifficulty, number> = { facil: 42, medio: 34, dificil: 28 };

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function groupedPermutation(groups: number, perGroup: number): number[] {
  return shuffle(range(groups)).flatMap((g) => shuffle(range(perGroup)).map((i) => g * perGroup + i));
}

function boxIndex(row: number, col: number): number {
  return Math.floor(row / BOX) * BOX + Math.floor(col / BOX);
}

function popcount(mask: number): number {
  let n = 0;
  for (let m = mask; m > 0; m &= m - 1) n++;
  return n;
}

function buildSolution(): number[] {
  const rows = groupedPermutation(BOX, BOX);
  const cols = groupedPermutation(BOX, BOX);
  const digits = shuffle(range(SIZE).map((d) => d + 1));
  const out: number[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const rr = rows[r] as number;
      const cc = cols[c] as number;
      const base = (BOX * (rr % BOX) + Math.floor(rr / BOX) + cc) % SIZE;
      out.push(digits[base] as number);
    }
  }
  return out;
}

/** Cuenta soluciones (hasta `limit`) con backtracking y la celda con menos candidatos primero. */
function countSolutions(cells: readonly number[], limit = 2): number {
  const n = SIZE;
  const full = (1 << n) - 1;
  const grid = [...cells];
  const rows = new Array<number>(n).fill(0);
  const cols = new Array<number>(n).fill(0);
  const boxes = new Array<number>(n).fill(0);
  grid.forEach((v, i) => {
    if (v === 0) return;
    const r = Math.floor(i / n);
    const c = i % n;
    const bit = 1 << (v - 1);
    rows[r] = (rows[r] as number) | bit;
    cols[c] = (cols[c] as number) | bit;
    const b = boxIndex(r, c);
    boxes[b] = (boxes[b] as number) | bit;
  });

  let count = 0;
  const solve = (): void => {
    if (count >= limit) return;
    let bestIdx = -1;
    let bestAvail = 0;
    let bestCount = n + 1;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== 0) continue;
      const r = Math.floor(i / n);
      const c = i % n;
      const used = (rows[r] as number) | (cols[c] as number) | (boxes[boxIndex(r, c)] as number);
      const avail = ~used & full;
      const k = popcount(avail);
      if (k === 0) return;
      if (k < bestCount) {
        bestIdx = i;
        bestAvail = avail;
        bestCount = k;
      }
    }
    if (bestIdx === -1) {
      count++;
      return;
    }
    const r = Math.floor(bestIdx / n);
    const c = bestIdx % n;
    const b = boxIndex(r, c);
    for (let d = 0; d < n; d++) {
      const bit = 1 << d;
      if ((bestAvail & bit) === 0) continue;
      grid[bestIdx] = d + 1;
      rows[r] = (rows[r] as number) | bit;
      cols[c] = (cols[c] as number) | bit;
      boxes[b] = (boxes[b] as number) | bit;
      solve();
      grid[bestIdx] = 0;
      rows[r] = (rows[r] as number) & ~bit;
      cols[c] = (cols[c] as number) & ~bit;
      boxes[b] = (boxes[b] as number) & ~bit;
      if (count >= limit) return;
    }
  };
  solve();
  return count;
}

/** Genera un sudoku de solución única. Solo se quitan celdas que mantienen esa unicidad. */
export function generatePuzzle(difficulty: SudokuDifficulty): SudokuPuzzle {
  const solution = buildSolution();
  const cells = [...solution];
  const target = CLUES[difficulty];
  let clues = cells.length;
  for (const i of shuffle(range(cells.length))) {
    if (clues <= target) break;
    const saved = cells[i] as number;
    cells[i] = 0;
    if (countSolutions(cells) === 1) clues--;
    else cells[i] = saved;
  }
  return { id: newId(), difficulty, cells, solution };
}

/** Índices de celdas que repiten un número en su fila, columna o caja. */
export function findConflicts(values: readonly number[]): Set<number> {
  const n = SIZE;
  const groups = new Map<string, number[]>();
  values.forEach((v, i) => {
    if (v === 0) return;
    const r = Math.floor(i / n);
    const c = i % n;
    for (const key of [`r${r}-${v}`, `c${c}-${v}`, `b${boxIndex(r, c)}-${v}`]) {
      const list = groups.get(key);
      if (list) list.push(i);
      else groups.set(key, [i]);
    }
  });
  const conflicts = new Set<number>();
  for (const list of groups.values()) {
    if (list.length > 1) list.forEach((i) => conflicts.add(i));
  }
  return conflicts;
}

/**
 * Valores del tablero tras tocar la casilla `index` con el número `active`.
 * Devuelve `values` (misma referencia) si el toque no cambia nada: sin número activo,
 * índice fuera de rango o casilla que es pista. Nunca muta `values`.
 */
export function applyTap(
  values: readonly number[],
  givens: readonly number[],
  index: number,
  active: SudokuDigit | null,
): readonly number[] {
  if (active === null) return values;
  if (!Number.isInteger(index) || index < 0 || index >= SIZE * SIZE) return values;
  if (givens[index] !== 0) return values;
  const next = [...values];
  next[index] = values[index] === active ? 0 : active;
  return next;
}

/**
 * Dígitos cuyas posiciones en `solution` están todas llenas con ese dígito en `values`.
 * Recorre el tablero una sola vez.
 */
export function completedDigits(
  values: readonly number[],
  solution: readonly number[],
): ReadonlySet<SudokuDigit> {
  const complete = new Array<boolean>(SIZE + 1).fill(true);
  for (let i = 0; i < solution.length; i++) {
    const digit = solution[i] as number;
    if (values[i] !== digit) complete[digit] = false;
  }
  const out = new Set<SudokuDigit>();
  for (let d = 1; d <= SIZE; d++) {
    if (complete[d]) out.add(d as SudokuDigit);
  }
  return out;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
