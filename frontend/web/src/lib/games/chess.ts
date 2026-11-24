import type {
  CastlingRights,
  ChessState,
  ChessStatus,
  Color,
  HistoryRow,
  Move,
  MoveRecord,
  Piece,
  PieceType,
  PromotionPiece,
  Square,
} from "../../types/chess.ts";

type Board = readonly (Piece | null)[];

const PROMOTION_PIECES: readonly PromotionPiece[] = ["q", "r", "b", "n"];

const KNIGHT_STEPS: readonly (readonly [number, number])[] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1],
];
const KING_STEPS: readonly (readonly [number, number])[] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1],
];
const ROOK_DIRS: readonly (readonly [number, number])[] = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
];
const BISHOP_DIRS: readonly (readonly [number, number])[] = [
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];

// Casillas iniciales de reyes y torres (0 = a8, 63 = h1).
const WHITE_KING_SQ = 60;
const BLACK_KING_SQ = 4;
const A1 = 56;
const H1 = 63;
const A8 = 0;
const H8 = 7;

const BACK_RANK: readonly PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];

const row = (sq: Square): number => sq >> 3;
const col = (sq: Square): number => sq & 7;
const inside = (r: number, c: number): boolean => r >= 0 && r < 8 && c >= 0 && c < 8;
const opposite = (color: Color): Color => (color === "w" ? "b" : "w");

/** Nombre algebraico de una casilla: 0 -> "a8", 63 -> "h1". */
export function squareName(sq: Square): string {
  return `${"abcdefgh"[col(sq)]}${8 - row(sq)}`;
}

/** Inversa de `squareName`. Devuelve null si el nombre no es válido. */
export function parseSquare(name: string): Square | null {
  if (!/^[a-h][1-8]$/.test(name)) return null;
  const c = name.charCodeAt(0) - 97;
  const r = 8 - Number(name[1]);
  return r * 8 + c;
}

export function initialState(): ChessState {
  const board: (Piece | null)[] = new Array<Piece | null>(64).fill(null);
  for (let c = 0; c < 8; c++) {
    board[c] = { color: "b", type: BACK_RANK[c] };
    board[8 + c] = { color: "b", type: "p" };
    board[48 + c] = { color: "w", type: "p" };
    board[56 + c] = { color: "w", type: BACK_RANK[c] };
  }
  return {
    board,
    turn: "w",
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
    halfmove: 0,
    history: [],
  };
}

function findKing(board: Board, color: Color): Square {
  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p !== null && p.type === "k" && p.color === color) return sq;
  }
  return -1;
}

/** ¿Está la casilla atacada por alguna pieza del color `by`? */
function isAttacked(board: Board, sq: Square, by: Color): boolean {
  const r = row(sq);
  const c = col(sq);

  // Peones: un peón blanco ataca hacia arriba (fila - 1), así que está una fila por debajo.
  const pawnRow = by === "w" ? r + 1 : r - 1;
  for (const dc of [-1, 1]) {
    if (inside(pawnRow, c + dc)) {
      const p = board[pawnRow * 8 + c + dc];
      if (p !== null && p.color === by && p.type === "p") return true;
    }
  }

  for (const [dr, dc] of KNIGHT_STEPS) {
    if (inside(r + dr, c + dc)) {
      const p = board[(r + dr) * 8 + c + dc];
      if (p !== null && p.color === by && p.type === "n") return true;
    }
  }

  for (const [dr, dc] of KING_STEPS) {
    if (inside(r + dr, c + dc)) {
      const p = board[(r + dr) * 8 + c + dc];
      if (p !== null && p.color === by && p.type === "k") return true;
    }
  }

  const slide = (dirs: readonly (readonly [number, number])[], a: PieceType): boolean => {
    for (const [dr, dc] of dirs) {
      let rr = r + dr;
      let cc = c + dc;
      while (inside(rr, cc)) {
        const p = board[rr * 8 + cc];
        if (p !== null) {
          if (p.color === by && (p.type === a || p.type === "q")) return true;
          break;
        }
        rr += dr;
        cc += dc;
      }
    }
    return false;
  };
  return slide(ROOK_DIRS, "r") || slide(BISHOP_DIRS, "b");
}

export function isInCheck(state: ChessState, color: Color): boolean {
  const king = findKing(state.board, color);
  return king >= 0 && isAttacked(state.board, king, opposite(color));
}

function pushPawnMove(out: Move[], from: Square, to: Square, promotes: boolean): void {
  if (promotes) {
    for (const promotion of PROMOTION_PIECES) out.push({ from, to, promotion });
  } else {
    out.push({ from, to });
  }
}

/** Movimientos pseudo-legales (sin comprobar el jaque propio) de la pieza en `from`. */
function pseudoMoves(state: ChessState, from: Square): Move[] {
  const piece = state.board[from];
  if (piece === null) return [];
  const board = state.board;
  const out: Move[] = [];
  const r = row(from);
  const c = col(from);

  switch (piece.type) {
    case "p": {
      const dir = piece.color === "w" ? -1 : 1;
      const startRow = piece.color === "w" ? 6 : 1;
      const lastRow = piece.color === "w" ? 0 : 7;
      const oneRow = r + dir;
      if (!inside(oneRow, c)) break;
      const promotes = oneRow === lastRow;
      if (board[oneRow * 8 + c] === null) {
        pushPawnMove(out, from, oneRow * 8 + c, promotes);
        if (r === startRow && board[(r + 2 * dir) * 8 + c] === null) {
          out.push({ from, to: (r + 2 * dir) * 8 + c });
        }
      }
      for (const dc of [-1, 1]) {
        if (!inside(oneRow, c + dc)) continue;
        const to = oneRow * 8 + c + dc;
        const target = board[to];
        if (target !== null && target.color !== piece.color) {
          pushPawnMove(out, from, to, promotes);
        } else if (target === null && state.enPassant === to) {
          out.push({ from, to });
        }
      }
      break;
    }
    case "n":
    case "k": {
      const steps = piece.type === "n" ? KNIGHT_STEPS : KING_STEPS;
      for (const [dr, dc] of steps) {
        if (!inside(r + dr, c + dc)) continue;
        const to = (r + dr) * 8 + c + dc;
        const target = board[to];
        if (target === null || target.color !== piece.color) out.push({ from, to });
      }
      if (piece.type === "k") addCastling(state, from, piece.color, out);
      break;
    }
    default: {
      const dirs =
        piece.type === "r" ? ROOK_DIRS
        : piece.type === "b" ? BISHOP_DIRS
        : [...ROOK_DIRS, ...BISHOP_DIRS];
      for (const [dr, dc] of dirs) {
        let rr = r + dr;
        let cc = c + dc;
        while (inside(rr, cc)) {
          const to = rr * 8 + cc;
          const target = board[to];
          if (target === null) {
            out.push({ from, to });
          } else {
            if (target.color !== piece.color) out.push({ from, to });
            break;
          }
          rr += dr;
          cc += dc;
        }
      }
    }
  }
  return out;
}

function addCastling(state: ChessState, from: Square, color: Color, out: Move[]): void {
  const kingSq = color === "w" ? WHITE_KING_SQ : BLACK_KING_SQ;
  if (from !== kingSq) return;
  const enemy = opposite(color);
  const board = state.board;
  const shortRight = color === "w" ? state.castling.wK : state.castling.bK;
  const longRight = color === "w" ? state.castling.wQ : state.castling.bQ;
  if (!shortRight && !longRight) return;
  if (isAttacked(board, from, enemy)) return;

  const rookAt = (sq: Square): boolean => {
    const p = board[sq];
    return p !== null && p.type === "r" && p.color === color;
  };

  if (shortRight && rookAt(kingSq + 3)) {
    if (
      board[kingSq + 1] === null &&
      board[kingSq + 2] === null &&
      !isAttacked(board, kingSq + 1, enemy) &&
      !isAttacked(board, kingSq + 2, enemy)
    ) {
      out.push({ from, to: kingSq + 2 });
    }
  }
  if (longRight && rookAt(kingSq - 4)) {
    if (
      board[kingSq - 1] === null &&
      board[kingSq - 2] === null &&
      board[kingSq - 3] === null &&
      !isAttacked(board, kingSq - 1, enemy) &&
      !isAttacked(board, kingSq - 2, enemy)
    ) {
      out.push({ from, to: kingSq - 2 });
    }
  }
}

interface Applied {
  board: (Piece | null)[];
  castling: CastlingRights;
  enPassant: Square | null;
  halfmove: number;
  captured: PieceType | null;
}

/** Aplica un movimiento sin validarlo. No muta el estado recibido. */
function applyRaw(state: ChessState, move: Move): Applied {
  const board = state.board.slice();
  const piece = board[move.from];
  if (piece === null) throw new Error(`No hay pieza en ${squareName(move.from)}`);

  let captured: PieceType | null = board[move.to]?.type ?? null;
  const castling: CastlingRights = { ...state.castling };
  let enPassant: Square | null = null;

  if (piece.type === "p") {
    const isDiagonal = col(move.from) !== col(move.to);
    if (isDiagonal && board[move.to] === null) {
      // Captura al paso: el peón capturado está en la fila de origen, columna de destino.
      const victim = row(move.from) * 8 + col(move.to);
      captured = board[victim]?.type ?? "p";
      board[victim] = null;
    }
    if (Math.abs(row(move.to) - row(move.from)) === 2) {
      enPassant = (move.from + move.to) / 2;
    }
  }

  if (piece.type === "k") {
    if (Math.abs(col(move.to) - col(move.from)) === 2) {
      const short = col(move.to) > col(move.from);
      const rookFrom = short ? move.from + 3 : move.from - 4;
      const rookTo = short ? move.from + 1 : move.from - 1;
      board[rookTo] = board[rookFrom];
      board[rookFrom] = null;
    }
    if (piece.color === "w") {
      castling.wK = false;
      castling.wQ = false;
    } else {
      castling.bK = false;
      castling.bQ = false;
    }
  }

  for (const sq of [move.from, move.to]) {
    if (sq === A1) castling.wQ = false;
    else if (sq === H1) castling.wK = false;
    else if (sq === A8) castling.bQ = false;
    else if (sq === H8) castling.bK = false;
  }

  board[move.to] =
    move.promotion !== undefined ? { color: piece.color, type: move.promotion } : piece;
  board[move.from] = null;

  const resetsClock = piece.type === "p" || captured !== null;
  return {
    board,
    castling,
    enPassant,
    halfmove: resetsClock ? 0 : state.halfmove + 1,
    captured,
  };
}

/**
 * Movimientos legales del jugador en turno. Si se indica `from`, solo los de esa casilla
 * (vacío si no hay pieza propia en ella).
 */
export function legalMoves(state: ChessState, from?: Square): Move[] {
  const origins: Square[] = [];
  if (from !== undefined) {
    const p = state.board[from];
    if (p !== undefined && p !== null && p.color === state.turn) origins.push(from);
  } else {
    for (let sq = 0; sq < 64; sq++) {
      const p = state.board[sq];
      if (p !== null && p.color === state.turn) origins.push(sq);
    }
  }

  const legal: Move[] = [];
  for (const sq of origins) {
    for (const move of pseudoMoves(state, sq)) {
      const { board } = applyRaw(state, move);
      const king = findKing(board, state.turn);
      if (king < 0 || !isAttacked(board, king, opposite(state.turn))) legal.push(move);
    }
  }
  return legal;
}

/** Estado posterior al movimiento (sin validar) con `san` en el registro. */
function nextState(state: ChessState, move: Move, san: string): ChessState {
  const next = applyRaw(state, move);
  const record: MoveRecord = { move, san, captured: next.captured };
  return {
    board: next.board,
    turn: opposite(state.turn),
    castling: next.castling,
    enPassant: next.enPassant,
    halfmove: next.halfmove,
    history: [...state.history, record],
  };
}

/** Devuelve el estado tras el movimiento. Lanza Error si el movimiento no es legal. */
export function applyMove(state: ChessState, move: Move): ChessState {
  const isLegal = legalMoves(state, move.from).some(
    (m) => m.to === move.to && m.promotion === move.promotion,
  );
  if (!isLegal) {
    throw new Error(`Movimiento ilegal: ${squareName(move.from)}-${squareName(move.to)}`);
  }
  return nextState(state, move, toSan(state, move));
}

/** Color de casilla: 0 = oscura/clara según paridad de fila + columna. */
const squareShade = (sq: Square): number => (row(sq) + col(sq)) & 1;

/**
 * Material insuficiente para dar mate: solo reyes, un único alfil o caballo,
 * o solo alfiles (de ambos bandos) sobre casillas del mismo color.
 */
function hasInsufficientMaterial(board: Board): boolean {
  const minors: { type: PieceType; sq: Square }[] = [];
  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (p === null || p.type === "k") continue;
    if (p.type !== "b" && p.type !== "n") return false;
    minors.push({ type: p.type, sq });
  }
  if (minors.length <= 1) return true;
  if (minors.some((m) => m.type !== "b")) return false;
  const shade = squareShade(minors[0].sq);
  return minors.every((m) => squareShade(m.sq) === shade);
}

/** Estado de la partida para el jugador en turno. */
export function statusOf(state: ChessState): ChessStatus {
  const check = isInCheck(state, state.turn);
  if (legalMoves(state).length === 0) {
    return check ? { kind: "checkmate", winner: opposite(state.turn) } : { kind: "stalemate" };
  }
  if (hasInsufficientMaterial(state.board)) return { kind: "draw-material" };
  return { kind: "playing", check };
}

const PIECE_LETTER: Record<PieceType, string> = {
  p: "", n: "N", b: "B", r: "R", q: "Q", k: "K",
};
const FILES = "abcdefgh";

/**
 * Notación algebraica del movimiento. Se calcula sobre el estado ANTES de aplicarlo.
 * Incluye captura, desambiguación, promoción, enroque y sufijos `+` / `#`.
 */
export function toSan(state: ChessState, move: Move): string {
  const piece = state.board[move.from];
  if (piece === null || piece === undefined) {
    throw new Error(`No hay pieza en ${squareName(move.from)}`);
  }

  let body: string;
  if (piece.type === "k" && Math.abs(col(move.to) - col(move.from)) === 2) {
    body = col(move.to) > col(move.from) ? "O-O" : "O-O-O";
  } else {
    const isCapture =
      state.board[move.to] !== null ||
      (piece.type === "p" && col(move.from) !== col(move.to));
    const target = squareName(move.to);
    if (piece.type === "p") {
      body = (isCapture ? `${FILES[col(move.from)]}x` : "") + target;
      if (move.promotion !== undefined) body += `=${move.promotion.toUpperCase()}`;
    } else {
      const rivals = legalMoves(state).filter(
        (m) =>
          m.to === move.to &&
          m.from !== move.from &&
          state.board[m.from]?.type === piece.type,
      );
      let from = "";
      if (rivals.length > 0) {
        const sameFile = rivals.some((m) => col(m.from) === col(move.from));
        const sameRank = rivals.some((m) => row(m.from) === row(move.from));
        const file = FILES[col(move.from)];
        const rank = String(8 - row(move.from));
        from = !sameFile ? file : !sameRank ? rank : file + rank;
      }
      body = `${PIECE_LETTER[piece.type]}${from}${isCapture ? "x" : ""}${target}`;
    }
  }

  const after = nextState(state, move, "");
  if (isInCheck(after, after.turn)) {
    body += legalMoves(after).length === 0 ? "#" : "+";
  }
  return body;
}

/** Agrupa el historial en filas numeradas (blancas y negras) para la interfaz. */
export function historyToPairs(history: readonly MoveRecord[]): HistoryRow[] {
  const rows: HistoryRow[] = [];
  history.forEach((record, i) => {
    if (i % 2 === 0) {
      rows.push({ number: i / 2 + 1, white: record.san });
    } else {
      rows[rows.length - 1].black = record.san;
    }
  });
  return rows;
}
