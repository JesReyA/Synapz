import { MOCK_CLASSROOM_ID } from "../../services/mockChallenges.ts";
import { QuickBattleGame } from "../challenges/QuickBattleGame.tsx";

/** Batalla rápida con el aula de demostración, sin props. */
export function QuickBattleEntry() {
  return <QuickBattleGame classroomId={MOCK_CLASSROOM_ID} />;
}
