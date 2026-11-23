import { FriendsStreakPanel } from "../components/challenges/FriendsStreakPanel.tsx";
import { LiveLeaderboard } from "../components/challenges/LiveLeaderboard.tsx";
import { LogicSudokuCard } from "../components/challenges/LogicSudokuCard.tsx";
import { MentalMathTrainer } from "../components/challenges/MentalMathTrainer.tsx";
import { QuickBattleGame } from "../components/challenges/QuickBattleGame.tsx";
import { useLeaderboard } from "../hooks/useLeaderboard.ts";
import { toDay } from "../lib/progressAnalysis.ts";
import { MOCK_CLASSROOM_ID, MOCK_STREAK_FRIENDS } from "../services/mockChallenges.ts";

export function RetosPage() {
  const leaderboard = useLeaderboard(MOCK_CLASSROOM_ID);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] md:gap-5">
      <div className="flex min-w-0 flex-col gap-4 md:gap-5">
        <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <QuickBattleGame classroomId={MOCK_CLASSROOM_ID} />
          <LiveLeaderboard entries={leaderboard} />
        </div>
        <MentalMathTrainer />
        <LogicSudokuCard />
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
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
