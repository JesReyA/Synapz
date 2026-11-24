import type { LucideIcon } from "lucide-react";
import type { ChallengeTone } from "../components/challenges/ChallengeCard.tsx";

export type GameId =
  | "batalla"
  | "calculo"
  | "sudoku"
  | "ajedrez"
  | "quince"
  | "buscaminas"
  | "tangram"
  | "tetris"
  | "memorama";

export type GameTileHeight = "short" | "medium" | "tall";

export interface GameInfo {
  id: GameId;
  title: string;
  /** Una frase. */
  description: string;
  icon: LucideIcon;
  tone: ChallengeTone;
  tags: readonly string[];
  /** Altura de la tarjeta en la cuadrícula Masonry. */
  height: GameTileHeight;
}
