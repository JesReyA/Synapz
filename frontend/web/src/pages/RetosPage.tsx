import { FriendsStreakPanel } from "../components/challenges/FriendsStreakPanel.tsx";
import { LiveLeaderboard } from "../components/challenges/LiveLeaderboard.tsx";
import { LogicSudokuCard } from "../components/challenges/LogicSudokuCard.tsx";
import { MentalMathTrainer } from "../components/challenges/MentalMathTrainer.tsx";
import { QuickBattleGame } from "../components/challenges/QuickBattleGame.tsx";
import { useLeaderboard } from "../hooks/useLeaderboard.ts";
import { MOCK_CLASSROOM_ID, MOCK_FRIENDS, MOCK_INVITE_CODE, MOCK_STREAK } from "../services/mockChallenges.ts";

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
        <FriendsStreakPanel streak={MOCK_STREAK} friends={MOCK_FRIENDS} inviteCode={MOCK_INVITE_CODE} />
      </div>
    </div>
  );
}
