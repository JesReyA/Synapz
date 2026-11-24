import type { GameId } from "../../types/games.ts";

export type PreviewSize = "small" | "large";

interface GamePreviewProps {
  id: GameId;
  size: PreviewSize;
}

const FRAME =
  "flex items-center justify-center rounded-xl bg-slate-50 p-3 dark:bg-[#161E30]";

/** Tamaño de las celdas según la vista previa. */
const CELL: Record<PreviewSize, string> = {
  small: "size-6 text-xs",
  large: "size-9 text-base",
};

const SUDOKU_DIGITS: readonly (number | null)[] = [5, null, 3, null, 7, null, 6, null, 1];
const CHESS_GLYPHS: readonly string[] = ["♜", "", "♚", "", "", "♟", "", "♞", "♙", "", "♘", "", "♖", "", "♔", ""];
const MINES_CELLS: readonly string[] = [
  "1", "1", "", "",
  "F", "2", "1", "",
  "", "", "", "1",
  "", "", "", "",
];
const TETRIS_COLUMNS: readonly (readonly string[])[] = [
  ["bg-violet-400 dark:bg-violet-300", "bg-violet-400 dark:bg-violet-300"],
  ["bg-amber-400 dark:bg-amber-300", "bg-blue-400 dark:bg-blue-300", "bg-blue-400 dark:bg-blue-300"],
  ["bg-amber-400 dark:bg-amber-300", "bg-emerald-400 dark:bg-emerald-300"],
  ["bg-rose-400 dark:bg-rose-300", "bg-emerald-400 dark:bg-emerald-300", "bg-emerald-400 dark:bg-emerald-300"],
  ["bg-rose-400 dark:bg-rose-300"],
];
const MEMORY_CARDS: readonly boolean[] = [true, false, false, true, false, true, true, false];

function ChessPreview({ size }: { size: PreviewSize }) {
  return (
    <span className="grid grid-cols-4">
      {CHESS_GLYPHS.map((glyph, i) => {
        const dark = (Math.floor(i / 4) + i) % 2 === 1;
        return (
          <span
            key={i}
            className={`grid place-items-center leading-none ${CELL[size]} ${
              dark ? "bg-amber-700 dark:bg-amber-900" : "bg-amber-100 dark:bg-amber-700/60"
            } ${i < 8 ? "text-slate-900 dark:text-slate-100" : "text-white dark:text-slate-50"}`}
          >
            {glyph}
          </span>
        );
      })}
    </span>
  );
}

function SudokuPreview({ size }: { size: PreviewSize }) {
  return (
    <span className="grid grid-cols-3 gap-px rounded-md bg-slate-300 p-px dark:bg-slate-600">
      {SUDOKU_DIGITS.map((digit, i) => (
        <span
          key={i}
          className={`grid place-items-center bg-white font-semibold text-emerald-600 dark:bg-[#131A29] dark:text-emerald-300 ${CELL[size]}`}
        >
          {digit}
        </span>
      ))}
    </span>
  );
}

function MinesweeperPreview({ size }: { size: PreviewSize }) {
  return (
    <span className="grid grid-cols-4 gap-px">
      {MINES_CELLS.map((cell, i) => (
        <span
          key={i}
          className={`grid place-items-center rounded-sm font-bold ${CELL[size]} ${
            cell === ""
              ? "bg-slate-200 dark:bg-[#222B3E]"
              : cell === "F"
                ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
                : "bg-white text-blue-600 dark:bg-[#131A29] dark:text-blue-300"
          }`}
        >
          {cell === "F" ? "⚑" : cell}
        </span>
      ))}
    </span>
  );
}

function TetrisPreview({ size }: { size: PreviewSize }) {
  const block = size === "large" ? "size-7" : "size-5";
  return (
    <span className="flex items-end gap-px">
      {TETRIS_COLUMNS.map((column, i) => (
        <span key={i} className="flex flex-col gap-px">
          {column.map((color, j) => (
            <span key={j} className={`rounded-sm ${block} ${color}`} />
          ))}
        </span>
      ))}
    </span>
  );
}

function MemoryPreview({ size }: { size: PreviewSize }) {
  const card = size === "large" ? "h-14 w-10" : "h-10 w-7";
  return (
    <span className="grid grid-cols-4 gap-1.5">
      {MEMORY_CARDS.map((faceUp, i) => (
        <span
          key={i}
          className={`rounded-md border ${card} ${
            faceUp
              ? "border-amber-300 bg-amber-100 dark:border-amber-400/40 dark:bg-amber-400/15"
              : "border-blue-300 bg-blue-200 dark:border-blue-400/30 dark:bg-blue-500/25"
          }`}
        />
      ))}
    </span>
  );
}

function TangramPreview({ size }: { size: PreviewSize }) {
  const dimension = size === "large" ? "size-28" : "size-20";
  return (
    <svg viewBox="0 0 40 40" className={dimension} fill="none">
      <polygon points="0,0 20,20 0,40" className="fill-blue-400 dark:fill-blue-300" />
      <polygon points="0,0 40,0 20,20" className="fill-amber-400 dark:fill-amber-300" />
      <polygon points="40,0 40,20 30,10" className="fill-rose-400 dark:fill-rose-300" />
      <polygon points="30,10 40,20 30,30 20,20" className="fill-violet-400 dark:fill-violet-300" />
      <polygon points="40,20 40,40 20,40" className="fill-emerald-400 dark:fill-emerald-300" />
      <polygon points="20,20 30,30 20,40 10,30" className="fill-cyan-400 dark:fill-cyan-300" />
    </svg>
  );
}

function SlidingPreview({ size }: { size: PreviewSize }) {
  return (
    <span className="grid grid-cols-4 gap-1">
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          className={`grid place-items-center rounded-md font-bold ${CELL[size]} ${
            i === 15 ? "bg-transparent" : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300"
          }`}
        >
          {i === 15 ? "" : i + 1}
        </span>
      ))}
    </span>
  );
}

function QuickBattlePreview() {
  return (
    <span className="flex w-full max-w-48 flex-col gap-2">
      <span className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#222B3E]">
        <span className="block h-full w-2/3 rounded-full bg-amber-400" />
      </span>
      <span className="grid grid-cols-2 gap-2">
        <span className="h-6 rounded-lg bg-white dark:bg-[#131A29]" />
        <span className="h-6 rounded-lg bg-emerald-100 dark:bg-emerald-400/20" />
        <span className="h-6 rounded-lg bg-white dark:bg-[#131A29]" />
        <span className="h-6 rounded-lg bg-white dark:bg-[#131A29]" />
      </span>
    </span>
  );
}

function MentalMathPreview() {
  return (
    <span className="text-xl font-bold tabular-nums text-blue-600 dark:text-blue-300">7 × 8 = ?</span>
  );
}

function PreviewBody({ id, size }: GamePreviewProps) {
  switch (id) {
    case "batalla":
      return <QuickBattlePreview />;
    case "calculo":
      return <MentalMathPreview />;
    case "sudoku":
      return <SudokuPreview size={size} />;
    case "ajedrez":
      return <ChessPreview size={size} />;
    case "quince":
      return <SlidingPreview size={size} />;
    case "buscaminas":
      return <MinesweeperPreview size={size} />;
    case "tangram":
      return <TangramPreview size={size} />;
    case "tetris":
      return <TetrisPreview size={size} />;
    case "memorama":
      return <MemoryPreview size={size} />;
    default: {
      const unreachable: never = id;
      throw new Error(`Vista previa no definida: ${String(unreachable)}`);
    }
  }
}

/** Vista previa decorativa y estática de un juego, para la cuadrícula Masonry. */
export function GamePreview({ id, size }: GamePreviewProps) {
  return (
    <span aria-hidden="true" className={`${FRAME} ${size === "large" ? "py-6" : ""}`}>
      <PreviewBody id={id} size={size} />
    </span>
  );
}
