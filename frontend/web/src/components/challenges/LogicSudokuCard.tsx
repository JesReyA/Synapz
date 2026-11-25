import { AlertCircle, CheckCircle2, Grid3x3, RefreshCw, Timer } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useGameSession } from "../../hooks/useGameSession.ts";
import { useSudoku } from "../../hooks/useSudoku.ts";
import { DIFFICULTIES, SIZE, formatTime } from "../../lib/sudoku.ts";
import type { SudokuDigit } from "../../types/challenges.ts";
import { ChallengeCard, PRIMARY_BUTTON, SECONDARY_BUTTON } from "./ChallengeCard.tsx";
import { SudokuBoard } from "./SudokuBoard.tsx";
import { SudokuPalette } from "./SudokuPalette.tsx";

function isDigit(n: number): n is SudokuDigit {
  return Number.isInteger(n) && n >= 1 && n <= 9;
}

function isTextField(target: EventTarget): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

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
  const { hideTimers } = useGameSession();

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (!/^[1-9]$/.test(e.key) || isTextField(e.target)) return;
    const digit = Number(e.key);
    if (!isDigit(digit) || s.solved) return;
    s.toggleDigit(digit);
  }

  const total = SIZE * SIZE;

  return (
    <ChallengeCard
      title="Sudoku de lógica"
      subtitle="Elige un número y toca el tablero para colocarlo o quitarlo."
      icon={Grid3x3}
      tone="emerald"
      action={
        hideTimers ? undefined : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900 tabular-nums dark:bg-[#1B2438] dark:text-white">
            <Timer className="size-4 text-slate-500 dark:text-slate-400" strokeWidth={1.75} />
            <span role="timer" aria-label="Tiempo transcurrido">
              {formatTime(s.elapsed)}
            </span>
          </span>
        )
      }
    >
      {/* Atajos 1-9 para elegir número; las flechas, Enter y Espacio los maneja el tablero. */}
      <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented label="Dificultad" options={DIFFICULTIES} value={s.difficulty} onChange={s.changeDifficulty} />
          <button type="button" onClick={s.newGame} className={s.solved ? PRIMARY_BUTTON : SECONDARY_BUTTON}>
            <RefreshCw className="size-3.5" strokeWidth={2} />
            Nueva partida
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <SudokuBoard
            puzzle={s.puzzle}
            values={s.values}
            activeDigit={s.activeDigit}
            completedDigits={s.completedDigits}
            conflicts={s.conflicts}
            solved={s.solved}
            disabled={s.solved}
            onCellTap={s.tapCell}
          />
          <SudokuPalette activeDigit={s.activeDigit} onToggle={s.toggleDigit} disabled={s.solved} />

          <p
            aria-live="polite"
            className={`flex w-full max-w-[22rem] items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium sm:max-w-md ${
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
            ) : s.activeDigit === null ? (
              "Elige un número para empezar"
            ) : (
              `${s.filled}/${total} celdas llenas. Sin errores.`
            )}
          </p>
        </div>
      </div>
    </ChallengeCard>
  );
}
