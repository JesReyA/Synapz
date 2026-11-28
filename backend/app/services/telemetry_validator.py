"""Descarta intentos sin valor psicométrico (adivinación rápida). Funciones puras."""
from app.services.pisa_catalog import GameSpec

# Juegos de ráfaga: tiempo medio por respuesta bajo el umbral con precisión baja.
RAPID_AVG_RESPONSE_MS = 800
RAPID_MAX_ACCURACY = 0.5


def is_rapid_guess(
    spec: GameSpec,
    metrics: dict[str, int | float],
    total_duration_ms: int,
) -> bool:
    if spec.burst:
        total = metrics["total"]
        if total <= 0:
            return False
        accuracy = metrics["correct"] / total
        return metrics["avg_response_ms"] < RAPID_AVG_RESPONSE_MS and accuracy < RAPID_MAX_ACCURACY
    return total_duration_ms < spec.min_valid_duration_ms
