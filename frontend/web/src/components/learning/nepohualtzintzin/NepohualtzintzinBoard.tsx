import { Fragment, useState } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import {
  BOTTOM_BEADS,
  COLUMN_COLORS,
  TOP_BEADS,
  boardValue,
  breakdown,
  columnDigit,
  emptyColumns,
  formatBig,
  powerLabel,
  powerOf,
  toggleBead,
} from "../../../lib/nepohualtzintzin.ts";
import type { BeadColor, BeadSection, BoardColumns } from "../../../types/nepohualtzintzin.ts";

interface NepohualtzintzinBoardProps {
  title: string;
  columns: BoardColumns;
  onChange: (columns: BoardColumns) => void;
}

const BEAD_COLOR: Record<BeadColor, string> = {
  blue: "bg-blue-500",
  white: "bg-slate-50",
  yellow: "bg-amber-400",
};

/** Cada cuenta ocupa 32 px (28 + 4). Las posiciones son estáticas para que Tailwind las genere. */
const TOP_POS = ["bottom-0", "bottom-8", "bottom-16"] as const;
const BOTTOM_POS = ["top-0", "top-8", "top-16", "top-24"] as const;

const BEAD_BASE =
  "absolute inset-x-0 mx-auto h-7 w-[85%] max-w-9 rounded-full border border-black/25 shadow-[inset_0_-3px_0_rgba(0,0,0,0.22),inset_0_2px_0_rgba(255,255,255,0.4)] transition-transform duration-300 ease-out focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-none motion-reduce:transition-none";

function Bead({
  color,
  section,
  k,
  active,
  label,
  onClick,
}: {
  color: BeadColor;
  section: BeadSection;
  k: number;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const pos = section === "top" ? TOP_POS[k - 1] : BOTTOM_POS[k - 1];
  const away = section === "top" ? "-translate-y-10" : "translate-y-10";
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      className={`${BEAD_BASE} ${BEAD_COLOR[color]} ${pos} ${active ? "translate-y-0" : away}`}
    />
  );
}

const compact = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 });

export function NepohualtzintzinBoard({ title, columns, onChange }: NepohualtzintzinBoardProps) {
  const [guides, setGuides] = useState(true);
  const value = boardValue(columns);
  const terms = breakdown(columns);

  const row = (render: (index: number) => ReactNode, className: string) => (
    <div className={`flex ${className}`}>
      {columns.map((_, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="w-1 shrink-0 bg-red-700 dark:bg-red-800" aria-hidden="true" />}
          {render(i)}
        </Fragment>
      ))}
    </div>
  );

  return (
    <section aria-label={title} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setGuides((g) => !g)}
            aria-pressed={guides}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
          >
            {guides ? <EyeOff className="size-3.5" strokeWidth={1.75} /> : <Eye className="size-3.5" strokeWidth={1.75} />}
            {guides ? "Ocultar guías" : "Mostrar guías"}
          </button>
          <button
            type="button"
            onClick={() => onChange(emptyColumns())}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2A3347] dark:text-slate-200 dark:hover:bg-white/5"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.75} />
            Reiniciar a 0
          </button>
        </div>
      </header>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[22.5rem] rounded-2xl bg-red-700 p-2 shadow-inner dark:bg-red-800">
          <div className="overflow-hidden rounded-xl bg-red-950">
            {guides &&
              row(
                (i) => (
                  <span className="flex-1 truncate py-1 text-center text-[9px] font-semibold text-red-100 tabular-nums" title={`Vale ${compact.format(20 ** powerOf(i))} por unidad`}>
                    {powerLabel(powerOf(i))}
                  </span>
                ),
                "bg-red-900/80",
              )}

            {row(
              (i) => {
                const color = COLUMN_COLORS[i] ?? "white";
                const power = powerLabel(powerOf(i));
                const col = columns[i] ?? { top: 0, bottom: 0 };
                return (
                  <div className="relative h-[136px] flex-1">
                    <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-black/50" aria-hidden="true" />
                    {Array.from({ length: TOP_BEADS }, (_, n) => n + 1).map((k) => (
                      <Bead
                        key={k}
                        color={color}
                        section="top"
                        k={k}
                        active={col.top >= k}
                        label={`Columna ${power}, cuenta superior ${k} de valor 5, ${col.top >= k ? "activa" : "inactiva"}`}
                        onClick={() => onChange(toggleBead(columns, i, "top", k))}
                      />
                    ))}
                  </div>
                );
              },
              "",
            )}

            <div className="h-3 bg-red-700 dark:bg-red-800" aria-hidden="true" />

            {row(
              (i) => {
                const color = COLUMN_COLORS[i] ?? "white";
                const power = powerLabel(powerOf(i));
                const col = columns[i] ?? { top: 0, bottom: 0 };
                return (
                  <div className="relative h-[168px] flex-1">
                    <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-black/50" aria-hidden="true" />
                    {Array.from({ length: BOTTOM_BEADS }, (_, n) => n + 1).map((k) => (
                      <Bead
                        key={k}
                        color={color}
                        section="bottom"
                        k={k}
                        active={col.bottom >= k}
                        label={`Columna ${power}, cuenta inferior ${k} de valor 1, ${col.bottom >= k ? "activa" : "inactiva"}`}
                        onClick={() => onChange(toggleBead(columns, i, "bottom", k))}
                      />
                    ))}
                  </div>
                );
              },
              "",
            )}

            {guides &&
              row(
                (i) => (
                  <span className="flex-1 py-1 text-center text-[11px] font-bold text-amber-300 tabular-nums">
                    {columnDigit(columns[i] ?? { top: 0, bottom: 0 })}
                  </span>
                ),
                "bg-red-900/80",
              )}
          </div>
        </div>
      </div>

      <div aria-live="polite" className="flex flex-col gap-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">Valor en base 10</p>
        <p className="text-3xl font-bold break-all text-slate-900 tabular-nums dark:text-white">{formatBig(value)}</p>
        {terms.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">Todas las cuentas están separadas de la barra: el valor es 0.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5" aria-label="Desglose por potencias de 20">
            {terms.map((t) => (
              <li key={t.power} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-slate-800 tabular-nums dark:bg-amber-400/15 dark:text-amber-100">
                <strong className="font-semibold">{t.digit}</strong> × {powerLabel(t.power)} = {formatBig(t.value)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
