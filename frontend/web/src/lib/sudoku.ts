import type { SudokuDifficulty, SudokuGeometry, SudokuPuzzle, SudokuSize } from "../types/challenges.ts";
import { newId, shuffle } from "./random.ts";

export const SIZES: readonly SudokuSize[] = [6, 9];

export const DIFFICULTIES: readonly { id: SudokuDifficulty; label: string }[] = [
  { id: "facil", label: "Fácil" },
  { id: "medio", label: "Medio" },
  { id: "dificil", label: "Difícil" },
];

/** Pistas que quedan visibles. */
const CLUES: Record<SudokuSize, Record<SudokuDifficulty, number>> = {
  6: { facil: 24, medio: 19, dificil: 15 },
  9: { facil: 42, medio: 34, dificil: 28 },
};

export function geometryFor(size: SudokuSize): SudokuGeometry {
  return size === 6 ? { size, boxRows: 2, boxCols: 3 } : { size, boxRows: 3, boxCols: 3 };
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function groupedPermutation(groups: number, perGroup: number): number[] {
  return shuffle(range(groups)).flatMap((g) => shuffle(range(perGroup)).map((i) => g * perGroup + i));
}

function boxIndex(g: SudokuGeometry, row: number, col: number): number {
  return Math.floor(row / g.boxRows) * (g.size / g.boxCols) + Math.floor(col / g.boxCols);
}

function popcount(mask: number): number {
  let n = 0;
  for (let m = mask; m > 0; m &= m - 1) n++;
  return n;
}

function buildSolution(g: SudokuGeometry): number[] {
  const { size, boxRows, boxCols } = g;
  const rows = groupedPermutation(size / boxRows, boxRows);
  const cols = groupedPermutation(size / boxCols, boxCols);
  const digits = shuffle(range(size).map((d) => d + 1));
  const out: number[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const rr = rows[r] as number;
      const cc = cols[c] as number;
      const base = (boxCols * (rr % boxRows) + Math.floor(rr / boxRows) + cc) % size;
      out.push(digits[base] as number);
    }
  }
  return out;
}

/** Cuenta soluciones (hasta `limit`) con backtracking y la celda con menos candidatos primero. */
function countSolutions(cells: readonly number[], g: SudokuGeometry, limit = 2): number {
  const n = g.size;
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
    const b = boxIndex(g, r, c);
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
      const used = (rows[r] as number) | (cols[c] as number) | (boxes[boxIndex(g, r, c)] as number);
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
    const b = boxIndex(g, r, c);
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
export function generatePuzzle(size: SudokuSize, difficulty: SudokuDifficulty): SudokuPuzzle {
  const g = geometryFor(size);
  const solution = buildSolution(g);
  const cells = [...solution];
  const target = CLUES[size][difficulty];
  let clues = cells.length;
  for (const i of shuffle(range(cells.length))) {
    if (clues <= target) break;
    const saved = cells[i] as number;
    cells[i] = 0;
    if (countSolutions(cells, g) === 1) clues--;
    else cells[i] = saved;
  }
  return { ...g, id: newId(), difficulty, cells, solution };
}

/** Índices de celdas que repiten un número en su fila, columna o caja. */
export function findConflicts(values: readonly number[], g: SudokuGeometry): Set<number> {
  const n = g.size;
  const groups = new Map<string, number[]>();
  values.forEach((v, i) => {
    if (v === 0) return;
    const r = Math.floor(i / n);
    const c = i % n;
    for (const key of [`r${r}-${v}`, `c${c}-${v}`, `b${boxIndex(g, r, c)}-${v}`]) {
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

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
