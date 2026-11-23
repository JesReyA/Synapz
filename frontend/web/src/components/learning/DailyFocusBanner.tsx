import { ArrowRight, Sparkles, Target } from "lucide-react";
import type { DailyFocus, StudyCard } from "../../types/learning.ts";

interface DailyFocusBannerProps {
  focus: DailyFocus;
  card: StudyCard;
  onStart: (card: StudyCard) => void;
}

export function DailyFocusBanner({ focus, card, onStart }: DailyFocusBannerProps) {
  return (
    <section
      aria-label="Enfoque de hoy"
      className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:border-[#222B3E] dark:from-[#16233F] dark:to-[#1B2C52]"
    >
      <Sparkles className="absolute top-4 right-5 size-6 text-amber-400" strokeWidth={1.75} aria-hidden="true" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-blue-500 dark:bg-[#131A29] dark:text-blue-300">
          <Target className="size-7" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 pr-8">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
            Enfoque de hoy · IA
            <Sparkles className="size-3" strokeWidth={2} />
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl dark:text-white">{focus.headline}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{focus.reason}</p>
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Basado en">
            {focus.based_on.map((item) => (
              <li
                key={item}
                className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => onStart(card)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-900 transition-colors duration-150 hover:bg-amber-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none md:ml-auto"
        >
          Empezar · {card.minutes} min
          <ArrowRight className="size-4" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}
