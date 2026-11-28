import type { ComponentType } from "react";
import type { GameId } from "../../types/games.ts";
import { LogicSudokuCard } from "../challenges/LogicSudokuCard.tsx";
import { MentalMathTrainer } from "../challenges/MentalMathTrainer.tsx";
import { ChessGame } from "./ChessGame.tsx";
import { MemoryGame } from "./MemoryGame.tsx";
import { MinesweeperGame } from "./MinesweeperGame.tsx";
import { QuickBattleEntry } from "./QuickBattleEntry.tsx";
import { SlidingPuzzleGame } from "./SlidingPuzzleGame.tsx";
import { TangramGame } from "./TangramGame.tsx";
import { TetrisGame } from "./TetrisGame.tsx";
import { withAdaptiveGame } from "./withAdaptiveGame.tsx";

/**
 * Componente de cada juego. El tipo obliga a cubrir los 9 ids.
 * El ajedrez es de dos jugadores en el mismo dispositivo: no mide a un alumno y no se envuelve.
 */
export const GAME_COMPONENTS: Record<GameId, ComponentType> = {
  batalla: withAdaptiveGame("batalla", QuickBattleEntry),
  calculo: withAdaptiveGame("calculo", MentalMathTrainer),
  sudoku: withAdaptiveGame("sudoku", LogicSudokuCard),
  ajedrez: ChessGame,
  quince: withAdaptiveGame("quince", SlidingPuzzleGame),
  buscaminas: withAdaptiveGame("buscaminas", MinesweeperGame),
  tangram: withAdaptiveGame("tangram", TangramGame),
  tetris: withAdaptiveGame("tetris", TetrisGame),
  memorama: withAdaptiveGame("memorama", MemoryGame),
};
