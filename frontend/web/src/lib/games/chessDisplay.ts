import type { Color, PieceType } from "../../types/chess.ts";

/** Glifos Unicode por color y tipo. El peón negro lleva U+FE0E para evitar el emoji. */
export const PIECE_GLYPH: Record<Color, Record<PieceType, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟\uFE0E" },
};

/** Nombre accesible de cada pieza, con el género gramatical correcto. */
export const PIECE_LABEL: Record<Color, Record<PieceType, string>> = {
  w: {
    k: "rey blanco",
    q: "dama blanca",
    r: "torre blanca",
    b: "alfil blanco",
    n: "caballo blanco",
    p: "peón blanco",
  },
  b: {
    k: "rey negro",
    q: "dama negra",
    r: "torre negra",
    b: "alfil negro",
    n: "caballo negro",
    p: "peón negro",
  },
};

/** Clases de color del glifo: blancas con contorno oscuro, negras con halo claro. */
export const PIECE_COLOR_CLASS: Record<Color, string> = {
  w: "text-white [text-shadow:0_0_2px_#000,0_0_3px_#000]",
  b: "text-slate-900 [text-shadow:0_0_2px_#fff,0_0_1px_#fff]",
};

export const COLOR_NAME_PLURAL: Record<Color, string> = { w: "blancas", b: "negras" };
