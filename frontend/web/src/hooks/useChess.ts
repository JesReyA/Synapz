import { useCallback, useMemo, useState } from "react";
import { applyMove, initialState, isInCheck, legalMoves, statusOf } from "../lib/games/chess.ts";
import type { ChessState, ChessStatus, Move, PromotionPiece, Square } from "../types/chess.ts";

export interface PendingPromotion {
  from: Square;
  to: Square;
}

export interface ChessUiState {
  game: ChessState;
  selected: Square | null;
  pendingPromotion: PendingPromotion | null;
}

export function createChessUi(): ChessUiState {
  return { game: initialState(), selected: null, pendingPromotion: null };
}

/**
 * Toque en una casilla. Con la partida terminada o una promoción pendiente no hace nada.
 * Solo llama a `applyMove` con movimientos tomados de `legalMoves`.
 */
export function tapReducer(state: ChessUiState, sq: Square): ChessUiState {
  if (state.pendingPromotion !== null) return state;
  const { game, selected } = state;
  if (statusOf(game).kind !== "playing") return state;

  const piece = game.board[sq];
  const isOwn = piece !== null && piece !== undefined && piece.color === game.turn;

  if (selected !== null) {
    const moves = legalMoves(game, selected).filter((m) => m.to === sq);
    if (moves.length > 0) {
      if (moves.some((m) => m.promotion !== undefined)) {
        return { ...state, pendingPromotion: { from: selected, to: sq } };
      }
      return { game: applyMove(game, moves[0]), selected: null, pendingPromotion: null };
    }
    if (isOwn && sq !== selected) return { ...state, selected: sq };
    return { ...state, selected: null };
  }

  return isOwn ? { ...state, selected: sq } : state;
}

/** Completa la promoción pendiente con la pieza elegida. */
export function promoteReducer(state: ChessUiState, piece: PromotionPiece): ChessUiState {
  const pending = state.pendingPromotion;
  if (pending === null) return state;
  const move: Move = { from: pending.from, to: pending.to, promotion: piece };
  return { game: applyMove(state.game, move), selected: null, pendingPromotion: null };
}

export function cancelPromotionReducer(state: ChessUiState): ChessUiState {
  return state.pendingPromotion === null ? state : { ...state, selected: null, pendingPromotion: null };
}

export interface ChessApi {
  game: ChessState;
  selected: Square | null;
  pendingPromotion: PendingPromotion | null;
  status: ChessStatus;
  /** Partida terminada (mate o tablas). */
  ended: boolean;
  /** Destinos legales de la pieza seleccionada. */
  targets: ReadonlySet<Square>;
  /** Casilla del rey en jaque del jugador en turno, o null. */
  checkSquare: Square | null;
  lastMove: Move | null;
  tapSquare: (sq: Square) => void;
  choosePromotion: (piece: PromotionPiece) => void;
  cancelPromotion: () => void;
  reset: () => void;
}

export function useChess(): ChessApi {
  const [ui, setUi] = useState<ChessUiState>(createChessUi);
  const { game, selected, pendingPromotion } = ui;

  const status = useMemo(() => statusOf(game), [game]);

  const targets = useMemo<ReadonlySet<Square>>(
    () => (selected === null ? new Set<Square>() : new Set(legalMoves(game, selected).map((m) => m.to))),
    [game, selected],
  );

  const checkSquare = useMemo<Square | null>(() => {
    if (!isInCheck(game, game.turn)) return null;
    const index = game.board.findIndex((p) => p !== null && p.type === "k" && p.color === game.turn);
    return index >= 0 ? index : null;
  }, [game]);

  const lastMove = game.history.length > 0 ? game.history[game.history.length - 1].move : null;

  const tapSquare = useCallback((sq: Square) => setUi((prev) => tapReducer(prev, sq)), []);
  const choosePromotion = useCallback(
    (piece: PromotionPiece) => setUi((prev) => promoteReducer(prev, piece)),
    [],
  );
  const cancelPromotion = useCallback(() => setUi((prev) => cancelPromotionReducer(prev)), []);
  const reset = useCallback(() => setUi(createChessUi()), []);

  return {
    game,
    selected,
    pendingPromotion,
    status,
    ended: status.kind !== "playing",
    targets,
    checkSquare,
    lastMove,
    tapSquare,
    choosePromotion,
    cancelPromotion,
    reset,
  };
}
