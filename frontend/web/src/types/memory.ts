export type MemoryDifficulty = "facil" | "medio" | "dificil";

export interface MemoryCard {
  /** Posición original de la carta en la baraja mezclada (única). */
  id: number;
  /** Símbolo de 0 a SYMBOL_COUNT - 1. Cada símbolo aparece dos veces. */
  symbol: number;
  faceUp: boolean;
  /** Pareja encontrada. Estas cartas se quedan boca arriba. */
  matched: boolean;
}

export type MemoryStatus = "playing" | "won";

export interface MemoryState {
  /** Cartas en orden de filas: índice = fila * cols + columna. */
  cards: readonly MemoryCard[];
  /** Índice de la primera carta volteada del intento actual. */
  firstPick: number | null;
  /** No es nulo mientras se espera para ocultar el par fallido. */
  secondPick: number | null;
  attempts: number;
  pairsFound: number;
  totalPairs: number;
  status: MemoryStatus;
}
