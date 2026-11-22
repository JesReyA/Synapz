import type { LucideIcon } from "lucide-react";
import { Calculator, BookOpen, FlaskConical, Flame } from "lucide-react";

type Subject = {
  id: string;
  name: string;
  percent: number;
  icon: LucideIcon;
  tile: string;
  bar: string;
};

const SUBJECTS: Subject[] = [
  {
    id: "mate",
    name: "Matemáticas",
    percent: 72,
    icon: Calculator,
    tile: "bg-blue-500 text-white",
    bar: "bg-emerald-500 dark:bg-emerald-400",
  },
  {
    id: "lectura",
    name: "Comprensión lectora",
    percent: 61,
    icon: BookOpen,
    tile: "bg-violet-100 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400",
    bar: "bg-violet-500 dark:bg-violet-400",
  },
  {
    id: "ciencias",
    name: "Ciencias",
    percent: 80,
    icon: FlaskConical,
    tile: "bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400",
    bar: "bg-teal-500 dark:bg-teal-400",
  },
];

function SubjectCard({ subject }: { subject: Subject }) {
  const Icon = subject.icon;
  return (
    <article className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#222B3E] dark:bg-[#161E30] dark:shadow-none">
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${subject.tile}`}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
      </div>
      <h3 className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">{subject.name}</h3>
      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          aria-label={subject.name}
          aria-valuenow={subject.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-[#2A3347]"
        >
          <div className={`h-full rounded-full ${subject.bar}`} style={{ width: `${subject.percent}%` }} />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{subject.percent}%</span>
      </div>
    </article>
  );
}

function StreakCard({ days }: { days: number }) {
  return (
    <article className="flex flex-col justify-center gap-2 rounded-2xl bg-orange-100 p-4 shadow-sm dark:bg-amber-900/40 dark:shadow-none">
      <div className="flex items-center gap-2">
        <Flame className="size-5 shrink-0 text-orange-500 dark:text-amber-400" strokeWidth={1.75} />
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Racha de aprendizaje</h3>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{days} días</p>
    </article>
  );
}

export function SubjectCardsGrid({
  subjects = SUBJECTS,
  streakDays = 5,
}: {
  subjects?: Subject[];
  streakDays?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {subjects.map((s) => (
          <SubjectCard key={s.id} subject={s} />
        ))}
      </div>
      <StreakCard days={streakDays} />
    </div>
  );
}

