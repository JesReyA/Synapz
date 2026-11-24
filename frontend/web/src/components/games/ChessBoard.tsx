import { TriangleAlert } from "lucide-react";
import { squareName } from "../../lib/games/chess.ts";
import { PIECE_COLOR_CLASS, PIECE_GLYPH, PIECE_LABEL } from "../../lib/games/chessDisplay.ts";
import type { ChessState, Move, Square } from "../../types/chess.ts";

interface ChessBoardProps {
  board: ChessState["board"];
  selected: Square | null;
  targets: ReadonlySet<Square>;
  checkSquare: Square | null;
  lastMove: Move | null;
  /** Partida terminada o promoción pendiente: las casillas no aceptan toques. */
  disabled: boolean;
  onTap: (sq: Square) => void;
}

const INDEXES: readonly number[] = Array.from({ length: 8 }, (_, i) => i);

const SQUARE_BASE =
  "relative flex aspect-square min-w-0 items-center justify-center overflow-hidden focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500";

function squareBackground(isDark: boolean, check: boolean, selected: boolean, last: boolean): string {
  if (check) return "bg-rose-300 dark:bg-rose-700";
  if (selected) return "bg-sky-300 dark:bg-sky-600";
  if (last) return isDark ? "bg-yellow-400 dark:bg-yellow-700" : "bg-yellow-200 dark:bg-yellow-600";
  return isDark ? "bg-amber-600 dark:bg-stone-600" : "bg-amber-100 dark:bg-stone-400";
}

function squareLabel(
  sq: Square,
  board: ChessState["board"],
  flags: { selected: boolean; target: boolean; capture: boolean; check: boolean },
): string {
  const piece = board[sq];
  const parts: string[] = [squareName(sq), piece ? PIECE_LABEL[piece.color][piece.type] : "vacía"];
  if (flags.selected) parts.push("seleccionada");
  if (flags.target) parts.push(flags.capture ? "destino legal, captura" : "destino legal");
  if (flags.check) parts.push("rey en jaque");
  return parts.join(", ");
}

/** Tablero 8×8 con las blancas abajo. Cada casilla es un botón con etiqueta accesible. */
export function ChessBoard({ board, selected, targets, checkSquare, lastMove, disabled, onTap }: ChessBoardProps) {
  const selectedPiece = selected !== null ? board[selected] : null;

  return (
    <div
      role="grid"
      aria-label="Tablero de ajedrez"
      aria-disabled={disabled}
      className="mx-auto flex w-full max-w-[28rem] flex-col overflow-hidden rounded-xl border border-slate-300 dark:border-[#2A3347]"
    >
      {INDEXES.map((r) => (
        <div key={r} role="row" className="grid grid-cols-8">
          {INDEXES.map((c) => {
            const sq = r * 8 + c;
            const piece = board[sq];
            const isDark = (r + c) % 2 === 1;
            const isSelected = sq === selected;
            const isTarget = targets.has(sq);
            const isCapture =
              isTarget &&
              (piece !== null ||
                (selectedPiece !== null && selectedPiece.type === "p" && selected !== null && selected % 8 !== c));
            const isCheck = sq === checkSquare;
            const isLast = lastMove !== null && (lastMove.from === sq || lastMove.to === sq);
            const coordColor = isDark
              ? "text-amber-100 dark:text-stone-200"
              : "text-amber-800 dark:text-stone-800";

            return (
              <button
                key={sq}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-disabled={disabled}
                aria-label={squareLabel(sq, board, {
                  selected: isSelected,
                  target: isTarget,
                  capture: isCapture,
                  check: isCheck,
                })}
                onClick={() => onTap(sq)}
                className={`${SQUARE_BASE} ${squareBackground(isDark, isCheck, isSelected, isLast)} ${
                  isSelected ? "ring-2 ring-blue-600 ring-inset" : isCheck ? "ring-2 ring-rose-600 ring-inset" : ""
                } ${disabled ? "cursor-default" : "cursor-pointer"}`}
              >
                {c === 0 && (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute top-0 left-0.5 text-[9px] leading-tight font-bold sm:text-[10px] ${coordColor}`}
                  >
                    {8 - r}
                  </span>
                )}
                {r === 7 && (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute right-0.5 bottom-0 text-[9px] leading-tight font-bold sm:text-[10px] ${coordColor}`}
                  >
                    {"abcdefgh"[c]}
                  </span>
                )}
                {piece && (
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none leading-none select-none text-2xl sm:text-4xl ${PIECE_COLOR_CLASS[piece.color]}`}
                  >
                    {PIECE_GLYPH[piece.color][piece.type]}
                  </span>
                )}
                {isTarget && !isCapture && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute size-2.5 rounded-full bg-slate-900/50 sm:size-3.5 dark:bg-white/60"
                  />
                )}
                {isCapture && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0.5 rounded-full border-[3px] border-slate-900/50 dark:border-white/60"
                  />
                )}
                {isCheck && (
                  <TriangleAlert
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0.5 right-0.5 size-3 text-rose-800 dark:text-rose-100"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
