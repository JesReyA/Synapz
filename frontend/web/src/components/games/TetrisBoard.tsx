import { COLS, ROWS, cellsOf, ghostRow } from "../../lib/games/tetris.ts";
import type { TetrisState, TetrominoKind } from "../../types/tetris.ts";
import { TetrisNext } from "./TetrisNext.tsx";
import { PIECE_FILL, PIECE_GHOST } from "./tetrisStyles.ts";

interface TetrisBoardProps {
  state: TetrisState;
}

interface DisplayCell {
  kind: TetrominoKind | null;
  ghost: boolean;
}

/**
 * Compone lo que se dibuja: tablero fijo, sombra y pieza activa. En game over la
 * pieza nueva puede solaparse con el tablero, así que solo se pinta sobre celdas
 * libres; no se dibuja sombra.
 */
function buildCells(state: TetrisState): DisplayCell[] {
  const cells: DisplayCell[] = state.board.map((kind) => ({ kind, ghost: false }));
  const { active } = state;

  if (state.status !== "over") {
    const row = ghostRow(state);
    if (row !== active.row) {
      for (const [r, c] of cellsOf({ ...active, row })) {
        const cell = cells[r * COLS + c];
        if (cell !== undefined && cell.kind === null) cells[r * COLS + c] = { kind: active.kind, ghost: true };
      }
    }
  }

  for (const [r, c] of cellsOf(active)) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    const cell = cells[r * COLS + c];
    if (cell !== undefined && (state.status !== "over" || cell.kind === null)) {
      cells[r * COLS + c] = { kind: active.kind, ghost: false };
    }
  }
  return cells;
}

const CELL_EMPTY = "bg-slate-50 dark:bg-[#161E30]";

function cellClass({ kind, ghost }: DisplayCell): string {
  if (kind === null) return CELL_EMPTY;
  if (ghost) return `${CELL_EMPTY} rounded-[3px] ${PIECE_GHOST[kind]}`;
  return `rounded-[3px] ${PIECE_FILL[kind]}`;
}

const OVERLAY_TEXT: Partial<Record<TetrisState["status"], string>> = {
  paused: "Pausa",
  over: "Game over",
};

/** Tablero de 10×20 con pieza activa, sombra de caída y siguientes piezas. */
export function TetrisBoard({ state }: TetrisBoardProps) {
  const cells = buildCells(state);
  const overlay = OVERLAY_TEXT[state.status];
  const dimmed = state.status !== "playing";

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center">
      <div className="relative aspect-[1/2] w-full max-w-[18rem] min-w-0">
        <div
          role="img"
          aria-label={`Tablero de Tetris, nivel ${state.level}, puntuación ${state.score}`}
          className={`grid size-full grid-cols-10 grid-rows-20 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 p-px transition-opacity duration-150 motion-reduce:transition-none dark:border-[#222B3E] dark:bg-[#222B3E] ${
            dimmed ? "opacity-40" : ""
          }`}
        >
          {cells.map((cell, index) => (
            <div key={index} className={cellClass(cell)} />
          ))}
        </div>
        {overlay !== undefined && (
          <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-bold text-slate-900 shadow-sm dark:bg-[#1B2438] dark:text-white">
              {overlay}
            </span>
          </div>
        )}
      </div>
      <TetrisNext next={state.next} />
    </div>
  );
}
