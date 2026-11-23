import type { TeacherClassroomSummary } from "../../types/teacher.ts";

interface ClassroomPillsProps {
  classrooms: TeacherClassroomSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ClassroomPills({ classrooms, selectedId, onSelect }: ClassroomPillsProps) {
  return (
    <div role="radiogroup" aria-label="Aula" className="flex flex-wrap gap-2">
      {classrooms.map((c) => {
        const active = c.id === selectedId;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(c.id)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              active
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#1B2438] dark:text-slate-300 dark:hover:bg-[#222d47]"
            }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
