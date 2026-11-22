import { useEffect, useState } from "react";
import { snapshotLeaderboard, subscribeLeaderboard } from "../services/mockChallenges.ts";
import type { LeaderboardEntry } from "../types/challenges.ts";

/** Ranking del aula en vivo. Hoy usa el mock; después, Supabase Realtime vía `services/`. */
export function useLeaderboard(classroomId: string): LeaderboardEntry[] {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => snapshotLeaderboard());

  useEffect(() => subscribeLeaderboard(classroomId, setEntries), [classroomId]);

  return entries;
}
