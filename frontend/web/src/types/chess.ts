/** Tipos del ajedrez (solo cliente). El tablero usa 64 casillas: 0 = a8, 63 = h1. */

export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type PromotionPiece = Exclude<PieceType, "p" | "k">;

export interface Piece {
  color: Color;
  type: PieceType;
}

/** Índice 0..63, fila * 8 + columna, con 0 = a8 y 63 = h1. */
export type Square = number;

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
}

export interface MoveRecord {
  move: Move;
  san: string;
  captured: PieceType | null;
}

export interface ChessState {
  board: readonly (Piece | null)[];
  turn: Color;
  castling: CastlingRights;
  /** Casilla de destino de la captura al paso, o null. */
  enPassant: Square | null;
  halfmove: number;
  history: readonly MoveRecord[];
}

/** Fila del historial: número de jugada y los SAN de blancas y negras. */
export interface HistoryRow {
  number: number;
  white?: string;
  black?: string;
}

export type ChessStatus =
  | { kind: "playing"; check: boolean }
  | { kind: "checkmate"; winner: Color }
  | { kind: "stalemate" }
  | { kind: "draw-material" };
