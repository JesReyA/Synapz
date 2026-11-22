import { AlertCircle, CheckCircle2, Delete, Grid3x3, RefreshCw, Timer } from "lucide-react";
import { useSudoku } from "../../hooks/useSudoku.ts";
import { DIFFICULTIES, SIZES, formatTime } from "../../lib/sudoku.ts";
import { ChallengeCard, SECONDARY_BUTTON } from "./ChallengeCard.tsx";
import { SudokuBoard } from "./SudokuBoard.tsx";

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
            o.id === value
              ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500 dark:text-white dark:shadow-none"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function LogicSudokuCard() {
  const s = useSudoku();
  const sizeOptions = SIZES.map((n) => ({ id: n, label: `${n}×${n}` }));
  const pad = Array.from({ length: s.puzzle.size }, (_, i) => i + 1);

  return (
    <ChallengeCard
      title="Sudoku de lógica"
      subtitle="Completa cada fila, columna y caja sin repetir números."
      icon={Grid3x3}
      tone="emerald"
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 tabular-nums dark:bg-[#1B2438] dark:text-white">
          <Timer className="size-4 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
          <span role="timer" aria-label="Tiempo transcurrido">
            {formatTime(s.elapsed)}
          </span>
        </span>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Tamaño" options={sizeOptions} value={s.size} onChange={s.changeSize} />
        <Segmented label="Dificultad" options={DIFFICULTIES} value={s.difficulty} onChange={s.changeDifficulty} />
        <button type="button" onClick={s.restart} className={SECONDARY_BUTTON}>
          <RefreshCw className="size-3.5" strokeWidth={2} />
          Nuevo tablero
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-center">
        <SudokuBoard
          puzzle={s.puzzle}
          values={s.values}
          selected={s.selected}
          conflicts={s.conflicts}
          onSelect={s.select}
          onInput={s.setCell}
          onMove={s.moveSelection}
        />

        <div className="flex w-full max-w-xs flex-col gap-3">
          <div className="grid grid-cols-5 gap-2" role="group" aria-label="Teclado numérico">
            {pad.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => s.setCell(n)}
                className="h-10 rounded-xl bg-slate-100 text-base font-bold text-slate-900 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-white dark:hover:bg-blue-500/30"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              aria-label="Borrar celda"
              onClick={() => s.setCell(0)}
              className="grid h-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition-colors duration-150 hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-slate-200 dark:hover:bg-rose-500/20"
            >
              <Delete className="size-4" strokeWidth={1.75} />
            </button>
          </div>

          <p
            aria-live="polite"
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
              s.solved
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                : s.conflicts.size > 0
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
                  : "bg-slate-50 text-slate-600 dark:bg-[#161E30] dark:text-slate-300"
            }`}
          >
            {s.solved ? (
              <>
                <CheckCircle2 className="size-4 shrink-0" strokeWidth={2} />
                ¡Resuelto en {formatTime(s.elapsed)}!
              </>
            ) : s.conflicts.size > 0 ? (
              <>
                <AlertCircle className="size-4 shrink-0" strokeWidth={2} />
                {s.conflicts.size} {s.conflicts.size === 1 ? "celda repite" : "celdas repiten"} un número
              </>
            ) : (
              `${s.filled}/${s.values.length} celdas llenas. Sin errores.`
            )}
          </p>
        </div>
      </div>
    </ChallengeCard>
  );
}
