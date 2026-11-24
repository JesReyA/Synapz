import { shapeOf } from "../../lib/games/tetris.ts";
import type { TetrominoKind } from "../../types/tetris.ts";
import { PIECE_FILL } from "./tetrisStyles.ts";

const PREVIEW_COLS = 4;
const PREVIEW_ROWS = 2;
const PREVIEW_INDEXES: readonly number[] = Array.from({ length: PREVIEW_COLS * PREVIEW_ROWS }, (_, i) => i);

/** Celdas ocupadas (índices de una rejilla de 4×2) de la pieza en su rotación inicial. */
function previewCells(kind: TetrominoKind): ReadonlySet<number> {
  const cells = shapeOf(kind, 0);
  const minRow = Math.min(...cells.map(([r]) => r));
  const minCol = Math.min(...cells.map(([, c]) => c));
  return new Set(cells.map(([r, c]) => (r - minRow) * PREVIEW_COLS + (c - minCol)));
}

function MiniPiece({ kind }: { kind: TetrominoKind }) {
  const filled = previewCells(kind);
  return (
    <div className="grid w-14 grid-cols-4 gap-px" aria-hidden="true">
      {PREVIEW_INDEXES.map((index) => (
        <div
          key={index}
          className={`h-3.5 rounded-[2px] ${filled.has(index) ? PIECE_FILL[kind] : "bg-transparent"}`}
        />
      ))}
    </div>
  );
}

interface TetrisNextProps {
  /** Cola de piezas siguientes; se muestran las dos primeras. */
  next: readonly TetrominoKind[];
}

/** Vista previa de las dos piezas siguientes. */
export function TetrisNext({ next }: TetrisNextProps) {
  const upcoming = next.slice(0, 2);
  return (
    <div
      role="group"
      aria-label={`Siguientes piezas: ${upcoming.join(", ")}`}
      className="flex shrink-0 items-center gap-4 rounded-xl bg-slate-50 px-3 py-2 sm:flex-col sm:items-start sm:gap-3 dark:bg-[#161E30]"
    >
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Siguiente</span>
      {upcoming.map((kind, index) => (
        <MiniPiece key={`${index}-${kind}`} kind={kind} />
      ))}
    </div>
  );
}
