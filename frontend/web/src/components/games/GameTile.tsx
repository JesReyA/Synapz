import { ArrowRight } from "lucide-react";
import type { ChallengeTone } from "../challenges/ChallengeCard.tsx";
import type { GameId, GameInfo, GameTileHeight } from "../../types/games.ts";
import { GamePreview, type PreviewSize } from "./GamePreview.tsx";

interface GameTileProps {
  game: GameInfo;
  onOpen: (id: GameId) => void;
}

const ICON_BOX: Record<ChallengeTone, string> = {
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
  emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-400",
  violet: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300",
};

/** `short` no lleva vista previa. */
const PREVIEW_SIZE: Record<GameTileHeight, PreviewSize | null> = {
  short: null,
  medium: "small",
  tall: "large",
};

/**
 * Tarjeta de un juego en la cuadrícula. El botón ocupa toda la tarjeta y lleva
 * `data-game-id` para que `GamesMasonry` pueda devolverle el foco.
 */
export function GameTile({ game, onOpen }: GameTileProps) {
  const Icon = game.icon;
  const previewSize = PREVIEW_SIZE[game.height];
  return (
    <button
      type="button"
      data-game-id={game.id}
      aria-label={`Jugar a ${game.title}`}
      onClick={() => onOpen(game.id)}
      className="group flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-[#222B3E] dark:bg-[#131A29] dark:shadow-none dark:hover:border-[#2d3a56] dark:focus-visible:ring-offset-[#0B0F1A]"
    >
      <span className="flex items-center gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${ICON_BOX[game.tone]}`}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 text-sm font-semibold text-slate-900 dark:text-white">{game.title}</span>
      </span>
      {previewSize !== null && <GamePreview id={game.id} size={previewSize} />}
      <span className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{game.description}</span>
      <span className="flex flex-wrap gap-1.5">
        {game.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-[#1B2438] dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </span>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-300">
        Jugar
        <ArrowRight
          className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
          strokeWidth={2}
        />
      </span>
    </button>
  );
}
