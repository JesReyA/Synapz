import { DIGIT_STYLES } from "../../lib/sudokuPalette.ts";
import type { SudokuDigit } from "../../types/challenges.ts";

const DIGITS: readonly SudokuDigit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const BASE =
  "aspect-square grid place-items-center rounded-xl text-base font-bold tabular-nums transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-[#131A29] disabled:cursor-default disabled:opacity-70";

interface SudokuPaletteProps {
  activeDigit: SudokuDigit | null;
  onToggle: (d: SudokuDigit) => void;
  disabled: boolean;
}

export function SudokuPalette({ activeDigit, onToggle, disabled }: SudokuPaletteProps) {
  return (
    <div
      role="group"
      aria-label="Paleta de números"
      className="grid w-full max-w-[22rem] grid-cols-9 gap-1.5 sm:max-w-md"
    >
      {DIGITS.map((n) => {
        const active = activeDigit === n;
        const style = active ? `relative z-10 ${DIGIT_STYLES[n].buttonActive}` : DIGIT_STYLES[n].button;
        return (
          <button
            key={n}
            type="button"
            aria-label={`Número ${n}`}
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onToggle(n)}
            className={`${BASE} ${style}`}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
