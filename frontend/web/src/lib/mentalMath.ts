import type {
  LevelStat,
  LocalMentalQuestion,
  MentalAnswerRecord,
  MentalLevelConfig,
  MentalTestResult,
} from "../types/challenges.ts";
import { newId, pick, randInt } from "./random.ts";

/** Sumas primero. El diseño admite más operaciones añadiendo un `MathOperation`. */
export const LEVELS: readonly MentalLevelConfig[] = [
  { level: 1, label: "Sumas de un dígito", min: 1, max: 9, time_limit_ms: 8000, requires_carry: false },
  { level: 2, label: "Sumas hasta 40", min: 5, max: 20, time_limit_ms: 7000, requires_carry: false },
  { level: 3, label: "Dos dígitos", min: 10, max: 49, time_limit_ms: 6000, requires_carry: false },
  { level: 4, label: "Dos dígitos con llevadas", min: 25, max: 99, time_limit_ms: 5000, requires_carry: true },
  { level: 5, label: "Tres dígitos", min: 100, max: 499, time_limit_ms: 4500, requires_carry: true },
];

export const QUESTIONS_PER_LEVEL = 4;
/** Aciertos mínimos de un nivel para pasar al siguiente. */
export const MIN_CORRECT_TO_ADVANCE = 2;

export function makeQuestion(config: MentalLevelConfig): LocalMentalQuestion {
  let a = randInt(config.min, config.max);
  let b = randInt(config.min, config.max);
  if (config.requires_carry) {
    while ((a % 10) + (b % 10) < 10) {
      a = randInt(config.min, config.max);
      b = randInt(config.min, config.max);
    }
  }
  return {
    id: newId(),
    level: config.level,
    prompt: `${a} + ${b}`,
    time_limit_ms: config.time_limit_ms,
    answer: a + b,
  };
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

function tipsFor(accuracy: number, avgMs: number): string[] {
  const tips: string[] = [];
  if (accuracy < 0.6) {
    tips.push("Baja el ritmo y asegura la respuesta: la exactitud va antes que la velocidad.");
    tips.push("Descompón: 38 + 27 = 38 + 20 + 7 = 58 + 7 = 65.");
  } else if (avgMs > 4500) {
    tips.push("Ya aciertas. Para ganar velocidad, suma primero las decenas y después las unidades.");
    tips.push("Redondea a la decena más cercana: 49 + 26 = 50 + 26 − 1 = 75.");
  } else {
    tips.push("Muy buen ritmo. Prueba sumar de izquierda a derecha, como se dice en voz alta.");
    tips.push("Busca parejas que sumen 10 (3 + 7, 4 + 6) para ir más rápido.");
  }
  tips.push("Practica unos minutos al día: la fluidez mejora con repetición corta y constante.");
  return tips;
}

const EXAMPLES: readonly string[] = [
  "Sumar los precios de tu comida mientras haces fila en la cooperativa.",
  "Calcular cuántos puntos llevas en un videojuego sin mirar el marcador.",
  "Saber cuánto cambio te deben al pagar con un billete.",
  "Sumar los minutos de dos trayectos para llegar a tiempo a clase.",
  "Contar cuántos jugadores hay entre dos equipos.",
];

/** Equivale a `finish` de `POST /api/math/mental-test`. Tips y ejemplos son locales (mock). */
export function buildMentalResult(testId: string, records: MentalAnswerRecord[]): MentalTestResult {
  const perLevel: LevelStat[] = LEVELS.flatMap((cfg) => {
    const rows = records.filter((r) => r.level === cfg.level);
    if (rows.length === 0) return [];
    return [
      {
        level: cfg.level,
        correct: rows.filter((r) => r.correct).length,
        total: rows.length,
        avg_ms: average(rows.map((r) => r.response_ms)),
      },
    ];
  });
  const total = records.length;
  const correct = records.filter((r) => r.correct).length;
  const accuracy = total === 0 ? 0 : correct / total;
  const maxLevel = perLevel.reduce((m, l) => Math.max(m, l.level), 0);
  const avgMs = average(records.map((r) => r.response_ms));
  const score = Math.round(100 * (0.7 * accuracy + 0.3 * (maxLevel / LEVELS.length)));
  const examples = [pick(EXAMPLES)];
  for (const e of EXAMPLES) {
    if (examples.length >= 3) break;
    if (!examples.includes(e)) examples.push(e);
  }
  return {
    test_id: testId,
    score,
    accuracy,
    avg_response_ms: avgMs,
    max_level_reached: maxLevel,
    per_level: perLevel,
    tips: tipsFor(accuracy, avgMs),
    everyday_examples: examples,
  };
}
