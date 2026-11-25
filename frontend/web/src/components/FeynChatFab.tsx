import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, RotateCcw, Send, X } from "lucide-react";
import { FeynTypingIndicator } from "./feyn/FeynTypingIndicator.tsx";
import { MasteryProgress } from "./feyn/MasteryProgress.tsx";
import { useFeynChat } from "../hooks/useFeynChat.ts";
import type { FeynTopicContext } from "../types/classes.ts";

const MAX_MESSAGE_CHARS = 2000;

interface FeynChatFabProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tema elegido con "Enséñale a Feyn". Null si el chat se abrió desde el botón flotante. */
  topic: FeynTopicContext | null;
  /** Temas con material del profesor que el alumno puede elegir dentro del chat. */
  topics: FeynTopicContext[];
}

interface PanelProps {
  open: boolean;
  topic: FeynTopicContext | null;
  topics: FeynTopicContext[];
  onClose: () => void;
}

function ChatPanel({ open, topic: initialTopic, topics, onClose }: PanelProps) {
  const { topic, messages, isLoading, error, mastery, hasMaterial, send, retry, selectTopic, changeTopic } = useFeynChat(
    initialTopic,
    topics,
  );
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error, topic, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const canWrite = !isLoading && (topic === null || hasMaterial);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim() || !canWrite) return;
    send(text);
    setText("");
  }

  return (
    <section
      role="dialog"
      aria-label="Chat con Feyn"
      hidden={!open}
      className="fixed right-4 bottom-40 z-50 flex h-[32rem] max-h-[75vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:w-96 md:right-6 md:bottom-24 dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header className="flex items-center justify-between gap-2 bg-amber-400 px-4 py-3 text-slate-900">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/feyn.png" alt="" className="size-6 shrink-0 object-contain" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Feyn</h2>
            <p className="truncate text-[11px] text-slate-800">{topic ? `Tema: ${topic.title}` : "Tu compañero de estudio"}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {topic && (
            <button
              type="button"
              onClick={changeTopic}
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
            >
              Cambiar tema
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar chat"
            className="grid size-7 place-items-center rounded-full hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
      </header>

      {topic && <MasteryProgress mastery={mastery} />}

      <ul role="log" aria-label="Conversación con Feyn" className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              m.role === "student"
                ? "self-end bg-amber-400 text-slate-900"
                : "self-start bg-slate-100 text-slate-900 dark:bg-[#1B2438] dark:text-slate-100"
            }`}
          >
            {m.text}
          </li>
        ))}

        {topic === null && topics.length > 0 && (
          <li className="flex flex-col gap-1.5 self-start" aria-label="Temas disponibles">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Elige un tema:</span>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <button
                  key={t.topic_id}
                  type="button"
                  onClick={() => selectTopic(t)}
                  className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-slate-900 transition-colors hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100 dark:hover:bg-amber-400/20"
                >
                  {t.title}
                </button>
              ))}
            </div>
          </li>
        )}

        {topic !== null && !hasMaterial && (
          <li role="alert" className="self-start rounded-2xl bg-orange-100 px-3 py-2 text-xs text-orange-900 dark:bg-amber-900/40 dark:text-amber-100">
            Tu profesor aún no subió material de este tema. Feyn solo evalúa con el material del profesor, así que no puede revisar tu explicación todavía.
          </li>
        )}

        {isLoading && <FeynTypingIndicator />}

        {error && !isLoading && (
          <li role="alert" className="flex flex-col items-start gap-2 self-start rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
            <span className="flex items-start gap-1.5">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
              {error}
            </span>
            <button
              type="button"
              onClick={() => void retry()}
              className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-semibold text-rose-700 hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-rose-200"
            >
              <RotateCcw className="size-3" strokeWidth={2} />
              Reintentar
            </button>
          </li>
        )}
        <div ref={endRef} />
      </ul>

      <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3 dark:border-[#222B3E]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_MESSAGE_CHARS}
          disabled={!canWrite}
          placeholder={topic ? "Explícale el tema a Feyn…" : "Escribe tu mensaje…"}
          aria-label="Mensaje para Feyn"
          className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-60 dark:bg-[#1B2438] dark:text-white"
        />
        <button
          type="submit"
          disabled={!text.trim() || !canWrite}
          aria-label="Enviar"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-900 transition-colors hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
        >
          <Send className="size-4" strokeWidth={1.75} />
        </button>
      </form>
    </section>
  );
}

export function FeynChatFab({ open, onOpenChange, topic, topics }: FeynChatFabProps) {
  return (
    <>
      <ChatPanel key={topic?.topic_id ?? "general"} open={open} topic={topic} topics={topics} onClose={() => onOpenChange(false)} />
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label={open ? "Cerrar chat con Feyn" : "Abrir chat con Feyn"}
        aria-expanded={open}
        className="fixed right-6 bottom-20 z-50 grid size-14 place-items-center rounded-full bg-amber-400 shadow-lg shadow-amber-400/30 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:outline-none md:bottom-6 dark:shadow-none"
      >
        <img src="/feyn.png" alt="" className="size-8 rounded-full object-contain" />
      </button>
    </>
  );
}
