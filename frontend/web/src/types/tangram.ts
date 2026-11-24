/** Las 5 formas distintas del Tangram (el juego usa 7 piezas: 2 grandes, 2 pequeñas y una de cada otra forma). */
export type TanKind = "large" | "medium" | "small" | "square" | "parallelogram";
export interface Point {
  x: number;
  y: number;
}
/** Rectángulo en unidades del tangram (eje y hacia abajo). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Colocación de una pieza en el tablero. `x` e `y` son la posición de su centroide. */
export interface TanPlacement {
  /** Identificador único de la pieza: "large-1", "small-2", ... */
  id: string;
  kind: TanKind;
  x: number;
  y: number;
  /** Grados en sentido horario en pantalla; múltiplos de 45 entre 0 y 315. */
  rotation: number;
  /** Reflejo respecto al eje vertical local, antes de rotar. Solo tiene efecto en el paralelogramo. */
  flipped: boolean;
}
/** Figura objetivo: la silueta es la unión de las 7 colocaciones de `solution`. */
export interface TangramFigure {
  id: string;
  name: string;
  solution: readonly TanPlacement[];
}
