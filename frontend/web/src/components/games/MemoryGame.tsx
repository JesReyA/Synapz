import {
  Bell,
  Cloud,
  Flame,
  Gem,
  Heart,
  Key,
  Leaf,
  Moon,
  Music,
  Rocket,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemoryGame } from "../../hooks/useMemoryGame.ts";
import { gameInfo } from "../../lib/games/catalog.ts";
import { MEMORY_LEVELS } from "../../lib/games/memory.ts";
import { formatTime } from "../../lib/sudoku.ts";
import type { MemoryCard } from "../../types/memory.ts";
import { ChallengeCard } from "../challenges/ChallengeCard.tsx";
import { GameShell } from "./GameShell.tsx";
import type { GameStatusTone } from "./GameShell.tsx";
import { MemoryLevelPicker } from "./MemoryLevelPicker.tsx";

const GAME = gameInfo("memorama");

interface SymbolView {
  icon: LucideIcon;
  name: string;
  /** Clases literales para que Tailwind las detecte. */
  color: string;
}

/** 12 símbolos: se distinguen por icono y por color. Índice = `MemoryCard.symbol`. */
const SYMBOLS: readonly SymbolView[] = [
  { icon: Star, name: "estrella", color: "text-amber-600 dark:text-amber-400" },
  { icon: Heart, name: "corazón", color: "text-rose-600 dark:text-rose-400" },
  { icon: Moon, name: "luna", color: "text-indigo-600 dark:text-indigo-300" },
  { icon: Sun, name: "sol", color: "text-orange-600 dark:text-orange-400" },
  { icon: Cloud, name: "nube", color: "text-sky-600 dark:text-sky-400" },
  { icon: Flame, name: "llama", color: "text-red-600 dark:text-red-400" },
  { icon: Leaf, name: "hoja", color: "text-emerald-600 dark:text-emerald-400" },
  { icon: Bell, name: "campana", color: "text-teal-600 dark:text-teal-300" },
  { icon: Key, name: "llave", color: "text-fuchsia-600 dark:text-fuchsia-400" },
  { icon: Gem, name: "gema", color: "text-cyan-600 dark:text-cyan-300" },
  { icon: Music, name: "nota musical", color: "text-violet-600 dark:text-violet-300" },
  { icon: Rocket, name: "cohete", color: "text-blue-600 dark:text-blue-400" },
];

/** Columnas por nivel como clases literales (rows × cols de MEMORY_LEVELS). */
const GRID_COLS: Record<number, string> = {
  4: "grid-cols-4",
  6: "grid-cols-6",
};

const FACE = "absolute inset-0 grid place-items-center rounded-lg border [backface-visibility:hidden] sm:rounded-xl";

interface MemoryCardButtonProps {
  card: MemoryCard;
  index: number;
  locked: boolean;
  disabled: boolean;
  onFlip: (index: number) => void;
}

function MemoryCardButton({ card, index, locked, disabled, onFlip }: MemoryCardButtonProps) {
  const symbol = SYMBOLS[card.symbol];
  const Icon = symbol?.icon ?? Sparkles;
  const revealed = card.faceUp || card.matched;
  const position = `Carta ${index + 1}`;
  const label = !revealed
    ? `${position}, boca abajo`
    : card.matched
      ? `${position}: ${symbol?.name}, encontrada`
      : `${position}: ${symbol?.name}`;

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={revealed}
      aria-disabled={card.matched || locked || disabled}
      onClick={() => onFlip(index)}
      className="aspect-square w-full min-w-0 rounded-lg [perspective:600px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:rounded-xl dark:focus-visible:ring-offset-[#131A29]"
    >
      <span
        className={`relative block size-full transition-transform duration-300 [transform-style:preserve-3d] motion-reduce:transition-none ${
          revealed ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        <span
          className={`${FACE} border-blue-200 bg-blue-100 text-blue-500 dark:border-[#2A3347] dark:bg-[#1B2438] dark:text-blue-300`}
        >
          <Sparkles aria-hidden="true" className="size-1/2" strokeWidth={1.75} />
        </span>
        <span
          className={`${FACE} [transform:rotateY(180deg)] ${
            card.matched
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-400/40 dark:bg-emerald-400/15"
              : "border-slate-200 bg-white dark:border-[#2A3347] dark:bg-[#161E30]"
          } ${symbol?.color ?? ""}`}
        >
          <Icon aria-hidden="true" className="size-3/5" strokeWidth={2} />
        </span>
      </span>
    </button>
  );
}

export function MemoryGame() {
  const game = useMemoryGame();
  const { state } = game;
  const { cols } = MEMORY_LEVELS[game.difficulty];

  let status = "Voltea dos cartas para encontrar una pareja.";
  let tone: GameStatusTone = "neutral";
  if (game.finished) {
    status = `¡Encontraste todas las parejas en ${state.attempts} intentos y ${formatTime(game.elapsed)}!`;
    tone = "success";
  } else if (game.locked) {
    status = "No coinciden. Se ocultarán en un momento.";
  }

  return (
    <ChallengeCard title={GAME.title} subtitle={GAME.description} icon={GAME.icon} tone={GAME.tone}>
      <MemoryLevelPicker value={game.difficulty} onChange={game.changeDifficulty} />

      <GameShell
        status={status}
        tone={tone}
        elapsed={game.elapsed}
        stats={[
          { label: "Intentos", value: String(state.attempts) },
          { label: "Parejas", value: `${state.pairsFound}/${state.totalPairs}` },
        ]}
        onReset={game.reset}
        finished={game.finished}
      >
        <div
          role="group"
          aria-label={`Tablero de Memorama con ${state.cards.length} cartas`}
          className={`mx-auto grid w-full max-w-[28rem] min-w-0 gap-1.5 sm:gap-2.5 ${GRID_COLS[cols] ?? "grid-cols-4"}`}
        >
          {state.cards.map((card, index) => (
            <MemoryCardButton
              key={card.id}
              card={card}
              index={index}
              locked={game.locked}
              disabled={game.finished}
              onFlip={game.flipCard}
            />
          ))}
        </div>
      </GameShell>
    </ChallengeCard>
  );
}
