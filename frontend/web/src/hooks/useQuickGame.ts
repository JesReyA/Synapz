import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { scoreForAnswer } from "../lib/quickGame.ts";
import { useReportOutcome } from "./useReportOutcome.ts";
import { fetchQuickGame, submitQuickGame } from "../services/mockChallenges.ts";
import type {
  LocalQuickGame,
  QuickGameSummary,
  SubmitQuickGameRequest,
  SubmitQuickGameResponse,
} from "../types/challenges.ts";

export type QuickGamePhase = "idle" | "loading" | "playing" | "finished";

export interface AnswerFeedback {
  chosen: 0 | 1;
  correct: boolean;
  gained: number;
}

interface Stats {
  points: number;
  correct: number;
  combo: number;
  bestCombo: number;
  answers: SubmitQuickGameRequest["answers"];
}

const EMPTY_STATS: Stats = { points: 0, correct: 0, combo: 0, bestCombo: 0, answers: [] };
const FEEDBACK_MS = 550;
const TICK_MS = 100;

export function useQuickGame(classroomId: string) {
  const [phase, setPhase] = useState<QuickGamePhase>("idle");
  const [game, setGame] = useState<LocalQuickGame | null>(null);
  const [index, setIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [result, setResult] = useState<SubmitQuickGameResponse | null>(null);

  const statsRef = useRef<Stats>(EMPTY_STATS);
  const startedAtRef = useRef(0);
  const questionStartRef = useRef(0);
  const finishedRef = useRef(true);
  useReportOutcome(phase === "finished", () => {
    const answers = statsRef.current.answers;
    const totalMs = answers.reduce((sum, a) => sum + a.response_ms, 0);
    return {
      level: null,
      completed: true,
      metrics: {
        correct: statsRef.current.correct,
        total: answers.length,
        avg_response_ms: answers.length === 0 ? 0 : Math.round(totalMs / answers.length),
        best_combo: statsRef.current.bestCombo,
      },
    };
  });

  const finish = useEffectEvent((activeGame: LocalQuickGame) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const s = statsRef.current;
    const summary: QuickGameSummary = {
      game_id: activeGame.game_id,
      points: s.points,
      correct: s.correct,
      total: s.answers.length,
      best_combo: s.bestCombo,
      duration_ms: Math.min(activeGame.duration_seconds * 1000, Date.now() - startedAtRef.current),
      answers: s.answers,
    };
    setPhase("finished");
    void submitQuickGame(summary).then(setResult);
  });

  const start = useCallback(async () => {
    setPhase("loading");
    const next = await fetchQuickGame(classroomId);
    statsRef.current = EMPTY_STATS;
    setStats(EMPTY_STATS);
    setGame(next);
    setIndex(0);
    setFeedback(null);
    setResult(null);
    setRemainingMs(next.duration_seconds * 1000);
    startedAtRef.current = Date.now();
    questionStartRef.current = Date.now();
    finishedRef.current = false;
    setPhase("playing");
  }, [classroomId]);

  // Reloj de la partida.
  useEffect(() => {
    if (phase !== "playing" || !game) return;
    const endsAt = startedAtRef.current + game.duration_seconds * 1000;
    const id = window.setInterval(() => {
      const left = Math.max(0, endsAt - Date.now());
      setRemainingMs(left);
      if (left === 0) finish(game);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase, game]);

  // Pasa a la siguiente pregunta tras mostrar el resultado.
  useEffect(() => {
    if (!feedback || !game) return;
    const id = window.setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= game.questions.length) {
        finish(game);
      } else {
        setIndex(index + 1);
        questionStartRef.current = Date.now();
      }
    }, FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [feedback, game, index]);

  const answer = useCallback(
    (choice: 0 | 1) => {
      if (phase !== "playing" || feedback || !game) return;
      const question = game.questions[index];
      if (!question) return;
      const responseMs = Date.now() - questionStartRef.current;
      const correct = choice === question.correct_index;
      const prev = statsRef.current;
      const combo = correct ? prev.combo + 1 : 0;
      const gained = correct ? scoreForAnswer(responseMs, combo) : 0;
      const next: Stats = {
        points: prev.points + gained,
        correct: prev.correct + (correct ? 1 : 0),
        combo,
        bestCombo: Math.max(prev.bestCombo, combo),
        answers: [...prev.answers, { question_id: question.id, choice_index: choice, response_ms: responseMs }],
      };
      statsRef.current = next;
      setStats(next);
      setFeedback({ chosen: choice, correct, gained });
    },
    [phase, feedback, game, index],
  );

  return {
    phase,
    game,
    question: game?.questions[index] ?? null,
    index,
    remainingMs,
    stats,
    feedback,
    result,
    start,
    answer,
  };
}
