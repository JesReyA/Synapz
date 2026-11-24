import type { MineDifficulty } from "../../types/minesweeper.ts";

const OPTIONS: readonly { id: MineDifficulty; label: string }[] = [
  { id: "facil", label: "Fácil" },
  { id: "medio", label: "Medio" },
  { id: "dificil", label: "Difícil" },
];

interface MinesDifficultyPickerProps {
  value: MineDifficulty;
  onChange: (difficulty: MineDifficulty) => void;
}

/** Selector segmentado de dificultad del Buscaminas. */
export function MinesDifficultyPicker({ value, onChange }: MinesDifficultyPickerProps) {
  return (
    <div role="radiogroup" aria-label="Dificultad" className="inline-flex rounded-full bg-slate-100 p-1 dark:bg-[#1B2438]">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          onClick={() => onChange(option.id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
            option.id === value
              ? "bg-white text-blue-600 shadow-sm dark:bg-blue-500 dark:text-white dark:shadow-none"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
