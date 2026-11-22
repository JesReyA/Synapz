import type { FormEvent } from "react";
import { useState } from "react";
import { KeyRound } from "lucide-react";
import type { JoinClassResult } from "../../types/classes.ts";
import { Modal } from "./Modal.tsx";

interface JoinClassModalProps {
  onClose: () => void;
  onJoin: (code: string) => Promise<JoinClassResult>;
}

const CODE_LENGTH = 6;

export function JoinClassModal({ onClose, onJoin }: JoinClassModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length !== CODE_LENGTH || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onJoin(code);
      if (!result.ok) setError(result.message);
    } catch {
      setError("No pudimos unirte al aula. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Unirme a un aula"
      description="Escribe el código de 6 caracteres que te dio tu profesor."
      onClose={onClose}
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="invite-code" className="sr-only">
            Código de invitación
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 dark:border-[#2A3347] dark:bg-[#161E30]">
            <KeyRound className="size-5 shrink-0 text-slate-400" strokeWidth={1.75} />
            <input
              id="invite-code"
              autoFocus
              autoComplete="off"
              inputMode="text"
              value={code}
              maxLength={CODE_LENGTH}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                setError(null);
              }}
              placeholder="ABC123"
              aria-invalid={error !== null}
              aria-describedby={error ? "invite-error" : undefined}
              className="w-full bg-transparent text-xl font-bold tracking-[0.3em] text-slate-900 uppercase outline-none placeholder:font-normal placeholder:tracking-[0.3em] placeholder:text-slate-300 dark:text-white dark:placeholder:text-slate-600"
            />
          </div>
          {error && (
            <p id="invite-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={code.length !== CODE_LENGTH || busy}
            className="rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            {busy ? "Uniéndome…" : "Unirme"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
