import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import {
  LEVELS,
  MIN_CORRECT_TO_ADVANCE,
  QUESTIONS_PER_LEVEL,
  buildMentalResult,
  makeQuestion,
} from "../lib/mentalMath.ts";
import { newId } from "../lib/random.ts";
import type { LocalMentalQuestion, MentalAnswerRecord, MentalTestResult } from "../types/challenges.ts";

export type MentalPhase = "intro" | "question" | "feedback" | "result";

export interface MentalOutcome {
  correct: boolean;
  timedOut: boolean;
  correctAnswer: number;
}

const TICK_MS = 50;
const FEEDBACK_MS = 900;

export function useMentalTrainer() {
  const [phase, setPhase] = useState<MentalPhase>("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [asked, setAsked] = useState(0);
  const [question, setQuestion] = useState<LocalMentalQuestion | null>(null);
  const [records, setRecords] = useState<MentalAnswerRecord[]>([]);
  const [remainingMs, setRemainingMs] = useState(0);
  const [outcome, setOutcome] = useState<MentalOutcome | null>(null);
  const [result, setResult] = useState<MentalTestResult | null>(null);

  const testIdRef = useRef("");
  const questionStartRef = useRef(0);

  const level = LEVELS[levelIdx] ?? LEVELS[0];

  const beginQuestion = useCallback((levelIndex: number) => {
    const cfg = LEVELS[levelIndex] ?? LEVELS[0];
    if (!cfg) return;
    setQuestion(makeQuestion(cfg));
    setRemainingMs(cfg.time_limit_ms);
    setOutcome(null);
    questionStartRef.current = Date.now();
    setPhase("question");
  }, []);

  const start = useCallback(() => {
    testIdRef.current = newId();
    setRecords([]);
    setResult(null);
    setLevelIdx(0);
    setAsked(1);
    beginQuestion(0);
  }, [beginQuestion]);

  const submit = useCallback(
    (value: number | null) => {
    if (phase !== "question" || !question) return;
    const timedOut = value === null;
    const correct = !timedOut && value === question.answer;
    const record: MentalAnswerRecord = {
      level: question.level,
      correct,
      response_ms: timedOut ? question.time_limit_ms : Math.min(question.time_limit_ms, Date.now() - questionStartRef.current),
    };
    setRecords((prev) => [...prev, record]);
    setOutcome({ correct, timedOut, correctAnswer: question.answer });
    setPhase("feedback");
    },
    [phase, question],
  );

  const onTimeout = useEffectEvent(() => submit(null));

  // Cuenta regresiva por pregunta.
  useEffect(() => {
    if (phase !== "question" || !question) return;
    const endsAt = questionStartRef.current + question.time_limit_ms;
    const id = window.setInterval(() => {
      const left = Math.max(0, endsAt - Date.now());
      setRemainingMs(left);
      if (left === 0) onTimeout();
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase, question]);

  const advance = useEffectEvent(() => {
    const inLevel = records.filter((r) => r.level === level?.level);
    const correctInLevel = inLevel.filter((r) => r.correct).length;
    if (asked < QUESTIONS_PER_LEVEL) {
      setAsked(asked + 1);
      beginQuestion(levelIdx);
      return;
    }
    const canAdvance = correctInLevel >= MIN_CORRECT_TO_ADVANCE && levelIdx < LEVELS.length - 1;
    if (canAdvance) {
      setLevelIdx(levelIdx + 1);
      setAsked(1);
      beginQuestion(levelIdx + 1);
      return;
    }
    setResult(buildMentalResult(testIdRef.current, records));
    setPhase("result");
  });

  useEffect(() => {
    if (phase !== "feedback") return;
    const id = window.setTimeout(() => advance(), FEEDBACK_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  return {
    phase,
    level,
    levelCount: LEVELS.length,
    asked,
    questionsPerLevel: QUESTIONS_PER_LEVEL,
    question,
    remainingMs,
    outcome,
    result,
    start,
    submit,
  };
}
