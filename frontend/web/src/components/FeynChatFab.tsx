import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import type { FeynTopicContext } from "../types/classes.ts";

type ChatMessage = { id: number; role: "user" | "feyn"; text: string };

type OnSend = (text: string, topic: FeynTopicContext | null) => Promise<string> | string;

interface FeynChatFabProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tema precargado (Técnica Feynman). Al cambiar, el chat se reinicia. */
  topic?: FeynTopicContext | null;
  /** Punto de conexión con POST /api/feyn/chat. Sin él, responde un texto de ejemplo. */
  onSend?: OnSend;
}

function welcome(topic: FeynTopicContext | null): ChatMessage {
  return {
    id: 0,
    role: "feyn",
    text: topic
      ? `¡Hola! Quiero aprender "${topic.title}". Explícamelo con tus propias palabras, como si yo no supiera nada. Yo te haré preguntas.`
      : "¡Hola! Soy Feyn, tu asistente. ¿En qué te ayudo hoy?",
  };
}

interface PanelProps {
  open: boolean;
  topic: FeynTopicContext | null;
  onClose: () => void;
  onSend: OnSend | undefined;
}

function ChatPanel({ open, topic, onClose, onSend }: PanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcome(topic)]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: value }]);
    setBusy(true);
    try {
      const reply = onSend ? await onSend(value, topic) : "Aún no estoy conectado al backend.";
      setMessages((m) => [...m, { id: Date.now() + 1, role: "feyn", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "feyn", text: "No pude responder. Intenta de nuevo." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      role="dialog"
      aria-label="Chat con Feyn"
      hidden={!open}
      className="fixed right-4 bottom-40 z-50 flex h-[28rem] max-h-[70vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:w-96 md:right-6 md:bottom-24 dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header className="flex items-center justify-between bg-amber-400 px-4 py-3 text-slate-900">
        <div className="flex min-w-0 items-center gap-2">
          <img src="/feyn.png" alt="" className="size-6 shrink-0 object-contain" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Feyn</h2>
            {topic && <p className="truncate text-[11px] text-slate-800">Tema: {topic.title}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar chat"
          className="grid size-7 place-items-center rounded-full hover:bg-white/30 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </header>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "self-end bg-amber-400 text-slate-900"
                : "self-start bg-slate-100 text-slate-900 dark:bg-[#1B2438] dark:text-slate-100"
            }`}
          >
            {m.text}
          </li>
        ))}
        {busy && <li className="self-start text-xs text-slate-500 dark:text-slate-400">Feyn está escribiendo…</li>}
        <div ref={endRef} />
      </ul>

      <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3 dark:border-[#222B3E]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={topic ? "Explícale el tema a Feyn…" : "Escribe tu pregunta…"}
          aria-label="Mensaje para Feyn"
          className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-amber-400 dark:bg-[#1B2438] dark:text-white"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy}
          aria-label="Enviar"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-900 transition-colors hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
        >
          <Send className="size-4" strokeWidth={1.75} />
        </button>
      </form>
    </section>
  );
}

export function FeynChatFab({ open, onOpenChange, topic = null, onSend }: FeynChatFabProps) {
  return (
    <>
      <ChatPanel
        key={topic?.topic_id ?? "general"}
        open={open}
        topic={topic}
        onClose={() => onOpenChange(false)}
        onSend={onSend}
      />
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

