import { useCallback, useState } from "react";
import { isSolved, moveByDirection, moveTile, shuffledBoard } from "../lib/games/slidingPuzzle.ts";
import type { SlideBoard, SlideDirection } from "../types/slidingPuzzle.ts";
import { useGameTimer } from "./useGameTimer.ts";

interface PuzzleState {
  board: SlideBoard;
  moves: number;
}

function newGame(): PuzzleState {
  return { board: shuffledBoard(), moves: 0 };
}

/** Un movimiento solo cuenta si cambia el tablero; con la partida ganada no hace nada. */
function applyMove(state: PuzzleState, next: (board: SlideBoard) => SlideBoard): PuzzleState {
  if (isSolved(state.board)) return state;
  const board = next(state.board);
  return board === state.board ? state : { board, moves: state.moves + 1 };
}

export interface SlidingPuzzleApi {
  board: SlideBoard;
  moves: number;
  started: boolean;
  won: boolean;
  elapsed: number;
  tapTile: (index: number) => void;
  move: (dir: SlideDirection) => void;
  reset: () => void;
}

export function useSlidingPuzzle(): SlidingPuzzleApi {
  const [game, setGame] = useState<PuzzleState>(newGame);

  const won = isSolved(game.board);
  const started = game.moves > 0;
  const { elapsed, reset: resetTimer } = useGameTimer(started && !won);

  const tapTile = useCallback((index: number) => {
    setGame((prev) => applyMove(prev, (board) => moveTile(board, index)));
  }, []);

  const move = useCallback((dir: SlideDirection) => {
    setGame((prev) => applyMove(prev, (board) => moveByDirection(board, dir)));
  }, []);

  const reset = useCallback(() => {
    setGame(newGame());
    resetTimer();
  }, [resetTimer]);

  return { board: game.board, moves: game.moves, started, won, elapsed, tapTile, move, reset };
}
