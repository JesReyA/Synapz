import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type ChallengeTone = "amber" | "blue" | "emerald" | "violet";

const TILE: Record<ChallengeTone, string> = {
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
};

interface ChallengeCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: ChallengeTone;
  action?: ReactNode;
  children: ReactNode;
}

/** Contenedor común de los módulos de Retos. */
export function ChallengeCard({ title, subtitle, icon: Icon, tone, action, children }: ChallengeCardProps) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${TILE[tone]}`}>
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export const PRIMARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-[#131A29]";

export const SECONDARY_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]";
