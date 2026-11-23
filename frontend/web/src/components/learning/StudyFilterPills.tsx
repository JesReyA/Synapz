import type { StudyFilter } from "../../types/learning.ts";

const FILTERS: { id: StudyFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "lessons", label: "Mis Lecciones IA" },
  { id: "reading", label: "Comprensión Lectora" },
  { id: "remedial", label: "Nivelación" },
];

interface StudyFilterPillsProps {
  value: StudyFilter;
  counts: Record<StudyFilter, number>;
  onChange: (filter: StudyFilter) => void;
}

export function StudyFilterPills({ value, counts, onChange }: StudyFilterPillsProps) {
  return (
    <div role="radiogroup" aria-label="Filtrar actividades" className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const active = value === f.id;
        return (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(f.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              active
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1B2438] dark:text-slate-300 dark:hover:bg-[#222d47]"
            }`}
          >
            {f.label}
            <span
              className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                active ? "bg-white/25" : "bg-white text-slate-500 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              {counts[f.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
