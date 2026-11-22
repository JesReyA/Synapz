import type { LocalQuickGame, LocalQuickQuestion } from "../types/challenges.ts";
import { newId, pick, randInt, shuffle } from "./random.ts";

export const QUICK_GAME_SECONDS = 45;
const BASE_POINTS = 100;
const SPEED_BONUS_MAX = 50;
const SPEED_WINDOW_MS = 5000;

/** Temas de ejemplo de la clase (mock). En producción vienen del temario del profesor. */
const TOPIC_BANK: readonly { prompt: string; correct: string; wrong: string }[] = [
  { prompt: "¿Qué fracción equivale a 2/4?", correct: "1/2", wrong: "2/8" },
  { prompt: "¿Cuánto es 1/2 + 1/4?", correct: "3/4", wrong: "2/6" },
  { prompt: "¿Cuál es mayor?", correct: "3/4", wrong: "2/4" },
  { prompt: "Simplifica 6/8", correct: "3/4", wrong: "2/3" },
  { prompt: "¿Cuánto es 1/3 de 12?", correct: "4", wrong: "3" },
  { prompt: "En 5/5, ¿cuántos enteros hay?", correct: "1", wrong: "5" },
];

function place(prompt: string, correct: string, wrong: string, source: LocalQuickQuestion["source"]) {
  const correctIndex: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
  const options: [string, string] = correctIndex === 0 ? [correct, wrong] : [wrong, correct];
  return { id: newId(), prompt, options, source, correct_index: correctIndex };
}

function basicQuestion(): LocalQuickQuestion {
  const kind = randInt(0, 2);
  let prompt: string;
  let answer: number;
  if (kind === 0) {
    const a = randInt(6, 59);
    const b = randInt(6, 39);
    prompt = `${a} + ${b}`;
    answer = a + b;
  } else if (kind === 1) {
    const a = randInt(30, 99);
    const b = randInt(6, 29);
    prompt = `${a} − ${b}`;
    answer = a - b;
  } else {
    const a = randInt(3, 12);
    const b = randInt(3, 12);
    prompt = `${a} × ${b}`;
    answer = a * b;
  }
  const delta = pick([-10, -2, -1, 1, 2, 10]);
  const wrong = answer + delta;
  return place(`${prompt} = ?`, String(answer), String(wrong), "basic_operation");
}

function topicQuestion(): LocalQuickQuestion {
  const item = pick(TOPIC_BANK);
  return place(item.prompt, item.correct, item.wrong, "class_topic");
}

/** Equivale a `GET /api/math/quick-game`, pero generado en el cliente. */
export function buildQuickGame(count = 14): LocalQuickGame {
  const questions = shuffle(
    Array.from({ length: count }, (_, i) => ((i + 1) % 4 === 0 ? topicQuestion() : basicQuestion())),
  );
  return { game_id: newId(), duration_seconds: QUICK_GAME_SECONDS, questions };
}

/** Multiplicador por acierto consecutivo: x1 → x3 (tope). */
export function comboMultiplier(combo: number): number {
  return Math.min(3, 1 + Math.floor(combo / 3) * 0.5);
}

/** `combo` incluye el acierto actual. */
export function scoreForAnswer(responseMs: number, combo: number): number {
  const speed = Math.max(0, 1 - responseMs / SPEED_WINDOW_MS);
  const base = BASE_POINTS + Math.round(SPEED_BONUS_MAX * speed);
  return Math.round(base * comboMultiplier(combo));
}
