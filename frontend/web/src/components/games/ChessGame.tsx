import { useChess } from "../../hooks/useChess.ts";
import { gameInfo } from "../../lib/games/catalog.ts";
import { COLOR_NAME_PLURAL } from "../../lib/games/chessDisplay.ts";
import type { ChessStatus, Color } from "../../types/chess.ts";
import { ChallengeCard } from "../challenges/ChallengeCard.tsx";
import type { GameStatusTone } from "./GameShell.tsx";
import { GameShell } from "./GameShell.tsx";
import { ChessBoard } from "./ChessBoard.tsx";
import { ChessHistory } from "./ChessHistory.tsx";
import { PromotionPicker } from "./PromotionPicker.tsx";

function describeStatus(status: ChessStatus, turn: Color, promoting: boolean): { text: string; tone: GameStatusTone } {
  switch (status.kind) {
    case "checkmate":
      return { text: `Jaque mate: ganan las ${COLOR_NAME_PLURAL[status.winner]}.`, tone: "success" };
    case "stalemate":
      return { text: "Tablas por ahogado.", tone: "neutral" };
    case "draw-material":
      return { text: "Tablas por material insuficiente.", tone: "neutral" };
    case "playing":
      if (promoting) return { text: "Elige la pieza de promoción.", tone: "neutral" };
      return status.check
        ? { text: `Jaque. Turno de las ${COLOR_NAME_PLURAL[turn]}.`, tone: "danger" }
        : { text: `Turno de las ${COLOR_NAME_PLURAL[turn]}.`, tone: "neutral" };
  }
}

/** Ajedrez para dos jugadores en el mismo dispositivo. */
export function ChessGame() {
  const chess = useChess();
  const info = gameInfo("ajedrez");
  const { game } = chess;

  const { text, tone } = describeStatus(chess.status, game.turn, chess.pendingPromotion !== null);

  return (
    <ChallengeCard title={info.title} subtitle={info.description} icon={info.icon} tone={info.tone}>
      <GameShell
        status={text}
        tone={tone}
        stats={[
          { label: "Turno", value: game.turn === "w" ? "Blancas" : "Negras" },
          { label: "Movimientos", value: String(game.history.length) },
        ]}
        onReset={chess.reset}
        finished={chess.ended}
      >
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <ChessBoard
              board={game.board}
              selected={chess.selected}
              targets={chess.targets}
              checkSquare={chess.checkSquare}
              lastMove={chess.lastMove}
              disabled={chess.ended || chess.pendingPromotion !== null}
              onTap={chess.tapSquare}
            />
            {chess.pendingPromotion !== null && (
              <PromotionPicker
                color={game.turn}
                onChoose={chess.choosePromotion}
                onCancel={chess.cancelPromotion}
              />
            )}
          </div>
          <div className="min-w-0 md:w-44 md:shrink-0">
            <ChessHistory history={game.history} />
          </div>
        </div>
      </GameShell>
    </ChallengeCard>
  );
}
