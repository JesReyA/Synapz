import type { MemoryCard, MemoryDifficulty, MemoryState } from "../../types/memory.ts";
import { shuffle } from "../random.ts";

export const MEMORY_LEVELS: Record<MemoryDifficulty, { rows: number; cols: number }> = {
  facil: { rows: 3, cols: 4 }, // 6 pares
  medio: { rows: 4, cols: 4 }, // 8 pares
  dificil: { rows: 4, cols: 6 }, // 12 pares
};

/** Símbolos distintos máximos (los del nivel difícil). */
export const SYMBOL_COUNT = 12;

/** Tiempo que se muestra un par fallido antes de ocultarlo. */
export const MISMATCH_DELAY_MS = 900;

/** Partida nueva: cada símbolo dos veces, mezclado y todo boca abajo. */
export function createMemory(difficulty: MemoryDifficulty): MemoryState {
  const { rows, cols } = MEMORY_LEVELS[difficulty];
  const totalPairs = (rows * cols) / 2;
  const symbols: number[] = [];
  for (let s = 0; s < totalPairs; s++) symbols.push(s, s);
  const cards: MemoryCard[] = shuffle(symbols).map((symbol, id) => ({
    id,
    symbol,
    faceUp: false,
    matched: false,
  }));
  return {
    cards,
    firstPick: null,
    secondPick: null,
    attempts: 0,
    pairsFound: 0,
    totalPairs,
    status: "playing",
  };
}

/** Hay un par fallido boca arriba esperando `resolveMismatch`. */
export function isLocked(state: MemoryState): boolean {
  return state.secondPick !== null;
}

function withCards(
  cards: readonly MemoryCard[],
  indexes: readonly number[],
  patch: Partial<Pick<MemoryCard, "faceUp" | "matched">>,
): MemoryCard[] {
  return cards.map((card, i) => (indexes.includes(i) ? { ...card, ...patch } : card));
}

export function flip(state: MemoryState, index: number): MemoryState {
  if (state.status === "won" || isLocked(state)) return state;
  if (!Number.isInteger(index) || index < 0 || index >= state.cards.length) return state;
  const card = state.cards[index] as MemoryCard;
  if (card.faceUp || card.matched) return state;

  if (state.firstPick === null) {
    return { ...state, cards: withCards(state.cards, [index], { faceUp: true }), firstPick: index };
  }

  const first = state.cards[state.firstPick] as MemoryCard;
  const attempts = state.attempts + 1;

  if (first.symbol !== card.symbol) {
    return {
      ...state,
      cards: withCards(state.cards, [index], { faceUp: true }),
      secondPick: index,
      attempts,
    };
  }

  const pairsFound = state.pairsFound + 1;
  return {
    ...state,
    cards: withCards(state.cards, [state.firstPick, index], { faceUp: true, matched: true }),
    firstPick: null,
    secondPick: null,
    attempts,
    pairsFound,
    status: pairsFound === state.totalPairs ? "won" : "playing",
  };
}

/** Oculta el par fallido. Sin par pendiente devuelve el mismo estado. */
export function resolveMismatch(state: MemoryState): MemoryState {
  if (state.firstPick === null || state.secondPick === null) return state;
  return {
    ...state,
    cards: withCards(state.cards, [state.firstPick, state.secondPick], { faceUp: false }),
    firstPick: null,
    secondPick: null,
  };
}
