import { FlipHorizontal, RotateCcw, RotateCw } from "lucide-react";
import type { KeyboardEvent } from "react";
import { formatTime } from "../../hooks/useGameTimer.ts";
import { useTangram } from "../../hooks/useTangram.ts";
import { gameInfo } from "../../lib/games/catalog.ts";
import { FIGURES } from "../../lib/games/tangram.ts";
import { ChallengeCard, SECONDARY_BUTTON } from "../challenges/ChallengeCard.tsx";
import { GameShell } from "./GameShell.tsx";
import { TangramBoard } from "./TangramBoard.tsx";

const ARROW_STEPS: Record<string, readonly [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

const CONTROL_BUTTON = `${SECONDARY_BUTTON} disabled:cursor-not-allowed disabled:opacity-50`;
const FIGURE_BASE =
  "rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none";
const FIGURE_ACTIVE = "bg-blue-600 text-white dark:bg-blue-500";
const FIGURE_IDLE =
  "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]";

export function TangramGame() {
  const game = useTangram();
  const info = gameInfo("tangram");
  const total = game.figure.solution.length;
  const canAct = game.selected !== null && !game.complete;
  const canFlip = canAct && game.selected?.kind === "parallelogram";

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const arrow = ARROW_STEPS[e.key];
    if (arrow) {
      e.preventDefault();
      game.nudge(arrow[0], arrow[1]);
      return;
    }
    const key = e.key.toLowerCase();
    if (key === "q") {
      e.preventDefault();
      game.rotate(-1);
    } else if (key === "e") {
      e.preventDefault();
      game.rotate(1);
    } else if (key === "f") {
      e.preventDefault();
      game.flip();
    }
  }

  const status = game.complete
    ? `¡Figura completa en ${formatTime(game.elapsed)}!`
    : "Arrastra las piezas para llenar la silueta.";

  return (
    <ChallengeCard title={info.title} subtitle={info.description} icon={info.icon} tone={info.tone}>
      <GameShell
        status={status}
        tone={game.complete ? "success" : "neutral"}
        elapsed={game.elapsed}
        stats={[{ label: "Piezas bien colocadas", value: `${game.matched.size}/${total}` }]}
        onReset={game.reset}
        resetLabel="Reiniciar figura"
        finished={game.complete}
      >
        <div role="group" aria-label="Figura objetivo" className="flex flex-wrap gap-2">
          {FIGURES.map((figure) => (
            <button
              key={figure.id}
              type="button"
              aria-pressed={figure.id === game.figureId}
              onClick={() => game.chooseFigure(figure.id)}
              className={`${FIGURE_BASE} ${figure.id === game.figureId ? FIGURE_ACTIVE : FIGURE_IDLE}`}
            >
              {figure.name}
            </button>
          ))}
        </div>
        <div
          role="group"
          aria-label="Área de juego del Tangram. Q y E giran la pieza, F voltea el paralelogramo y las flechas la mueven."
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="flex flex-col items-center gap-3 rounded-2xl p-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              aria-label="Rotar a la izquierda"
              title="Rotar a la izquierda (Q)"
              disabled={!canAct}
              onClick={() => game.rotate(-1)}
              className={CONTROL_BUTTON}
            >
              <RotateCcw className="size-4" strokeWidth={1.75} />
              45°
            </button>
            <button
              type="button"
              aria-label="Rotar a la derecha"
              title="Rotar a la derecha (E)"
              disabled={!canAct}
              onClick={() => game.rotate(1)}
              className={CONTROL_BUTTON}
            >
              <RotateCw className="size-4" strokeWidth={1.75} />
              45°
            </button>
            <button
              type="button"
              aria-label="Voltear"
              title="Voltear el paralelogramo (F)"
              disabled={!canFlip}
              onClick={game.flip}
              className={CONTROL_BUTTON}
            >
              <FlipHorizontal className="size-4" strokeWidth={1.75} />
              Voltear
            </button>
          </div>
          <TangramBoard
            figure={game.figure}
            pieces={game.pieces}
            matched={game.matched}
            selectedId={game.selectedId}
            disabled={game.complete}
            onSelect={game.select}
            onMove={game.movePiece}
            onDrop={game.dropPiece}
          />
        </div>
      </GameShell>
    </ChallengeCard>
  );
}
