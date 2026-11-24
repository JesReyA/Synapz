import type {
  BeadColor,
  BeadSection,
  BoardColumns,
  BreakdownTerm,
  CoachDifficulty,
  ColumnState,
  NepohualtzintzinChallenge,
} from "../types/nepohualtzintzin.ts";
import { newId, randInt } from "./random.ts";

export const COLUMN_COUNT = 13;
export const TOP_BEADS = 3;
export const BOTTOM_BEADS = 4;
export const TOP_VALUE = 5;
export const BASE = 20n;
/** Mayor valor representable: 19 en las 13 columnas = 20^13 − 1. */
export const MAX_VALUE = BASE ** BigInt(COLUMN_COUNT) - 1n;

/** De izquierda a derecha: 1 azul, 3 blancas, 3 amarillas, 3 blancas y 3 amarillas. */
export const COLUMN_COLORS: readonly BeadColor[] = [
  "blue",
  "white", "white", "white",
  "yellow", "yellow", "yellow",
  "white", "white", "white",
  "yellow", "yellow", "yellow",
];

export const emptyColumns = (): BoardColumns =>
  Array.from({ length: COLUMN_COUNT }, () => ({ top: 0, bottom: 0 }));

/** Potencia de 20 de una columna. La columna 0 (izquierda) es 20^12 y la última es 20^0. */
export const powerOf = (index: number): number => COLUMN_COUNT - 1 - index;

export const columnDigit = (c: ColumnState): number => c.top * TOP_VALUE + c.bottom;

export function boardValue(columns: BoardColumns): bigint {
  return columns.reduce((acc, c) => acc * BASE + BigInt(columnDigit(c)), 0n);
}

/** Convierte un valor a columnas. Devuelve null si no cabe en 13 columnas. */
export function valueToColumns(value: bigint): BoardColumns | null {
  if (value < 0n || value > MAX_VALUE) return null;
  const columns = emptyColumns();
  let rest = value;
  for (let i = COLUMN_COUNT - 1; i >= 0; i--) {
    const digit = Number(rest % BASE);
    rest /= BASE;
    columns[i] = { top: Math.floor(digit / TOP_VALUE), bottom: digit % TOP_VALUE };
  }
  return columns;
}

/**
 * Activa o desactiva en cascada. `k` cuenta desde la barra central (1 = la más cercana).
 * Si la cuenta está activa, se desactiva junto con las que quedan más lejos de la barra.
 * Si está inactiva, se activa junto con las que hay entre ella y la barra.
 */
export function toggleBead(columns: BoardColumns, index: number, section: BeadSection, k: number): BoardColumns {
  return columns.map((c, i) => {
    if (i !== index) return c;
    const active = c[section];
    return { ...c, [section]: k <= active ? k - 1 : k };
  });
}

/** Términos distintos de cero, del mayor al menor. */
export function breakdown(columns: BoardColumns): BreakdownTerm[] {
  return columns.flatMap((c, i) => {
    const digit = columnDigit(c);
    if (digit === 0) return [];
    const power = powerOf(i);
    return [{ power, digit, value: BigInt(digit) * BASE ** BigInt(power) }];
  });
}

export const formatBig = (n: bigint): string => n.toLocaleString("es-MX");

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};

/** "20¹²" */
export const powerLabel = (power: number): string =>
  `20${String(power).split("").map((d) => SUPERSCRIPT[d] ?? d).join("")}`;

/** Explica cómo formar un número, columna por columna (para guía y pistas). */
export function describeColumns(value: bigint): string[] {
  const columns = valueToColumns(value);
  if (!columns) return ["Este número no cabe en 13 columnas."];
  const terms = breakdown(columns);
  if (terms.length === 0) return ["Deja todas las cuentas separadas de la barra: es 0."];
  return terms.map((t) => {
    const top = Math.floor(t.digit / TOP_VALUE);
    const bottom = t.digit % TOP_VALUE;
    const parts = [
      top > 0 ? `${top} ${top === 1 ? "cuenta" : "cuentas"} de arriba (${top} × 5)` : "",
      bottom > 0 ? `${bottom} ${bottom === 1 ? "cuenta" : "cuentas"} de abajo (${bottom} × 1)` : "",
    ].filter(Boolean);
    return `Columna ${powerLabel(t.power)} (vale ${formatBig(BASE ** BigInt(t.power))}): ${t.digit} → ${parts.join(" y ")}.`;
  });
}

/** Descomposición en base 20 en una línea: "345 = 17 × 20 + 5". */
export function base20Equation(value: bigint): string {
  const terms = breakdown(valueToColumns(value) ?? []);
  if (terms.length === 0) return "0";
  const rhs = terms
    .map((t) => (t.power === 0 ? String(t.digit) : `${t.digit} × ${formatBig(BASE ** BigInt(t.power))}`))
    .join(" + ");
  return `${formatBig(value)} = ${rhs}`;
}

export function generateChallenge(difficulty: CoachDifficulty): NepohualtzintzinChallenge {
  const id = newId();
  if (difficulty === "basic") {
    const n = randInt(10, 399);
    return { id, difficulty, kind: "represent", prompt: `Representa el número ${n} en el tablero.`, target: BigInt(n) };
  }
  if (difficulty === "intermediate") {
    if (Math.random() < 0.5) {
      const a = randInt(20, 600);
      const b = randInt(10, 400);
      return { id, difficulty, kind: "add", prompt: `Calcula ${a} + ${b} y deja el resultado en el tablero.`, target: BigInt(a + b) };
    }
    const a = randInt(200, 900);
    const b = randInt(10, a - 1);
    return { id, difficulty, kind: "subtract", prompt: `Calcula ${a} − ${b} y deja el resultado en el tablero.`, target: BigInt(a - b) };
  }
  if (Math.random() < 0.5) {
    const a = randInt(11, 35);
    const b = randInt(3, 12);
    return { id, difficulty, kind: "multiply", prompt: `Calcula ${a} × ${b} y deja el resultado en el tablero.`, target: BigInt(a * b) };
  }
  const n = randInt(5, 60);
  return {
    id,
    difficulty,
    kind: "shift",
    prompt: `Calcula ${n} × 20 sin hacer la cuenta larga y deja el resultado en el tablero.`,
    target: BigInt(n * 20),
  };
}
