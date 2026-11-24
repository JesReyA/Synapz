import { COLUMN_COLORS, COLUMN_COUNT, TOP_BEADS, BOTTOM_BEADS, TOP_VALUE, powerLabel } from "../../../lib/nepohualtzintzin.ts";
import type { BeadColor, PowerDigits } from "../../../types/nepohualtzintzin.ts";

interface MiniAbacusProps {
  title: string;
  /** Potencias de 20 que se dibujan, de la mayor a la menor. */
  powers: number[];
  digits: PowerDigits;
  highlight?: number[];
}

const BEAD_COLOR: Record<BeadColor, string> = {
  blue: "bg-blue-500",
  white: "bg-slate-50",
  yellow: "bg-amber-400",
};

const BEAD = "h-3.5 w-8 rounded-full border border-black/25 shadow-[inset_0_-2px_0_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.4)]";

function Group({ count, color, label }: { count: number; color: BeadColor; label: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span key={`${label}-${i}`} className={`${BEAD} ${BEAD_COLOR[color]}`} aria-hidden="true" />
      ))}
    </>
  );
}

/**
 * Diagrama de solo lectura. Las cuentas activas quedan pegadas a la barra central y las
 * inactivas, separadas hacia el borde, como en el tablero interactivo.
 */
export function MiniAbacus({ title, powers, digits, highlight = [] }: MiniAbacusProps) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs font-semibold text-slate-600 dark:text-slate-300">{title}</figcaption>
      <div className="inline-flex self-start overflow-hidden rounded-xl border-4 border-red-700 bg-red-950 dark:border-red-800">
        {powers.map((power, n) => {
          const digit = digits[power] ?? 0;
          const top = Math.floor(digit / TOP_VALUE);
          const bottom = digit % TOP_VALUE;
          const color = COLUMN_COLORS[COLUMN_COUNT - 1 - power] ?? "white";
          const lit = highlight.includes(power);
          return (
            <div
              key={power}
              className={`flex w-11 flex-col items-center ${n > 0 ? "border-l-4 border-red-700 dark:border-red-800" : ""} ${lit ? "bg-amber-300/20" : ""}`}
            >
              <span className="w-full bg-red-900/80 py-0.5 text-center text-[9px] font-semibold text-red-100 tabular-nums">{powerLabel(power)}</span>
              <div className="flex flex-col items-center gap-0.5 py-1">
                <Group count={TOP_BEADS - top} color={color} label="top-off" />
                <span className="h-3" aria-hidden="true" />
                <Group count={top} color={color} label="top-on" />
              </div>
              <span className="h-2 w-full bg-red-700 dark:bg-red-800" aria-hidden="true" />
              <div className="flex flex-col items-center gap-0.5 py-1">
                <Group count={bottom} color={color} label="bottom-on" />
                <span className="h-3" aria-hidden="true" />
                <Group count={BOTTOM_BEADS - bottom} color={color} label="bottom-off" />
              </div>
              <span className="w-full bg-red-900/80 py-0.5 text-center text-[11px] font-bold text-amber-300 tabular-nums">{digit}</span>
            </div>
          );
        })}
      </div>
      <p className="sr-only">
        {powers.map((p) => `${powerLabel(p)}: ${digits[p] ?? 0}`).join(", ")}
      </p>
    </figure>
  );
}
