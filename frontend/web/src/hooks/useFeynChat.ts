import { useCallback, useEffect, useRef, useState } from "react";
import { matchTopic } from "../lib/feynTopics.ts";
import { FeynApiError, sendExplanationToFeyn } from "../services/feynApi.ts";
import type { FeynTopicContext } from "../types/classes.ts";
import type { ChatMessage } from "../types/feyn.ts";

/** Dominio demostrado a partir del cual, sin conceptos faltantes, el tema queda dominado (§2.5). */
export const MASTERED_FROM = 85;

/** Máximo de caracteres de explicación acumulada que se envían (se conservan los más recientes). */
const MAX_EXPLANATION_CHARS = 6000;

export interface Mastery {
  score: number; // 0-100
  missing: string[];
  mastered: boolean;
}

const GREETING =
  "¡Hola! Soy Feyn, tu compañero de estudio. Aprendo mejor cuando alguien me explica. Cuando quieras, dime qué tema quieres explicarme o elige uno de la lista.";

const NOT_FOUND =
  "Todavía no sé qué tema quieres explicarme. Dime su nombre, por ejemplo «quiero explicarte fracciones», o elige uno de la lista.";

const ASK_AGAIN = "Claro. ¿Qué tema quieres explicarme ahora?";

const startFrom = (topic: FeynTopicContext) =>
  `¡Hola! Quiero aprender "${topic.title}". Explícamelo con tus propias palabras, como si yo no supiera nada. Yo te haré preguntas.`;

const chosen = (topic: FeynTopicContext) =>
  `¡Perfecto! Vamos con "${topic.title}". Explícamelo con tus propias palabras, como si yo no supiera nada. Yo te haré preguntas.`;

/** Une los mensajes del alumno para que Feyn evalúe toda la explicación y no solo el último turno. */
function joinExplanation(turns: string[]): string {
  const all = turns.join("\n\n");
  return all.length > MAX_EXPLANATION_CHARS ? all.slice(all.length - MAX_EXPLANATION_CHARS) : all;
}

/**
 * Estado del chat con Feyn.
 * Sin tema, Feyn solo saluda y pregunta qué tema quiere escuchar; no evalúa nada.
 * El tema llega desde "Enséñale a Feyn" (`initialTopic`) o se elige dentro del chat (`catalog`).
 */
export function useFeynChat(initialTopic: FeynTopicContext | null, catalog: FeynTopicContext[]) {
  const [topic, setTopic] = useState<FeynTopicContext | null>(initialTopic);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 0, role: "feyn", text: initialTopic ? startFrom(initialTopic) : GREETING },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mastery, setMastery] = useState<Mastery | null>(null);

  const turnsRef = useRef<string[]>([]);
  const idRef = useRef(1);
  const abortRef = useRef<AbortController | null>(null);

  const material = topic?.teacher_material?.trim() ?? "";
  const hasMaterial = material !== "";

  useEffect(() => () => abortRef.current?.abort(), []);

  const pushMessage = useCallback((role: ChatMessage["role"], text: string) => {
    setMessages((prev) => [...prev, { id: idRef.current++, role, text }]);
  }, []);

  const resetEvaluation = useCallback(() => {
    abortRef.current?.abort();
    turnsRef.current = [];
    setMastery(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const selectTopic = useCallback(
    (next: FeynTopicContext) => {
      resetEvaluation();
      setTopic(next);
      pushMessage("feyn", chosen(next));
    },
    [resetEvaluation, pushMessage],
  );

  const changeTopic = useCallback(() => {
    resetEvaluation();
    setTopic(null);
    pushMessage("feyn", ASK_AGAIN);
  }, [resetEvaluation, pushMessage]);

  const run = useCallback(async () => {
    if (!topic || !hasMaterial || turnsRef.current.length === 0) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(null);
    try {
      const result = await sendExplanationToFeyn(
        { topic_title: topic.title, teacher_material: material, student_explanation: joinExplanation(turnsRef.current) },
        controller.signal,
      );
      pushMessage("feyn", result.reply);
      setMastery({
        score: result.mastery_score,
        missing: result.missing_concepts,
        mastered: result.mastery_score >= MASTERED_FROM && result.missing_concepts.length === 0,
      });
    } catch (err) {
      if (err instanceof FeynApiError && err.code === "ABORTED") return;
      setError(err instanceof FeynApiError ? err.message : "No pude responder. Intenta de nuevo.");
    } finally {
      if (abortRef.current === controller) setIsLoading(false);
    }
  }, [topic, hasMaterial, material, pushMessage]);

  const send = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value || isLoading || (topic && !hasMaterial)) return;
      pushMessage("student", value);

      if (!topic) {
        const found = matchTopic(value, catalog);
        if (found) selectTopic(found);
        else pushMessage("feyn", NOT_FOUND);
        return;
      }
      turnsRef.current.push(value);
      void run();
    },
    [isLoading, topic, catalog, hasMaterial, pushMessage, selectTopic, run],
  );

  return { topic, messages, isLoading, error, mastery, hasMaterial, send, retry: run, selectTopic, changeTopic };
}
