/**
 * Geometría, figuras y validación del Tangram. Funciones puras, sin React.
 *
 * Convención de coordenadas: unidades del tangram, con el origen arriba a la izquierda, el eje x hacia
 * la derecha y el eje y hacia abajo. El cuadrado completo mide 4×4 (área total 16). Los ángulos se
 * miden en sentido horario en pantalla. Cada pieza se define en un sistema local centrado en su
 * centroide y se coloca con: reflejo (x → -x), rotación y traslación, en ese orden.
 *
 * Tablero: las siluetas ocupan `FIGURE_AREA` y las piezas sueltas se reparten en `RESERVE_AREA`,
 * justo debajo. `BOARD_AREA` es la unión de ambas y sirve de `viewBox`.
 */
import type { Point, Rect, TanKind, TanPlacement, TangramFigure } from "../../types/tangram.ts";

const ROTATION_STEP = 45;
const DEFAULT_SNAP_STEP = 0.25;
const DEFAULT_TOLERANCE = 0.2;
const FIT_EPSILON = 1e-6;

/** Vértices de cada pieza en un sistema auxiliar. Se centran en el centroide más abajo. */
const RAW_SHAPES: Record<TanKind, readonly (readonly [number, number])[]> = {
  // Rectángulo isósceles de catetos 2√2 (hipotenusa 4 horizontal). Área 4.
  large: [[0, 0], [4, 0], [2, 2]],
  // Catetos 2 sobre los ejes. Área 2.
  medium: [[0, 0], [2, 0], [0, 2]],
  // Catetos √2 (hipotenusa 2 horizontal). Área 1.
  small: [[0, 0], [2, 0], [1, 1]],
  // Lado √2, apoyado en un vértice (rombo de diagonales 2). Área 2.
  square: [[1, 0], [2, 1], [1, 2], [0, 1]],
  // Lados 2 y √2, ángulos de 45° y 135°. Área 2.
  parallelogram: [[0, 0], [2, 0], [3, 1], [1, 1]],
};

/** Las 7 piezas del juego, en el orden en que se reparten en la reserva. */
export const TAN_SET: readonly { id: string; kind: TanKind }[] = [
  { id: "large-1", kind: "large" },
  { id: "large-2", kind: "large" },
  { id: "medium-1", kind: "medium" },
  { id: "small-1", kind: "small" },
  { id: "small-2", kind: "small" },
  { id: "square-1", kind: "square" },
  { id: "parallelogram-1", kind: "parallelogram" },
];

/** Los vértices de triángulos, cuadrado y paralelogramo tienen el centroide en su media. */
function centroidOf(points: readonly (readonly [number, number])[]): Point {
  let sx = 0;
  let sy = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
  }
  return { x: sx / points.length, y: sy / points.length };
}

function centered(points: readonly (readonly [number, number])[]): Point[] {
  const c = centroidOf(points);
  return points.map(([x, y]) => ({ x: x - c.x, y: y - c.y }));
}

const LOCAL_SHAPES: Record<TanKind, readonly Point[]> = {
  large: centered(RAW_SHAPES.large),
  medium: centered(RAW_SHAPES.medium),
  small: centered(RAW_SHAPES.small),
  square: centered(RAW_SHAPES.square),
  parallelogram: centered(RAW_SHAPES.parallelogram),
};

function trig(degrees: number): { cos: number; sin: number } {
  const d = ((degrees % 360) + 360) % 360;
  if (d === 0) return { cos: 1, sin: 0 };
  if (d === 90) return { cos: 0, sin: 1 };
  if (d === 180) return { cos: -1, sin: 0 };
  if (d === 270) return { cos: 0, sin: -1 };
  const rad = (d * Math.PI) / 180;
  return { cos: Math.cos(rad), sin: Math.sin(rad) };
}

/** Vértices de la pieza en coordenadas del tablero. */
export function polygonOf(placement: TanPlacement): Point[] {
  const { cos, sin } = trig(placement.rotation);
  const flip = placement.flipped && placement.kind === "parallelogram";
  return LOCAL_SHAPES[placement.kind].map((p) => {
    const lx = flip ? -p.x : p.x;
    return {
      x: placement.x + lx * cos - p.y * sin,
      y: placement.y + lx * sin + p.y * cos,
    };
  });
}

/** Ajusta el centro de la pieza a la rejilla. */
export function snap(placement: TanPlacement, step: number = DEFAULT_SNAP_STEP): TanPlacement {
  return {
    ...placement,
    x: Math.round(placement.x / step) * step + 0,
    y: Math.round(placement.y / step) * step + 0,
  };
}

function boundsOfPoints(points: readonly Point[]): Rect {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Rectángulo que contiene la silueta de la figura. */
export function boundsOf(figure: TangramFigure): Rect {
  return boundsOfPoints(figure.solution.flatMap((p) => polygonOf(p)));
}

/** Compara dos polígonos como conjuntos de vértices (sin importar el orden). */
function sameVertexSet(a: readonly Point[], b: readonly Point[], tolerance: number): boolean {
  if (a.length !== b.length) return false;
  const near = (p: Point, q: Point): boolean => Math.hypot(p.x - q.x, p.y - q.y) <= tolerance;
  return a.every((p) => b.some((q) => near(p, q))) && b.every((q) => a.some((p) => near(p, q)));
}

/**
 * Ids de las piezas colocadas que coinciden con un hueco de la silueta: mismo tipo y mismo
 * conjunto de vértices dentro de la tolerancia. Las piezas del mismo tipo son intercambiables y
 * cada hueco se asigna como máximo a una pieza (emparejamiento máximo por tipo).
 */
export function matchPieces(
  placed: readonly TanPlacement[],
  figure: TangramFigure,
  tolerance: number = DEFAULT_TOLERANCE,
): Set<string> {
  const matched = new Set<string>();
  const kinds = new Set<TanKind>(figure.solution.map((s) => s.kind));
  for (const kind of kinds) {
    const pieces = placed.filter((p) => p.kind === kind);
    const slots = figure.solution.filter((s) => s.kind === kind).map((s) => polygonOf(s));
    const compatible = pieces.map((piece) => {
      const poly = polygonOf(piece);
      return slots.map((slot) => sameVertexSet(poly, slot, tolerance));
    });
    const slotOwner: number[] = slots.map(() => -1);
    const tryAssign = (pi: number, visited: boolean[]): boolean => {
      const row = compatible[pi] ?? [];
      for (let si = 0; si < slots.length; si++) {
        if (!row[si] || visited[si]) continue;
        visited[si] = true;
        const owner = slotOwner[si] ?? -1;
        if (owner === -1 || tryAssign(owner, visited)) {
          slotOwner[si] = pi;
          return true;
        }
      }
      return false;
    };
    for (let pi = 0; pi < pieces.length; pi++) tryAssign(pi, slots.map(() => false));
    for (const owner of slotOwner) {
      const piece = owner >= 0 ? pieces[owner] : undefined;
      if (piece) matched.add(piece.id);
    }
  }
  return matched;
}

/** La figura está completa cuando todas las piezas de la solución tienen una pieza bien colocada. */
export function isFigureComplete(placed: readonly TanPlacement[], figure: TangramFigure): boolean {
  return matchPieces(placed, figure).size === figure.solution.length;
}

/* ---------- Figuras ---------- */

type Vertex = readonly [number, number];
interface PieceSpec {
  kind: TanKind;
  points: readonly Vertex[];
}
interface FigureSpec {
  id: string;
  name: string;
  pieces: readonly PieceSpec[];
}

/** Zona donde se dibujan las siluetas (cada figura queda centrada en ella). */
export const FIGURE_AREA: Rect = { x: 0, y: 0, width: 9, height: 6 };
/** Zona de reserva donde empiezan las piezas, debajo de las siluetas. */
export const RESERVE_AREA: Rect = { x: 0, y: 6.5, width: 9, height: 6.5 };
/** Unión de la zona de siluetas y la reserva. */
export const BOARD_AREA: Rect = { x: 0, y: 0, width: 9, height: 13 };

/**
 * Cada figura se define con los vértices de sus 7 piezas, en una rejilla entera. Las colocaciones
 * (centro, rotación y volteo) se deducen de esos vértices al cargar el módulo.
 */
const FIGURE_SPECS: readonly FigureSpec[] = [
  {
    id: "cuadrado",
    name: "Cuadrado",
    pieces: [
      { kind: "large", points: [[0, 0], [4, 0], [2, 2]] },
      { kind: "large", points: [[0, 4], [0, 0], [2, 2]] },
      { kind: "small", points: [[2, 4], [0, 4], [1, 3]] },
      { kind: "square", points: [[2, 2], [3, 3], [2, 4], [1, 3]] },
      { kind: "small", points: [[3, 1], [3, 3], [2, 2]] },
      { kind: "medium", points: [[4, 4], [2, 4], [4, 2]] },
      { kind: "parallelogram", points: [[4, 0], [4, 2], [3, 3], [3, 1]] },
    ],
  },
  {
    id: "triangulo",
    name: "Triángulo grande",
    pieces: [
      { kind: "large", points: [[4, 4], [0, 4], [2, 2]] },
      { kind: "large", points: [[4, 0], [4, 4], [2, 2]] },
      { kind: "small", points: [[4, 2], [4, 0], [5, 1]] },
      { kind: "square", points: [[5, 1], [6, 2], [5, 3], [4, 2]] },
      { kind: "medium", points: [[4, 4], [4, 2], [6, 4]] },
      { kind: "small", points: [[7, 3], [5, 3], [6, 2]] },
      { kind: "parallelogram", points: [[5, 3], [7, 3], [8, 4], [6, 4]] },
    ],
  },
  {
    id: "casa",
    name: "Casa",
    pieces: [
      { kind: "square", points: [[1, 1], [2, 2], [1, 3], [0, 2]] },
      { kind: "small", points: [[0, 4], [0, 2], [1, 3]] },
      { kind: "large", points: [[4, 4], [0, 4], [2, 2]] },
      { kind: "small", points: [[3, 1], [1, 1], [2, 0]] },
      { kind: "parallelogram", points: [[1, 1], [3, 1], [4, 2], [2, 2]] },
      { kind: "large", points: [[2, 2], [6, 2], [4, 4]] },
      { kind: "medium", points: [[6, 4], [4, 4], [6, 2]] },
    ],
  },
  {
    id: "pez",
    name: "Pez",
    pieces: [
      { kind: "small", points: [[1, 2], [1, 4], [0, 3]] },
      { kind: "medium", points: [[1, 4], [1, 2], [3, 4]] },
      { kind: "large", points: [[1, 4], [5, 4], [3, 6]] },
      { kind: "small", points: [[4, 3], [2, 3], [3, 2]] },
      { kind: "parallelogram", points: [[2, 3], [4, 3], [5, 4], [3, 4]] },
      { kind: "large", points: [[6, 1], [6, 5], [4, 3]] },
      { kind: "square", points: [[5, 4], [6, 5], [5, 6], [4, 5]] },
    ],
  },
];

/** Deduce la colocación que lleva la pieza local sobre los vértices dados. */
function fitPlacement(id: string, kind: TanKind, points: readonly Vertex[]): TanPlacement {
  const c = centroidOf(points);
  const target: Point[] = points.map(([x, y]) => ({ x, y }));
  const flips = kind === "parallelogram" ? [false, true] : [false];
  for (const flipped of flips) {
    for (let rotation = 0; rotation < 360; rotation += ROTATION_STEP) {
      const candidate: TanPlacement = { id, kind, x: c.x, y: c.y, rotation, flipped };
      if (sameVertexSet(polygonOf(candidate), target, FIT_EPSILON)) return candidate;
    }
  }
  throw new Error(`La pieza ${id} no encaja con los vértices indicados`);
}

function buildFigure(spec: FigureSpec): TangramFigure {
  const all: Point[] = spec.pieces.flatMap((p) => p.points.map(([x, y]) => ({ x, y })));
  const b = boundsOfPoints(all);
  // Centra la silueta en la zona de figuras.
  const dx = FIGURE_AREA.x + (FIGURE_AREA.width - b.width) / 2 - b.x;
  const dy = FIGURE_AREA.y + (FIGURE_AREA.height - b.height) / 2 - b.y;
  const counts: Partial<Record<TanKind, number>> = {};
  const solution = spec.pieces.map((piece) => {
    const n = (counts[piece.kind] ?? 0) + 1;
    counts[piece.kind] = n;
    const moved = piece.points.map(([x, y]): Vertex => [x + dx, y + dy]);
    return fitPlacement(`${piece.kind}-${n}`, piece.kind, moved);
  });
  return { id: spec.id, name: spec.name, solution };
}

export const FIGURES: readonly TangramFigure[] = FIGURE_SPECS.map(buildFigure);

/* ---------- Reserva ---------- */

const RESERVE_GAP = 0.5;
const RESERVE_ROWS: readonly (readonly string[])[] = [
  ["large-1", "large-2"],
  ["medium-1", "small-1", "small-2", "square-1"],
  ["parallelogram-1"],
];

/** Giro con el que cada pieza empieza en la reserva (el cuadrado a 45° queda apoyado en un lado). */
function reserveRotation(kind: TanKind): number {
  return kind === "square" ? 45 : 0;
}

/** Las 7 piezas repartidas en filas dentro de la zona de reserva, sin solaparse. */
export function initialLayout(): TanPlacement[] {
  const result: TanPlacement[] = [];
  let top = RESERVE_AREA.y + RESERVE_GAP / 2;
  for (const row of RESERVE_ROWS) {
    const items = row.flatMap((id) => {
      const entry = TAN_SET.find((t) => t.id === id);
      if (!entry) return [];
      const origin: TanPlacement = {
        id: entry.id,
        kind: entry.kind,
        x: 0,
        y: 0,
        rotation: reserveRotation(entry.kind),
        flipped: false,
      };
      return [{ origin, box: boundsOfPoints(polygonOf(origin)) }];
    });
    const rowWidth = items.reduce((sum, it) => sum + it.box.width, 0) + RESERVE_GAP * (items.length - 1);
    let left = RESERVE_AREA.x + (RESERVE_AREA.width - rowWidth) / 2;
    let rowHeight = 0;
    for (const { origin, box } of items) {
      result.push({ ...origin, x: left - box.x, y: top - box.y });
      left += box.width + RESERVE_GAP;
      rowHeight = Math.max(rowHeight, box.height);
    }
    top += rowHeight + RESERVE_GAP;
  }
  return result;
}
