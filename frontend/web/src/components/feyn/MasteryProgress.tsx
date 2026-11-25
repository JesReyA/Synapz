import { BadgeCheck } from "lucide-react";
import type { Mastery } from "../../hooks/useFeynChat.ts";

interface MasteryProgressProps {
  mastery: Mastery | null;
}

/** Barra de dominio (0-100) y conceptos que todavía faltan, según la última respuesta de Feyn. */
export function MasteryProgress({ mastery }: MasteryProgressProps) {
  const score = mastery?.score ?? 0;

  return (
    <div className="flex flex-col gap-1.5 border-b border-slate-200 px-4 py-2.5 dark:border-[#222B3E]">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600 dark:text-slate-300">Dominio del tema</span>
        <span className="flex items-center gap-1 font-semibold text-slate-900 tabular-nums dark:text-white">
          {mastery?.mastered && <BadgeCheck className="size-3.5 text-emerald-500 dark:text-emerald-400" strokeWidth={2} aria-hidden="true" />}
          {mastery ? `${score}%` : "Sin evaluar"}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Dominio del tema"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="h-2 rounded-full bg-slate-200 dark:bg-[#2A3347]"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-500 ease-out motion-reduce:transition-none dark:bg-emerald-400"
          style={{ width: `${score}%` }}
        />
      </div>
      {mastery && !mastery.mastered && mastery.missing.length > 0 && (
        <ul className="flex flex-wrap items-center gap-1" aria-label="Conceptos que faltan">
          <li className="text-[11px] text-slate-500 dark:text-slate-400">Falta mencionar:</li>
          {mastery.missing.map((concept) => (
            <li
              key={concept}
              className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-900 dark:bg-amber-400/15 dark:text-amber-200"
            >
              {concept}
            </li>
          ))}
        </ul>
      )}
      {mastery?.mastered && (
        <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">¡Tema dominado! Cubriste los conceptos clave de tu profesor.</p>
      )}
    </div>
  );
}
