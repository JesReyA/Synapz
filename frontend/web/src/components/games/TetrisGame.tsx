import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, Pause, Play, RotateCw } from "lucide-react";
import { useRef } from "react";
import type { KeyboardEvent } from "react";
import { useTetris } from "../../hooks/useTetris.ts";
import { gameInfo } from "../../lib/games/catalog.ts";
import { ChallengeCard } from "../challenges/ChallengeCard.tsx";
import { GameShell } from "./GameShell.tsx";
import { TetrisBoard } from "./TetrisBoard.tsx";

const CONTROL_BUTTON =
  "inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-150 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none aria-disabled:opacity-50 dark:bg-[#1B2438] dark:text-blue-100 dark:hover:bg-[#222d47]";

export function TetrisGame() {
  const game = useTetris();
  const info = gameInfo("tetris");
  const containerRef = useRef<HTMLDivElement>(null);
  const { state } = game;

  const over = state.status === "over";
  const paused = state.status === "paused";
  const inactive = state.status !== "playing";

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Sobre un botón, Espacio lo activa de forma nativa.
    if (e.key === " " && e.target instanceof HTMLButtonElement) return;

    switch (e.key) {
      case "ArrowLeft":
        game.left();
        break;
      case "ArrowRight":
        game.right();
        break;
      case "ArrowDown":
        game.soft();
        break;
      case "ArrowUp":
      case "x":
      case "X":
        game.rotateCw();
        break;
      case "z":
      case "Z":
        game.rotateCcw();
        break;
      case " ":
        if (!e.repeat) game.hard();
        break;
      case "p":
      case "P":
        if (!e.repeat) game.togglePause();
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  function handleReset() {
    game.reset();
    containerRef.current?.focus();
  }

  const status = over
    ? `Game over. Puntuación final: ${state.score}.`
    : paused
      ? "En pausa."
      : "Jugando. Flechas para mover, ↑ rotar, Espacio caída rápida, P pausa.";

  return (
    <ChallengeCard title={info.title} subtitle={info.description} icon={info.icon} tone={info.tone}>
      <GameShell
        status={status}
        tone={over ? "danger" : "neutral"}
        stats={[
          { label: "Puntuación", value: String(state.score) },
          { label: "Líneas", value: String(state.lines) },
          { label: "Nivel", value: String(state.level) },
        ]}
        onReset={handleReset}
        finished={over}
      >
        <div
          ref={containerRef}
          role="group"
          aria-label="Zona de juego de Tetris"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="flex flex-col gap-4 rounded-2xl p-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          <TetrisBoard state={state} />
          <div className="mx-auto grid w-full max-w-[18rem] grid-cols-3 gap-2">
            <button
              type="button"
              aria-label="Mover a la izquierda"
              aria-disabled={inactive}
              onClick={game.left}
              className={CONTROL_BUTTON}
            >
              <ArrowLeft className="size-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Rotar"
              aria-disabled={inactive}
              onClick={game.rotateCw}
              className={CONTROL_BUTTON}
            >
              <RotateCw className="size-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Mover a la derecha"
              aria-disabled={inactive}
              onClick={game.right}
              className={CONTROL_BUTTON}
            >
              <ArrowRight className="size-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Bajar una fila"
              aria-disabled={inactive}
              onClick={game.soft}
              className={CONTROL_BUTTON}
            >
              <ArrowDown className="size-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label="Caída rápida"
              aria-disabled={inactive}
              onClick={game.hard}
              className={CONTROL_BUTTON}
            >
              <ChevronsDown className="size-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              aria-label={paused ? "Reanudar" : "Pausar"}
              aria-disabled={over}
              onClick={game.togglePause}
              className={CONTROL_BUTTON}
            >
              {paused ? (
                <Play className="size-5" strokeWidth={2} />
              ) : (
                <Pause className="size-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </GameShell>
    </ChallengeCard>
  );
}
