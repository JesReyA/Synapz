/** Indicador animado mientras Feyn evalúa la explicación (`isLoading`). */
export function FeynTypingIndicator() {
  return (
    <li
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 self-start rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-[#1B2438] dark:text-slate-300"
    >
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-amber-500 motion-reduce:animate-none dark:bg-amber-400"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      Feyn está analizando tu explicación...
    </li>
  );
}
