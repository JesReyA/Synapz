import { useEffect, useRef } from "react";
import { historyToPairs } from "../../lib/games/chess.ts";
import type { MoveRecord } from "../../types/chess.ts";

interface ChessHistoryProps {
  history: readonly MoveRecord[];
}

/** Historial en notación algebraica, en columnas de blancas y negras, desplazado al último movimiento. */
export function ChessHistory({ history }: ChessHistoryProps) {
  const rows = historyToPairs(history);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history.length]);

  return (
    <section
      aria-label="Historial de movimientos"
      className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-slate-50 dark:border-[#2A3347] dark:bg-[#161E30]"
    >
      <div className="grid grid-cols-[2rem_1fr_1fr] gap-x-2 border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-[#2A3347] dark:text-slate-400">
        <span aria-hidden="true">#</span>
        <span>Blancas</span>
        <span>Negras</span>
      </div>
      <div ref={scrollRef} tabIndex={0} className="max-h-48 overflow-y-auto px-3 py-2 md:max-h-[22rem] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Aún no hay movimientos.</p>
        ) : (
          <ol className="flex flex-col gap-1">
            {rows.map((row) => (
              <li
                key={row.number}
                className="grid grid-cols-[2rem_1fr_1fr] gap-x-2 text-sm text-slate-900 tabular-nums dark:text-white"
              >
                <span className="text-slate-500 dark:text-slate-400">{row.number}.</span>
                <span className="font-medium">{row.white}</span>
                <span className="font-medium">{row.black ?? ""}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
