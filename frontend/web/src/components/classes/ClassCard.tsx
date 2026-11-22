import { AlertTriangle, User } from "lucide-react";
import { ACCENTS } from "../../lib/subjectAccents.ts";
import type { ClassroomSummary } from "../../types/classes.ts";

interface ClassCardProps {
  classroom: ClassroomSummary;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function ClassCard({ classroom, selected, onSelect }: ClassCardProps) {
  const accent = ACCENTS[classroom.accent];
  const Icon = accent.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(classroom.id)}
      aria-pressed={selected}
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#161E30] dark:shadow-none ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-400"
          : "border-slate-200 hover:border-slate-300 dark:border-[#222B3E] dark:hover:border-[#34405a]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${accent.tile}`}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{classroom.name}</h3>
          <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <User className="size-3 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{classroom.teacher_name}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          aria-label={`Progreso en ${classroom.name}`}
          aria-valuenow={classroom.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-[#2A3347]"
        >
          <div
            className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
            style={{ width: `${classroom.progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{classroom.progress}%</span>
      </div>

      {classroom.diagnostic_pending && (
        <p className="flex items-center gap-1.5 rounded-xl bg-orange-100 px-2.5 py-1.5 text-xs font-medium text-orange-700 dark:bg-amber-900/40 dark:text-amber-300">
          <AlertTriangle className="size-3.5 shrink-0" strokeWidth={2} />
          Diagnóstico pendiente
        </p>
      )}
    </button>
  );
}
