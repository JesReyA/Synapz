import type { ComponentType } from "react";
import { MOCK_CLASSROOM_ID } from "../../services/mockChallenges.ts";
import type { GameId } from "../../types/games.ts";
import { LogicSudokuCard } from "../challenges/LogicSudokuCard.tsx";
import { MentalMathTrainer } from "../challenges/MentalMathTrainer.tsx";
import { QuickBattleGame } from "../challenges/QuickBattleGame.tsx";
import { ChessGame } from "./ChessGame.tsx";
import { MemoryGame } from "./MemoryGame.tsx";
import { MinesweeperGame } from "./MinesweeperGame.tsx";
import { SlidingPuzzleGame } from "./SlidingPuzzleGame.tsx";
import { TangramGame } from "./TangramGame.tsx";
import { TetrisGame } from "./TetrisGame.tsx";

function QuickBattle() {
  return <QuickBattleGame classroomId={MOCK_CLASSROOM_ID} />;
}

/** Componente de cada juego. El tipo obliga a cubrir los 9 ids. */
export const GAME_COMPONENTS: Record<GameId, ComponentType> = {
  batalla: QuickBattle,
  calculo: MentalMathTrainer,
  sudoku: LogicSudokuCard,
  ajedrez: ChessGame,
  quince: SlidingPuzzleGame,
  buscaminas: MinesweeperGame,
  tangram: TangramGame,
  tetris: TetrisGame,
  memorama: MemoryGame,
};
