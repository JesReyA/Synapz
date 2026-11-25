"""Elige la dificultad del siguiente reto en la Zona de Desarrollo Próximo (β ≈ θ + 0.25)."""
from app.services.irt import clamp_theta
from app.services.pisa_catalog import GameSpec

ZPD_OFFSET = 0.25


def target_beta(theta: float) -> float:
    return round(clamp_theta(theta + ZPD_OFFSET), 4)


def recommend_level(spec: GameSpec, theta: float) -> str | None:
    """Nivel del juego cuyo β queda más cerca del objetivo; el más fácil gana los empates."""
    if not spec.recommends_level or not spec.level_betas:
        return None
    target = target_beta(theta)
    ordered = sorted(spec.level_betas.items(), key=lambda item: item[1])
    return min(ordered, key=lambda item: abs(item[1] - target))[0]
