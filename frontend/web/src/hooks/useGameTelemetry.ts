import { useCallback, useEffect, useMemo, useRef } from "react";
import { submitGameAttempt } from "../services/mockAdaptive.ts";
import type { GameOutcome, TelemetryEvent, UxAdaptationFlags } from "../types/adaptive.ts";
import type { GameId } from "../types/games.ts";

/** Pausa a partir de la cual el tiempo sin actuar cuenta como inactividad. */
const IDLE_THRESHOLD_MS = 10_000;
const MAX_EVENTS = 200;

interface Run {
  startedAt: number;
  firstActionAt: number | null;
  lastActivityAt: number;
  idleMs: number;
  blurCount: number;
  hints: number;
  restarts: number;
  events: TelemetryEvent[];
  submitted: boolean;
}

function newRun(now: number): Run {
  return {
    startedAt: now,
    firstActionAt: null,
    lastActivityAt: now,
    idleMs: 0,
    blurCount: 0,
    hints: 0,
    restarts: 0,
    events: [],
    submitted: false,
  };
}

export interface GameTelemetry {
  noteRestart: () => void;
  noteHint: () => void;
  report: (outcome: GameOutcome) => void;
}

/**
 * Telemetría genérica de una partida: primera acción, inactividad, pérdidas de foco,
 * pistas y reinicios. Al terminar, `report` la envía junto con las métricas del juego.
 * `onFlags` recibe las banderas de UX actualizadas que devuelve el motor.
 */
export function useGameTelemetry(gameId: GameId, onFlags: (flags: UxAdaptationFlags) => void): GameTelemetry {
  const runRef = useRef<Run>(newRun(0));
  const onFlagsRef = useRef(onFlags);

  useEffect(() => {
    onFlagsRef.current = onFlags;
  }, [onFlags]);

  useEffect(() => {
    runRef.current = newRun(Date.now());

    const onActivity = () => {
      const run = runRef.current;
      const now = Date.now();
      run.firstActionAt ??= now;
      const gap = now - run.lastActivityAt;
      if (gap > IDLE_THRESHOLD_MS) run.idleMs += gap;
      run.lastActivityAt = now;
    };
    const onVisibility = () => {
      const run = runRef.current;
      const now = Date.now();
      const type = document.hidden ? "WINDOW_BLUR" : "WINDOW_FOCUS";
      if (document.hidden) run.blurCount += 1;
      // El tiempo con la pestaña oculta no cuenta como inactividad.
      run.lastActivityAt = now;
      if (run.events.length < MAX_EVENTS) {
        run.events.push({ event_type: type, elapsed_ms: now - run.startedAt });
      }
    };

    document.addEventListener("pointerdown", onActivity, true);
    document.addEventListener("keydown", onActivity, true);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("pointerdown", onActivity, true);
      document.removeEventListener("keydown", onActivity, true);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const noteRestart = useCallback(() => {
    const run = runRef.current;
    if (run.submitted) runRef.current = newRun(Date.now());
    else run.restarts += 1;
  }, []);

  const noteHint = useCallback(() => {
    runRef.current.hints += 1;
  }, []);

  const report = useCallback(
    (outcome: GameOutcome) => {
      const run = runRef.current;
      if (run.submitted) return;
      run.submitted = true;
      const now = Date.now();
      void submitGameAttempt({
        game_id: gameId,
        level: outcome.level,
        completed: outcome.completed,
        general: {
          first_action_latency_ms: run.firstActionAt === null ? null : run.firstActionAt - run.startedAt,
          total_duration_ms: now - run.startedAt,
          idle_time_ms: run.idleMs,
          tab_blur_count: run.blurCount,
          hints_requested_count: run.hints,
          restart_click_count: run.restarts,
        },
        metrics: outcome.metrics,
        events: run.events,
      })
        .then((response) => onFlagsRef.current(response.ux_adaptation))
        .catch(() => undefined); // La medición nunca debe interrumpir el juego.
    },
    [gameId],
  );

  return useMemo(() => ({ noteRestart, noteHint, report }), [noteRestart, noteHint, report]);
}
