import { useEffect, useState } from "react";
import { fetchLeaderboard, subscribeLeaderboard } from "../services/mockChallenges.ts";
import type { LeaderboardEntry } from "../types/challenges.ts";

/** Ranking del aula: estado inicial (§2.11) y actualizaciones en vivo (Supabase Realtime). Hoy usa el mock. */
export function useLeaderboard(classroomId: string): LeaderboardEntry[] {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let active = true;
    void fetchLeaderboard(classroomId).then((r) => {
      if (active) setEntries(r.entries);
    });
    const unsubscribe = subscribeLeaderboard(classroomId, (next) => {
      if (active) setEntries(next);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [classroomId]);

  return entries;
}
