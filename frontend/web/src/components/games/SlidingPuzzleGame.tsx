import type { KeyboardEvent } from "react";
import { formatTime } from "../../hooks/useGameTimer.ts";
import { useSlidingPuzzle } from "../../hooks/useSlidingPuzzle.ts";
import { gameInfo } from "../../lib/games/catalog.ts";
import { N, canMove } from "../../lib/games/slidingPuzzle.ts";
import type { SlideDirection } from "../../types/slidingPuzzle.ts";
import { ChallengeCard } from "../challenges/ChallengeCard.tsx";
import { GameShell } from "./GameShell.tsx";

const KEY_DIRECTION: Record<string, SlideDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

const ROWS: readonly number[] = Array.from({ length: N }, (_, i) => i);

const TILE_BASE =
  "h-full w-full rounded-xl border text-xl font-bold tabular-nums transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none sm:text-2xl";
const TILE_MOVABLE =
  "cursor-pointer border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-[#2A3347] dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]";
const TILE_IDLE =
  "cursor-default border-slate-200 bg-white text-slate-900 dark:border-[#2A3347] dark:bg-[#161E30] dark:text-white";

export function SlidingPuzzleGame() {
  const game = useSlidingPuzzle();
  const info = gameInfo("quince");

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const dir = KEY_DIRECTION[e.key];
    if (dir === undefined || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    if (game.won) return;
    game.move(dir);
  }

  const status = game.won
    ? `¡Resuelto en ${game.moves} ${game.moves === 1 ? "movimiento" : "movimientos"} y ${formatTime(game.elapsed)}!`
    : "Mueve las fichas para ordenarlas del 1 al 15.";

  return (
    <ChallengeCard title={info.title} subtitle={info.description} icon={info.icon} tone={info.tone}>
      <GameShell
        status={status}
        tone={game.won ? "success" : "neutral"}
        elapsed={game.elapsed}
        stats={[{ label: "Movimientos", value: String(game.moves) }]}
        onReset={game.reset}
        finished={game.won}
      >
        <div
          role="grid"
          aria-label="Tablero del Juego del 15"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="mx-auto flex w-full max-w-[20rem] flex-col gap-2 rounded-2xl p-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          {ROWS.map((row) => (
            <div key={row} role="row" className="grid grid-cols-4 gap-2">
              {ROWS.map((col) => {
                const index = row * N + col;
                const value = game.board[index] as number;
                return (
                  <div key={index} role="gridcell" className="aspect-square">
                    {value === 0 ? (
                      <div aria-hidden="true" className="h-full w-full rounded-xl bg-slate-100 dark:bg-[#1B2438]/40" />
                    ) : (
                      <button
                        type="button"
                        aria-label={`Ficha ${value}`}
                        aria-disabled={!canMove(game.board, index) || game.won}
                        onClick={() => game.tapTile(index)}
                        className={`${TILE_BASE} ${canMove(game.board, index) && !game.won ? TILE_MOVABLE : TILE_IDLE}`}
                      >
                        {value}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </GameShell>
    </ChallengeCard>
  );
}
