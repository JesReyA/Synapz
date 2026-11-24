/** Tipos del módulo Nepohualtzintzin. Todo se calcula en el cliente; no hay endpoints. */

export type BeadColor = "blue" | "white" | "yellow";
export type BeadSection = "top" | "bottom";

/** Cuentas activas (pegadas a la barra central) de una columna. */
export interface ColumnState {
  top: number; // 0-3, cada una vale 5
  bottom: number; // 0-4, cada una vale 1
}

/** 13 columnas, de izquierda (20^12) a derecha (20^0). */
export type BoardColumns = ColumnState[];

export interface BreakdownTerm {
  power: number;
  digit: number; // 1-19
  value: bigint; // digit × 20^power
}

export type CoachDifficulty = "basic" | "intermediate" | "advanced";
export type ChallengeKind = "represent" | "add" | "subtract" | "multiply" | "shift";

export interface NepohualtzintzinChallenge {
  id: string;
  difficulty: CoachDifficulty;
  kind: ChallengeKind;
  /** Instrucción que ve el alumno. */
  prompt: string;
  /** Valor que debe quedar en el tablero. */
  target: bigint;
}

export type CoachStatus = "idle" | "running" | "solved";

export interface CoachFeedback {
  tone: "wrong" | "hint";
  lines: string[];
}
