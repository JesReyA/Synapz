import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { GameInfo } from "../../types/games.ts";
import { SECONDARY_BUTTON } from "../challenges/ChallengeCard.tsx";

interface GameViewProps {
  game: GameInfo;
  onBack: () => void;
  children: ReactNode;
}

/**
 * Vista de un juego abierto. Al montarse, el foco pasa al botón "Volver a Retos".
 * El título visible lo pinta la `ChallengeCard` de cada juego; aquí solo hay un `h2` oculto.
 */
export function GameView({ game, onBack, children }: GameViewProps) {
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus();
  }, []);

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      <h2 className="sr-only">{game.title}</h2>
      <div>
        <button ref={backRef} type="button" onClick={onBack} className={SECONDARY_BUTTON}>
          <ArrowLeft className="size-3.5" strokeWidth={2} />
          Volver a Retos
        </button>
      </div>
      {children}
    </div>
  );
}
