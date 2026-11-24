import type { SlideBoard, SlideDirection } from "../../types/slidingPuzzle.ts";
import { pick, randInt } from "../random.ts";

export const N = 4;

const SIZE = N * N;
const MIN_SHUFFLE_MOVES = 200;
const MAX_SHUFFLE_MOVES = 300;

export function solvedBoard(): SlideBoard {
  const board: number[] = [];
  for (let i = 1; i < SIZE; i++) board.push(i);
  board.push(0);
  return board;
}

export function isSolved(board: SlideBoard): boolean {
  if (board.length !== SIZE) return false;
  for (let i = 0; i < SIZE - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[SIZE - 1] === 0;
}

export function holeIndex(board: SlideBoard): number {
  return board.indexOf(0);
}

/**
 * Con ancho par, el tablero es resoluble si la suma de las inversiones y la
 * fila del hueco contada desde abajo (empezando en 1) es impar.
 */
export function isSolvable(board: SlideBoard): boolean {
  let inversions = 0;
  for (let i = 0; i < board.length; i++) {
    const a = board[i] as number;
    if (a === 0) continue;
    for (let j = i + 1; j < board.length; j++) {
      const b = board[j] as number;
      if (b !== 0 && a > b) inversions++;
    }
  }
  const holeRowFromBottom = N - Math.floor(holeIndex(board) / N);
  return (inversions + holeRowFromBottom) % 2 === 1;
}

/** Índices de las casillas adyacentes (distancia 1, sin diagonales). */
function neighborsOf(index: number): number[] {
  const row = Math.floor(index / N);
  const col = index % N;
  const result: number[] = [];
  if (row > 0) result.push(index - N);
  if (row < N - 1) result.push(index + N);
  if (col > 0) result.push(index - 1);
  if (col < N - 1) result.push(index + 1);
  return result;
}

export function canMove(board: SlideBoard, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= board.length) return false;
  if (board[index] === 0) return false;
  return neighborsOf(index).includes(holeIndex(board));
}

export function moveTile(board: SlideBoard, index: number): SlideBoard {
  if (!canMove(board, index)) return board;
  const hole = holeIndex(board);
  const next = [...board];
  next[hole] = board[index] as number;
  next[index] = 0;
  return next;
}

export function moveByDirection(board: SlideBoard, dir: SlideDirection): SlideBoard {
  const hole = holeIndex(board);
  if (hole < 0) return board;
  const row = Math.floor(hole / N);
  const col = hole % N;
  switch (dir) {
    case "up":
      return row < N - 1 ? moveTile(board, hole + N) : board;
    case "down":
      return row > 0 ? moveTile(board, hole - N) : board;
    case "left":
      return col < N - 1 ? moveTile(board, hole + 1) : board;
    case "right":
      return col > 0 ? moveTile(board, hole - 1) : board;
  }
}

/**
 * Parte del tablero resuelto y aplica entre 200 y 300 movimientos válidos al
 * azar, sin deshacer el anterior. Así el resultado siempre es resoluble.
 */
export function shuffledBoard(): SlideBoard {
  for (;;) {
    let board = solvedBoard();
    let previousHole = -1;
    const moves = randInt(MIN_SHUFFLE_MOVES, MAX_SHUFFLE_MOVES);
    for (let m = 0; m < moves; m++) {
      const hole = holeIndex(board);
      const options = neighborsOf(hole).filter((i) => i !== previousHole);
      const tile = pick(options);
      board = moveTile(board, tile);
      previousHole = hole;
    }
    if (!isSolved(board)) return board;
  }
}
