"""Teoría de Respuesta al Ítem (modelo logístico de 2 parámetros). Funciones puras."""
import math

THETA_MIN = -3.5
THETA_MAX = 3.5
DEFAULT_ALPHA = 1.0
BASE_LEARNING_RATE = 0.60
MIN_STEP = 0.15
HINT_PENALTY = 0.15
_MAX_EXPONENT = 20.0


def clamp_theta(theta: float) -> float:
    return max(THETA_MIN, min(THETA_MAX, theta))


def expected_probability(theta: float, beta: float, alpha: float = DEFAULT_ALPHA) -> float:
    """P(Y=1 | θ) = 1 / (1 + e^(-α(θ-β)))."""
    exponent = max(-_MAX_EXPONENT, min(_MAX_EXPONENT, -alpha * (theta - beta)))
    return 1.0 / (1.0 + math.exp(exponent))


def update_theta(
    theta: float,
    beta: float,
    score_ratio: float,
    items_completed: int,
    hints_used: int = 0,
    alpha: float = DEFAULT_ALPHA,
) -> float:
    """θ(t+1) = θ(t) + K/(1+0.05N) · α · (S - P). La tasa nunca baja de `MIN_STEP`."""
    effective_score = max(0.0, min(1.0, score_ratio) - HINT_PENALTY * hints_used)
    step = max(MIN_STEP, BASE_LEARNING_RATE / (1.0 + 0.05 * items_completed))
    probability = expected_probability(theta, beta, alpha)
    return round(clamp_theta(theta + step * alpha * (effective_score - probability)), 4)
