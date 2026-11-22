// Tipos de la sección Retos.
// Los tipos de §2.6 y §2.7 reflejan API_CONTRACT.md campo por campo.
// Los tipos "Local*" y los de ranking, racha y sudoku son solo del cliente (datos mock).

/* ---------- Contrato: juego rápido (§2.7) ---------- */

export interface QuickGameQuestion {
  id: string;
  prompt: string;
  options: [string, string]; // exactamente 2 opciones
  source: "basic_operation" | "class_topic";
}

export interface QuickGameResponse {
  game_id: string;
  duration_seconds: number; // reloj de la partida
  questions: QuickGameQuestion[];
}

export interface SubmitQuickGameRequest {
  game_id: string;
  answers: { question_id: string; choice_index: 0 | 1; response_ms: number }[];
}

export interface SubmitQuickGameResponse {
  points: number;
  correct: number;
  total: number;
  rank: number; // posición actual en el aula
}

/** Pregunta con la clave de respuesta. Solo existe en el mock: en producción el servidor corrige. */
export interface LocalQuickQuestion extends QuickGameQuestion {
  correct_index: 0 | 1;
}

export interface LocalQuickGame extends Omit<QuickGameResponse, "questions"> {
  questions: LocalQuickQuestion[];
}

export interface QuickGameSummary {
  game_id: string;
  points: number;
  correct: number;
  total: number;
  best_combo: number;
  duration_ms: number;
  answers: SubmitQuickGameRequest["answers"];
}

/** Fila del ranking del aula (derivada de `math_game_scores`). */
export interface LeaderboardEntry {
  student_id: string;
  name: string;
  points: number;
  is_me: boolean;
}

/* ---------- Contrato: cálculo mental (§2.6) ---------- */

export type MathOperation = "addition"; // ampliable: "subtraction" | "multiplication" | "division"

export interface MentalQuestion {
  id: string;
  level: number; // 1..N, la dificultad sube
  prompt: string; // "17 + 8"
  time_limit_ms: number; // baja con el nivel
}

export interface LevelStat {
  level: number;
  correct: number;
  total: number;
  avg_ms: number;
}

export interface MentalTestResult {
  test_id: string;
  score: number; // 0-100
  accuracy: number; // 0-1
  avg_response_ms: number;
  max_level_reached: number;
  per_level: LevelStat[];
  tips: string[];
  everyday_examples: string[];
}

/** Pregunta con respuesta. Solo existe en el mock: en producción el servidor corrige. */
export interface LocalMentalQuestion extends MentalQuestion {
  answer: number;
}

export interface MentalAnswerRecord {
  level: number;
  correct: boolean;
  response_ms: number;
}

export interface MentalLevelConfig {
  level: number;
  label: string;
  min: number;
  max: number;
  time_limit_ms: number;
  requires_carry: boolean;
}

/* ---------- Sudoku (solo cliente) ---------- */

export type SudokuSize = 6 | 9;
export type SudokuDifficulty = "facil" | "medio" | "dificil";

export interface SudokuGeometry {
  size: SudokuSize;
  boxRows: number;
  boxCols: number;
}

export interface SudokuPuzzle extends SudokuGeometry {
  id: string;
  difficulty: SudokuDifficulty;
  /** Tablero inicial en orden de filas. 0 = celda vacía. */
  cells: number[];
  solution: number[];
}

/* ---------- Rachas y amigos (solo cliente) ---------- */

export interface StreakDay {
  label: string;
  active: boolean;
  today: boolean;
}

export interface StreakInfo {
  current: number;
  best: number;
  week: StreakDay[];
}

export interface FriendWeekly {
  id: string;
  name: string;
  weekly_points: number;
  is_me: boolean;
}
