import type { KeyboardEvent } from "react";
import { useId, useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label: string;
  hint?: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagInput({ label, hint, values, onChange, suggestions = [], placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");
  const id = useId();

  function add(raw: string) {
    const value = raw.trim();
    if (!value || values.some((v) => v.toLowerCase() === value.toLowerCase())) return;
    onChange([...values, value]);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  const remaining = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-900 dark:text-white">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 dark:border-[#2A3347] dark:bg-[#161E30]">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 py-0.5 pr-1 pl-2.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              aria-label={`Quitar ${v}`}
              className="grid size-4 place-items-center rounded-full hover:bg-blue-200 dark:hover:bg-blue-500/30"
            >
              <X className="size-3" strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            add(draft);
            setDraft("");
          }}
          placeholder={values.length === 0 ? placeholder : "Añade otro…"}
          className="min-w-24 flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2A3347] dark:text-slate-300 dark:hover:bg-white/5"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
