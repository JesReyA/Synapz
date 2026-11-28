"""Índices socioemocionales (WLE) y banderas de adaptación de la interfaz. Funciones puras."""
from dataclasses import dataclass, replace

INDEX_MIN = -3.0
INDEX_MAX = 3.0
HIDE_TIMERS_ANXIETY = 0.75
SCAFFOLDING_SELF_EFFICACY = -0.60
SUCCESS_THRESHOLD = 0.5

# Constantes de ajuste por intento.
RAPID_PERSEVERANCE = -0.12
RAPID_METACOGNITION = -0.10
SUCCESS_SELF_EFFICACY = 0.08
SUCCESS_ANXIETY = -0.06
SUCCESS_AFTER_FAILURE_PERSEVERANCE = 0.10
FAILURE_SELF_EFFICACY = -0.10
FAILURE_ANXIETY = 0.15
VALID_ATTEMPT_RECOVERY = 0.03
FAILURES_FOR_ANXIETY = 2


@dataclass(frozen=True)
class SocioProfile:
    anxiety: float = 0.0
    self_efficacy: float = 0.0
    perseverance: float = 0.0
    metacognition: float = 0.0

    @property
    def hide_timers(self) -> bool:
        return self.anxiety >= HIDE_TIMERS_ANXIETY

    @property
    def auto_enable_scaffolding(self) -> bool:
        return self.self_efficacy <= SCAFFOLDING_SELF_EFFICACY


def _clip(value: float) -> float:
    return round(max(INDEX_MIN, min(INDEX_MAX, value)), 3)


def is_failure(score_ratio: float, is_rapid_guess: bool) -> bool:
    return not is_rapid_guess and score_ratio < SUCCESS_THRESHOLD


def update_indices(
    profile: SocioProfile,
    *,
    score_ratio: float,
    is_rapid_guess: bool,
    beta: float,
    theta_before: float,
    prior_consecutive_failures: int,
) -> SocioProfile:
    """Recalibra los índices tras un intento.

    - Adivinación rápida: baja perseverancia y metacognición; no toca el resto.
    - Éxito: sube autoeficacia, baja ansiedad; si venía de fallos, sube perseverancia.
    - Fallo: ansiedad sube tras `FAILURES_FOR_ANXIETY` fallos previos seguidos;
      autoeficacia baja si el reactivo era alcanzable (β ≤ θ) y ya había un fallo previo.
    - Todo intento válido recupera un poco perseverancia y metacognición.
    """
    if is_rapid_guess:
        return replace(
            profile,
            perseverance=_clip(profile.perseverance + RAPID_PERSEVERANCE),
            metacognition=_clip(profile.metacognition + RAPID_METACOGNITION),
        )

    anxiety = profile.anxiety
    self_efficacy = profile.self_efficacy
    perseverance = profile.perseverance + VALID_ATTEMPT_RECOVERY
    metacognition = profile.metacognition + VALID_ATTEMPT_RECOVERY

    if score_ratio >= SUCCESS_THRESHOLD:
        self_efficacy += SUCCESS_SELF_EFFICACY
        anxiety += SUCCESS_ANXIETY
        if prior_consecutive_failures >= 1:
            perseverance += SUCCESS_AFTER_FAILURE_PERSEVERANCE
    else:
        if prior_consecutive_failures >= FAILURES_FOR_ANXIETY:
            anxiety += FAILURE_ANXIETY
        if beta <= theta_before and prior_consecutive_failures >= 1:
            self_efficacy += FAILURE_SELF_EFFICACY

    return SocioProfile(
        anxiety=_clip(anxiety),
        self_efficacy=_clip(self_efficacy),
        perseverance=_clip(perseverance),
        metacognition=_clip(metacognition),
    )
