import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";

type ChatMessage = { id: number; role: "user" | "feyn"; text: string };

const WELCOME: ChatMessage = {
  id: 0,
  role: "feyn",
  text: "¡Hola! Soy Feyn, tu asistente. ¿En qué te ayudo hoy?",
};

/**
 * onSend(text) => Promise<string> | string
 * Punto de conexión con el backend. Si no se pasa, responde con un texto de ejemplo.
 */
export function FeynChatFab({ onSend }: { onSend?: (text: string) => Promise<string> | string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: value }]);
    setBusy(true);
    try {
      const reply = onSend ? await onSend(value) : "Aún no estoy conectado al backend.";
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
    <>
      {open && (
        <section
          role="dialog"
          aria-label="Chat con Feyn"
          className="fixed right-4 bottom-40 z-50 flex h-[28rem] max-h-[70vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:w-96 md:bottom-24 md:right-6 dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
        >
          <header className="flex items-center justify-between bg-amber-400 px-4 py-3 text-slate-900">
            <div className="flex items-center gap-2">
              <img src="/feyn.png" alt="" className="size-6 object-contain" />
              <h2 className="text-sm font-semibold">Feyn</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat"
              className="grid size-7 place-items-center rounded-full hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
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
                    ? "self-end bg-amber-400 text-white"
                    : "self-start bg-slate-100 text-slate-900 dark:bg-[#1B2438] dark:text-slate-100"
                }`}
              >
                {m.text}
              </li>
            ))}
            {busy && (
              <li className="self-start text-xs text-slate-500 dark:text-slate-400">Feyn está escribiendo…</li>
            )}
            <div ref={endRef} />
          </ul>

          <form onSubmit={submit} className="flex gap-2 border-t border-slate-200 p-3 dark:border-[#222B3E]">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe tu pregunta…"
              aria-label="Mensaje para Feyn"
              className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-[#1B2438] dark:text-white"
            />
            <button
              type="submit"
              disabled={!text.trim() || busy}
              aria-label="Enviar"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-900 transition-colors hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
            >
              <Send className="size-4" strokeWidth={1.75} />
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar chat con Feyn" : "Abrir chat con Feyn"}
        aria-expanded={open}
        className="fixed right-6 bottom-20 z-50 grid size-14 place-items-center rounded-full bg-amber-400 shadow-lg shadow-blue-500/30 transition-colors duration-150 hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none md:bottom-6 dark:shadow-none"
      >
        <img src="/feyn.png" alt="" className="size-8 rounded-full object-contain" />
      </button>
    </>
  );
}

