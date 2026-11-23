import type {
  LeaderboardEntry,
  LeaderboardResponse,
  LocalQuickGame,
  QuickGameSummary,
  StreakFriendsResponse,
  SubmitQuickGameResponse,
} from "../types/challenges.ts";
import { buildQuickGame } from "../lib/quickGame.ts";
import { randInt } from "../lib/random.ts";

/**
 * Servicio mock de Retos. Cada función mantiene la firma que tendrá la versión real:
 *  - fetchLeaderboard     → GET  /api/math/leaderboard (§2.11)
 *  - fetchQuickGame       → GET  /api/math/quick-game
 *  - submitQuickGame      → POST /api/math/quick-game/submit
 *  - subscribeLeaderboard → Supabase Realtime sobre `math_game_scores`
 *    (postgres_changes, filtro `classroom_id=eq.<id>`).
 * Al conectar Supabase solo se reemplaza este archivo.
 */

export const MOCK_CLASSROOM_ID = "mock-classroom-matematicas";
export const MY_STUDENT_ID = "me";

const scores = new Map<string, LeaderboardEntry>([
  ["s1", { student_id: "s1", name: "Valeria M.", points: 1480, is_me: false }],
  ["s2", { student_id: "s2", name: "Diego R.", points: 1320, is_me: false }],
  [MY_STUDENT_ID, { student_id: MY_STUDENT_ID, name: "Alex R.", points: 940, is_me: true }],
  ["s3", { student_id: "s3", name: "Camila T.", points: 870, is_me: false }],
  ["s4", { student_id: "s4", name: "Mateo L.", points: 610, is_me: false }],
  ["s5", { student_id: "s5", name: "Sofía P.", points: 450, is_me: false }],
]);

type Listener = (entries: LeaderboardEntry[]) => void;
const listeners = new Set<Listener>();

export function snapshotLeaderboard(): LeaderboardEntry[] {
  return [...scores.values()].sort((a, b) => b.points - a.points);
}

function emit(): void {
  const snap = snapshotLeaderboard();
  listeners.forEach((fn) => fn(snap));
}

/** Simula a otros alumnos jugando: suben puntos cada pocos segundos. */
let rivalTimer: number | null = null;
function startRivals(): void {
  if (rivalTimer !== null) return;
  rivalTimer = window.setInterval(() => {
    const rivals = [...scores.values()].filter((s) => !s.is_me);
    const rival = rivals[randInt(0, rivals.length - 1)];
    if (!rival) return;
    scores.set(rival.student_id, { ...rival, points: rival.points + randInt(40, 160) });
    emit();
  }, 6000);
}

function stopRivals(): void {
  if (rivalTimer === null) return;
  window.clearInterval(rivalTimer);
  rivalTimer = null;
}

export function subscribeLeaderboard(classroomId: string, onChange: Listener): () => void {
  void classroomId; // el mock es global; Realtime filtrará por `classroom_id`
  listeners.add(onChange);
  startRivals();
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) stopRivals();
  };
}

export async function fetchLeaderboard(classroomId: string): Promise<LeaderboardResponse> {
  return { classroom_id: classroomId, generated_at: new Date().toISOString(), entries: snapshotLeaderboard() };
}

export async function fetchQuickGame(classroomId: string): Promise<LocalQuickGame> {
  void classroomId;
  return buildQuickGame();
}

export async function submitQuickGame(summary: QuickGameSummary): Promise<SubmitQuickGameResponse> {
  const me = scores.get(MY_STUDENT_ID);
  if (me) scores.set(MY_STUDENT_ID, { ...me, points: me.points + summary.points });
  emit();
  const rank = snapshotLeaderboard().findIndex((s) => s.is_me) + 1;
  return { points: summary.points, correct: summary.correct, total: summary.total, rank };
}

/* ---------- Rachas y amigos (§2.12) ---------- */

/** Semana del lunes 5 al domingo 11 de mayo de 2025, igual que el mock de Progreso. */
export const MOCK_STREAK_FRIENDS: StreakFriendsResponse = {
  classroom_id: MOCK_CLASSROOM_ID,
  generated_at: "2025-05-11T12:00:00Z",
  invite_code: "K7P2Q9",
  streak: {
    current_days: 5,
    best_days: 12,
    week: [
      { date: "2025-05-05", active: false },
      { date: "2025-05-06", active: false },
      { date: "2025-05-07", active: true },
      { date: "2025-05-08", active: true },
      { date: "2025-05-09", active: true },
      { date: "2025-05-10", active: true },
      { date: "2025-05-11", active: true },
    ],
  },
  friends: [
    { student_id: "s1", name: "Valeria M.", weekly_points: 1240, is_me: false },
    { student_id: MY_STUDENT_ID, name: "Alex R.", weekly_points: 980, is_me: true },
    { student_id: "s2", name: "Diego R.", weekly_points: 910, is_me: false },
    { student_id: "s3", name: "Camila T.", weekly_points: 640, is_me: false },
  ],
};