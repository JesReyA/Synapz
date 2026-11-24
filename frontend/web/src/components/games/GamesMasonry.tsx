import { useEffect, useRef } from "react";
import { GAMES } from "../../lib/games/catalog.ts";
import type { GameId } from "../../types/games.ts";
import { GameTile } from "./GameTile.tsx";

interface GamesMasonryProps {
  onOpen: (id: GameId) => void;
  /** Juego que se acaba de cerrar: su tarjeta recupera el foco al montar. */
  lastOpened?: GameId | null;
}

/** Cuadrícula Masonry (columnas CSS) con una tarjeta por juego, en el orden del catálogo. */
export function GamesMasonry({ onOpen, lastOpened = null }: GamesMasonryProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastOpened === null) return;
    listRef.current?.querySelector<HTMLButtonElement>(`[data-game-id="${lastOpened}"]`)?.focus();
  }, [lastOpened]);

  return (
    <section aria-labelledby="games-heading" className="flex min-w-0 flex-col gap-4">
      <h2 id="games-heading" className="text-sm font-semibold text-slate-900 dark:text-white">
        Elige un juego
      </h2>
      <div ref={listRef} role="list" className="columns-1 gap-4 sm:columns-2 xl:columns-3 md:gap-5">
        {GAMES.map((game) => (
          <div key={game.id} role="listitem" className="mb-4 break-inside-avoid md:mb-5">
            <GameTile game={game} onOpen={onOpen} />
          </div>
        ))}
      </div>
    </section>
  );
}
