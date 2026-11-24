import { useState } from "react";
import { FriendsStreakPanel } from "../components/challenges/FriendsStreakPanel.tsx";
import { LiveLeaderboard } from "../components/challenges/LiveLeaderboard.tsx";
import { GAME_COMPONENTS } from "../components/games/gameRegistry.tsx";
import { GamesMasonry } from "../components/games/GamesMasonry.tsx";
import { GameView } from "../components/games/GameView.tsx";
import { useLeaderboard } from "../hooks/useLeaderboard.ts";
import { gameInfo } from "../lib/games/catalog.ts";
import { toDay } from "../lib/progressAnalysis.ts";
import { MOCK_CLASSROOM_ID, MOCK_STREAK_FRIENDS } from "../services/mockChallenges.ts";
import type { GameId } from "../types/games.ts";

export function RetosPage() {
  const leaderboard = useLeaderboard(MOCK_CLASSROOM_ID);
  const [openGame, setOpenGame] = useState<GameId | null>(null);
  const [lastOpened, setLastOpened] = useState<GameId | null>(null);

  const handleOpen = (id: GameId) => {
    setLastOpened(id);
    setOpenGame(id);
  };

  const OpenGameComponent = openGame === null ? null : GAME_COMPONENTS[openGame];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] md:gap-5">
      <div className="min-w-0">
        {openGame === null || OpenGameComponent === null ? (
          <GamesMasonry onOpen={handleOpen} lastOpened={lastOpened} />
        ) : (
          <GameView game={gameInfo(openGame)} onBack={() => setOpenGame(null)}>
            <OpenGameComponent />
          </GameView>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-4 md:gap-5 lg:sticky lg:top-6 lg:self-start">
        <LiveLeaderboard entries={leaderboard} />
        <FriendsStreakPanel
          streak={MOCK_STREAK_FRIENDS.streak}
          friends={MOCK_STREAK_FRIENDS.friends}
          inviteCode={MOCK_STREAK_FRIENDS.invite_code}
          today={toDay(MOCK_STREAK_FRIENDS.generated_at)}
        />
      </div>
    </div>
  );
}
