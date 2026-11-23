import type { LucideIcon } from "lucide-react";

interface TeacherKpiTileProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tile: string;
}

export function TeacherKpiTile({ label, value, hint, icon: Icon, tile }: TeacherKpiTileProps) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tile}`}>
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 tabular-nums dark:text-white">{value}</p>
        {hint && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </article>
  );
}
