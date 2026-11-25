import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { GameSessionContext } from "../../context/gameSessionContextValue.ts";
import type { GameSessionValue } from "../../context/gameSessionContextValue.ts";
import { useGameTelemetry } from "../../hooks/useGameTelemetry.ts";
import { fetchDifficulty } from "../../services/mockAdaptive.ts";
import type { DifficultyLevel, UxAdaptationFlags } from "../../types/adaptive.ts";
import type { GameId } from "../../types/games.ts";

/** Si el motor no responde a tiempo, el juego arranca con su dificultad por defecto. */
const FETCH_TIMEOUT_MS = 1500;
const NO_FLAGS: UxAdaptationFlags = { hide_timers: false, auto_enable_scaffolding: false };

interface Loaded {
  level: DifficultyLevel | null;
  flags: UxAdaptationFlags;
}

interface AdaptiveGameBoundaryProps {
  gameId: GameId;
  children: ReactNode;
}

/**
 * Envuelve un juego: pide la dificultad recomendada antes de montarlo, mide la partida
 * y comparte con él las banderas de UX. Si algo falla, el juego se comporta como antes.
 */
export function AdaptiveGameBoundary({ gameId, children }: AdaptiveGameBoundaryProps) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [flags, setFlags] = useState<UxAdaptationFlags>(NO_FLAGS);
  const telemetry = useGameTelemetry(gameId, setFlags);

  useEffect(() => {
    let active = true;
    let settled = false;
    const fallback = window.setTimeout(() => {
      if (!active || settled) return;
      settled = true;
      setLoaded({ level: null, flags: NO_FLAGS });
    }, FETCH_TIMEOUT_MS);
    fetchDifficulty(gameId)
      .then((rec) => ({ level: rec.recommended_level, flags: rec.ux_adaptation }))
      .catch((): Loaded => ({ level: null, flags: NO_FLAGS }))
      .then((result) => {
        if (!active || settled) return;
        settled = true;
        window.clearTimeout(fallback);
        setLoaded(result);
        setFlags(result.flags);
      });
    return () => {
      active = false;
      window.clearTimeout(fallback);
    };
  }, [gameId]);

  const recommendedLevel = loaded?.level ?? null;
  const value = useMemo<GameSessionValue>(
    () => ({
      recommendedLevel,
      hideTimers: flags.hide_timers,
      autoScaffolding: flags.auto_enable_scaffolding,
      ...telemetry,
    }),
    [recommendedLevel, flags, telemetry],
  );

  if (loaded === null) {
    return (
      <div className="grid min-h-40 place-items-center" role="status" aria-label="Preparando el juego">
        <Loader2 className="size-5 animate-spin text-slate-400" />
      </div>
    );
  }
  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}
