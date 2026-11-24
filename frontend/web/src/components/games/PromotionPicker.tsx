import { useEffect, useRef } from "react";
import { PIECE_COLOR_CLASS, PIECE_GLYPH } from "../../lib/games/chessDisplay.ts";
import type { Color, PromotionPiece } from "../../types/chess.ts";
import { SECONDARY_BUTTON } from "../challenges/ChallengeCard.tsx";

interface PromotionPickerProps {
  /** Color del peón que promociona. */
  color: Color;
  onChoose: (piece: PromotionPiece) => void;
  onCancel: () => void;
}

const OPTIONS: readonly { piece: PromotionPiece; name: string }[] = [
  { piece: "q", name: "dama" },
  { piece: "r", name: "torre" },
  { piece: "b", name: "alfil" },
  { piece: "n", name: "caballo" },
];

/** Selector en línea de la pieza de promoción. El foco inicial va al primer botón. */
export function PromotionPicker({ color, onChoose, onCancel }: PromotionPickerProps) {
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  return (
    <div
      role="group"
      aria-label="Elige la pieza de promoción"
      className="mx-auto flex w-full max-w-[28rem] flex-wrap items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-[#2A3347] dark:bg-[#161E30]"
    >
      <span className="w-full text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
        Promociona el peón a:
      </span>
      {OPTIONS.map(({ piece, name }, i) => (
        <button
          key={piece}
          ref={i === 0 ? firstRef : undefined}
          type="button"
          aria-label={`Promover a ${name}`}
          onClick={() => onChoose(piece)}
          className="grid size-12 place-items-center rounded-xl border border-amber-300 bg-amber-100 transition-colors duration-150 hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-stone-500 dark:bg-stone-400 dark:hover:bg-stone-300"
        >
          <span aria-hidden="true" className={`text-3xl leading-none select-none ${PIECE_COLOR_CLASS[color]}`}>
            {PIECE_GLYPH[color][piece]}
          </span>
        </button>
      ))}
      <button type="button" onClick={onCancel} className={SECONDARY_BUTTON}>
        Cancelar
      </button>
    </div>
  );
}
