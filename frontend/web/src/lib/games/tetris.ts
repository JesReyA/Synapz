import type {
  ActivePiece,
  TetrisCell,
  TetrisRotation,
  TetrisState,
  TetrominoKind,
} from "../../types/tetris.ts";
import { shuffle } from "../random.ts";

export const COLS = 10;
export const ROWS = 20;

const KINDS: readonly TetrominoKind[] = ["I", "O", "T", "S", "Z", "J", "L"];
const BAG_SIZE = KINDS.length;
const LINE_POINTS: readonly number[] = [0, 100, 300, 500, 800];
const SPAWN_COL = 3;

/**
 * Patadas de rotación como desplazamientos `[fila, columna]`, en orden de
 * prueba. Primero sin bajar (0, ±1, ±2 columnas), luego bajando una fila con
 * las mismas columnas (necesario para la I recién aparecida, cuya rotación
 * vertical sale por arriba del tablero), y solo al final subiendo una fila
 * (por ejemplo, cuando la pieza está apoyada abajo). Se prefiere siempre el
 * desplazamiento más pequeño y, a igualdad, el que no sube la pieza.
 */
const KICKS: readonly (readonly [number, number])[] = [
  [0, 0], [0, 1], [0, -1], [0, 2], [0, -2],
  [1, 0], [1, 1], [1, -1], [1, 2], [1, -2],
  [-1, 0], [-1, 1], [-1, -1], [-1, 2], [-1, -2],
];

/**
 * Las 4 rotaciones de cada pieza (SRS) como celdas `[fila, columna]` dentro de
 * su caja: 4×4 para I y O, 3×3 para el resto.
 */
const SHAPES: Record<TetrominoKind, readonly (readonly TetrisCell[])[]> = {
  I: [
    [[1, 0], [1, 1], [1, 2], [1, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 1], [1, 1], [2, 1], [3, 1]],
  ],
  O: [
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [1, 2]],
  ],
  T: [
    [[0, 1], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 1], [1, 0], [1, 1], [2, 1]],
  ],
  S: [
    [[0, 1], [0, 2], [1, 0], [1, 1]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 1], [1, 2], [2, 0], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
  ],
  Z: [
    [[0, 0], [0, 1], [1, 1], [1, 2]],
    [[0, 2], [1, 1], [1, 2], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[0, 1], [1, 0], [1, 1], [2, 0]],
  ],
  J: [
    [[0, 0], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [0, 2], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 0], [2, 1]],
  ],
  L: [
    [[0, 2], [1, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [1, 2], [2, 0]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
  ],
};

export function shapeOf(kind: TetrominoKind, rotation: number): readonly TetrisCell[] {
  const index = ((Math.trunc(rotation) % 4) + 4) % 4;
  return (SHAPES[kind] as readonly (readonly TetrisCell[])[])[index] as readonly TetrisCell[];
}

/** Celdas absolutas `[fila, columna]` del tablero que ocupa la pieza. */
export function cellsOf(piece: ActivePiece): TetrisCell[] {
  return shapeOf(piece.kind, piece.rotation).map(
    ([r, c]): TetrisCell => [piece.row + r, piece.col + c],
  );
}

/**
 * Hay colisión si alguna celda de la pieza queda fuera del tablero (incluida
 * por arriba) o sobre una celda ocupada. `piece.row` puede ser negativo (la
 * caja de la I aparece una fila por encima), pero sus celdas no.
 */
export function collides(board: TetrisState["board"], piece: ActivePiece): boolean {
  for (const [r, c] of cellsOf(piece)) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
    if (board[r * COLS + c] !== null) return true;
  }
  return false;
}

export function dropIntervalMs(level: number): number {
  return Math.max(100, 800 - (level - 1) * 70);
}

function newBag(): TetrominoKind[] {
  return shuffle(KINDS);
}

function spawnPiece(kind: TetrominoKind): ActivePiece {
  // La rotación 0 de la I ocupa la fila 1 de su caja: se sube la caja una fila
  // para que sus celdas aparezcan en la fila 0 del tablero.
  return { kind, rotation: 0, row: kind === "I" ? -1 : 0, col: SPAWN_COL };
}

export function createTetris(): TetrisState {
  const queue = [...newBag(), ...newBag()];
  const first = queue[0] as TetrominoKind;
  return {
    board: new Array<null>(ROWS * COLS).fill(null),
    active: spawnPiece(first),
    next: queue.slice(1),
    score: 0,
    lines: 0,
    level: 1,
    status: "playing",
  };
}

/** Copia la pieza al tablero, elimina filas completas y hace aparecer la siguiente. */
function lockPiece(state: TetrisState, piece: ActivePiece, extraScore: number): TetrisState {
  const board: (TetrominoKind | null)[] = [...state.board];
  for (const [r, c] of cellsOf(piece)) board[r * COLS + c] = piece.kind;

  const kept: (TetrominoKind | null)[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row = board.slice(r * COLS, (r + 1) * COLS);
    if (row.some((cell) => cell === null)) kept.push(row);
  }
  const cleared = ROWS - kept.length;
  const newBoard: (TetrominoKind | null)[] = [
    ...new Array<null>(cleared * COLS).fill(null),
    ...kept.flat(),
  ];

  const lines = state.lines + cleared;
  const score = state.score + extraScore + (LINE_POINTS[cleared] as number) * state.level;

  const queue = [...state.next];
  const kind = queue.shift() as TetrominoKind;
  if (queue.length < BAG_SIZE) queue.push(...newBag());
  const active = spawnPiece(kind);

  return {
    board: newBoard,
    active,
    next: queue,
    score,
    lines,
    level: 1 + Math.floor(lines / 10),
    status: collides(newBoard, active) ? "over" : "playing",
  };
}

export function moveHorizontal(state: TetrisState, dir: -1 | 1): TetrisState {
  if (state.status !== "playing") return state;
  const moved: ActivePiece = { ...state.active, col: state.active.col + dir };
  if (collides(state.board, moved)) return state;
  return { ...state, active: moved };
}

export function rotate(state: TetrisState, dir: 1 | -1): TetrisState {
  if (state.status !== "playing") return state;
  const rotation = ((state.active.rotation + dir + 4) % 4) as TetrisRotation;
  for (const [dRow, dCol] of KICKS) {
    const candidate: ActivePiece = {
      ...state.active,
      rotation,
      row: state.active.row + dRow,
      col: state.active.col + dCol,
    };
    if (!collides(state.board, candidate)) return { ...state, active: candidate };
  }
  return state;
}

function stepDown(state: TetrisState, points: number): TetrisState {
  const lowered: ActivePiece = { ...state.active, row: state.active.row + 1 };
  if (!collides(state.board, lowered)) {
    return { ...state, active: lowered, score: state.score + points };
  }
  return lockPiece(state, state.active, 0);
}

export function softDrop(state: TetrisState): TetrisState {
  if (state.status !== "playing") return state;
  return stepDown(state, 1);
}

export function tick(state: TetrisState): TetrisState {
  if (state.status !== "playing") return state;
  return stepDown(state, 0);
}

/** Fila (esquina superior de la caja) donde quedaría la pieza activa si cayera. */
export function ghostRow(state: TetrisState): number {
  let piece = state.active;
  for (;;) {
    const lowered: ActivePiece = { ...piece, row: piece.row + 1 };
    if (collides(state.board, lowered)) return piece.row;
    piece = lowered;
  }
}

export function hardDrop(state: TetrisState): TetrisState {
  if (state.status !== "playing") return state;
  const row = ghostRow(state);
  const distance = row - state.active.row;
  return lockPiece(state, { ...state.active, row }, distance * 2);
}

export function togglePause(state: TetrisState): TetrisState {
  if (state.status === "playing") return { ...state, status: "paused" };
  if (state.status === "paused") return { ...state, status: "playing" };
  return state;
}
