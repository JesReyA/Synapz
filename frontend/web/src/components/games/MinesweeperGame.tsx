import { Bomb, Flag, FlagOff } from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";
import { useMinesweeper } from "../../hooks/useMinesweeper.ts";
import { gameInfo } from "../../lib/games/catalog.ts";
import { formatTime } from "../../lib/sudoku.ts";
import type { MineCell, MineState } from "../../types/minesweeper.ts";
import { ChallengeCard } from "../challenges/ChallengeCard.tsx";
import { GameShell } from "./GameShell.tsx";
import type { GameStatusTone } from "./GameShell.tsx";
import { MinesDifficultyPicker } from "./MinesDifficultyPicker.tsx";

const GAME = gameInfo("buscaminas");

/**
 * Columnas con un mínimo de 1.5rem (24 px) por casilla. Si el contenedor es más estrecho
 * que `cols * 24 px` más huecos y relleno, el tablero se desplaza dentro de su propio
 * contenedor. Clases literales para que Tailwind las detecte.
 */
const GRID_COLS: Record<number, string> = {
  8: "grid-cols-[repeat(8,minmax(1.5rem,1fr))]",
  10: "grid-cols-[repeat(10,minmax(1.5rem,1fr))]",
  12: "grid-cols-[repeat(12,minmax(1.5rem,1fr))]",
};

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-600 dark:text-blue-400",
  2: "text-emerald-600 dark:text-emerald-400",
  3: "text-rose-600 dark:text-rose-400",
  4: "text-violet-700 dark:text-violet-300",
  5: "text-amber-700 dark:text-amber-400",
  6: "text-cyan-700 dark:text-cyan-300",
  7: "text-slate-900 dark:text-slate-100",
  8: "text-slate-500 dark:text-slate-400",
};

const CELL_BASE =
  "relative grid aspect-square min-h-6 min-w-6 place-items-center rounded text-sm font-bold tabular-nums select-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none";
const CELL_HIDDEN =
  "bg-slate-200 shadow-[inset_0_-2px_0_rgba(15,23,42,0.12)] hover:bg-slate-300 dark:bg-[#2A3347] dark:shadow-[inset_0_-2px_0_rgba(0,0,0,0.35)] dark:hover:bg-[#344059]";
const CELL_REVEALED = "bg-white dark:bg-[#161E30]";
const CELL_EXPLODED = "bg-rose-500 text-white dark:bg-rose-600";
const CELL_MINE = "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";

type CellView = "hidden" | "flag" | "wrong-flag" | "exploded" | "mine" | "empty" | "number";

function viewOf(cell: MineCell, index: number, state: MineState): CellView {
  const lost = state.status === "lost";
  if (lost && index === state.explodedIndex) return "exploded";
  if (lost && cell.flagged && !cell.mine) return "wrong-flag";
  if (cell.flagged) return "flag";
  if (lost && cell.mine) return "mine";
  if (!cell.revealed) return "hidden";
  return cell.adjacent === 0 ? "empty" : "number";
}

function labelOf(view: CellView, cell: MineCell, row: number, col: number): string {
  const position = `Fila ${row}, columna ${col}`;
  switch (view) {
    case "hidden":
      return `${position}: sin revelar`;
    case "flag":
      return `${position}: bandera`;
    case "wrong-flag":
      return `${position}: bandera errónea, no había mina`;
    case "exploded":
      return `${position}: mina que explotó`;
    case "mine":
      return `${position}: mina`;
    case "empty":
      return `${position}: vacía`;
    case "number":
      return `${position}: ${cell.adjacent} ${cell.adjacent === 1 ? "mina cerca" : "minas cerca"}`;
  }
}

function cellClass(view: CellView, cell: MineCell): string {
  switch (view) {
    case "hidden":
      return CELL_HIDDEN;
    case "flag":
      return `${CELL_HIDDEN} text-amber-600 dark:text-amber-400`;
    case "wrong-flag":
      return `${CELL_HIDDEN} text-rose-600 dark:text-rose-400`;
    case "exploded":
      return CELL_EXPLODED;
    case "mine":
      return CELL_MINE;
    case "empty":
      return CELL_REVEALED;
    case "number":
      return `${CELL_REVEALED} ${NUMBER_COLORS[cell.adjacent] ?? ""}`;
  }
}

interface MineCellButtonProps {
  cell: MineCell;
  index: number;
  state: MineState;
  disabled: boolean;
  onOpen: (index: number) => void;
  onFlag: (index: number) => void;
}

function MineCellButton({ cell, index, state, disabled, onOpen, onFlag }: MineCellButtonProps) {
  const view = viewOf(cell, index, state);
  const row = Math.floor(index / state.cols) + 1;
  const col = (index % state.cols) + 1;

  function handleContextMenu(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    onFlag(index);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      onFlag(index);
    }
  }

  return (
    <button
      type="button"
      role="gridcell"
      disabled={disabled}
      aria-label={labelOf(view, cell, row, col)}
      onClick={() => onOpen(index)}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      className={`${CELL_BASE} ${cellClass(view, cell)}`}
    >
      {view === "flag" && <Flag aria-hidden="true" className="size-3/4" strokeWidth={2.25} />}
      {view === "wrong-flag" && <FlagOff aria-hidden="true" className="size-3/4" strokeWidth={2.25} />}
      {(view === "exploded" || view === "mine") && <Bomb aria-hidden="true" className="size-3/4" strokeWidth={2} />}
      {view === "number" && cell.adjacent}
    </button>
  );
}

export function MinesweeperGame() {
  const game = useMinesweeper();
  const { state } = game;

  let status = "Revela una casilla para empezar.";
  let tone: GameStatusTone = "neutral";
  if (state.status === "playing") status = "Jugando…";
  if (state.status === "won") {
    status = `¡Ganaste en ${formatTime(game.elapsed)}!`;
    tone = "success";
  }
  if (state.status === "lost") {
    status = "¡Boom! Pisaste una mina.";
    tone = "danger";
  }

  const rows = Array.from({ length: state.rows }, (_, r) => r);

  return (
    <ChallengeCard title={GAME.title} subtitle={GAME.description} icon={GAME.icon} tone={GAME.tone}>
      <div className="flex flex-wrap items-center gap-3">
        <MinesDifficultyPicker value={game.difficulty} onChange={game.changeDifficulty} />
        <button
          type="button"
          aria-pressed={game.flagMode}
          onClick={game.toggleFlagMode}
          disabled={game.finished}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:opacity-50 ${
            game.flagMode
              ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]"
          }`}
        >
          <Flag className="size-3.5" strokeWidth={2} />
          Modo bandera
        </button>
      </div>

      <GameShell
        status={status}
        tone={tone}
        elapsed={game.elapsed}
        stats={[{ label: "Minas restantes", value: String(game.minesLeft) }]}
        onReset={game.reset}
        finished={game.finished}
      >
        <div className="overflow-x-auto">
          <div
            role="grid"
            aria-label={`Tablero de Buscaminas de ${state.rows} por ${state.cols}`}
            aria-rowcount={state.rows}
            aria-colcount={state.cols}
            onContextMenu={(e) => e.preventDefault()}
            className="mx-auto flex w-full max-w-[28rem] min-w-max flex-col gap-0.5 rounded-xl bg-slate-100 p-1 sm:p-1.5 dark:bg-[#1B2438]"
          >
            {rows.map((r) => (
              <div key={r} role="row" className={`grid gap-0.5 ${GRID_COLS[state.cols] ?? GRID_COLS[8]}`}>
                {state.cells.slice(r * state.cols, (r + 1) * state.cols).map((cell, c) => (
                  <MineCellButton
                    key={c}
                    cell={cell}
                    index={r * state.cols + c}
                    state={state}
                    disabled={game.finished}
                    onOpen={game.open}
                    onFlag={game.flag}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </GameShell>
    </ChallengeCard>
  );
}
