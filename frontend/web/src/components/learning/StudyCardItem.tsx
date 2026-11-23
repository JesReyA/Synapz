import type { LucideIcon } from "lucide-react";
import { Clock, Eye, Headphones, Mic, Play, Target } from "lucide-react";
import { ACCENTS } from "../../lib/subjectAccents.ts";
import type { ModalityBadge, StudyCard } from "../../types/learning.ts";
import { AMBER_BUTTON } from "./styles.ts";

interface StudyCardItemProps {
  card: StudyCard;
  onOpen: (card: StudyCard) => void;
  onExplainToFeyn: (card: StudyCard) => void;
}

const BADGES: Record<ModalityBadge, { label: string; icon: LucideIcon; tone: string }> = {
  visual: { label: "Visual", icon: Eye, tone: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300" },
  audio: { label: "Audio", icon: Headphones, tone: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" },
  live_voice: { label: "Voz en vivo", icon: Mic, tone: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" },
  practice: { label: "Práctica", icon: Target, tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
};

const ACTION_LABEL = { lessons: "Estudiar", reading: "Leer y practicar", remedial: "Practicar" } as const;

export function StudyCardItem({ card, onOpen, onExplainToFeyn }: StudyCardItemProps) {
  const accent = ACCENTS[card.accent];
  const Icon = accent.icon;
  const badge = BADGES[card.badge];
  const BadgeIcon = badge.icon;

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#222B3E] dark:bg-[#161E30] dark:shadow-none">
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${accent.tile}`}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">{card.subject}</p>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</h3>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.tone}`}>
          <BadgeIcon className="size-3" strokeWidth={2} />
          {badge.label}
        </span>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">{card.description}</p>

      <div className="flex items-center gap-2">
        <div
          role="progressbar"
          aria-label={`Progreso en ${card.title}`}
          aria-valuenow={card.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 flex-1 rounded-full bg-slate-200 dark:bg-[#2A3347]"
        >
          <div className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400" style={{ width: `${card.progress}%` }} />
        </div>
        <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">{card.progress}%</span>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <button type="button" onClick={() => onOpen(card)} className={`${AMBER_BUTTON} flex-1 !py-2`}>
          <Play className="size-3.5 fill-current" />
          {ACTION_LABEL[card.category]}
        </button>
        {card.category === "lessons" && (
          <button
            type="button"
            onClick={() => onExplainToFeyn(card)}
            aria-label={`Enseñarle a Feyn: ${card.title}`}
            title="Enséñale a Feyn"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-amber-300 bg-amber-50 transition-colors hover:bg-amber-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-amber-400/40 dark:bg-amber-400/10 dark:hover:bg-amber-400/20"
          >
            <img src="/feyn.png" alt="" className="size-5 rounded-full object-contain" />
          </button>
        )}
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="size-3.5" strokeWidth={1.75} />
          {card.minutes} min
        </span>
      </div>
    </article>
  );
}
