"""Normaliza el resultado de cada juego a `score_ratio` ∈ [0, 1] y resuelve su β. Funciones puras."""
from app.schemas.adaptive import DifficultyLevel
from app.services.pisa_catalog import GameSpec

# Líneas completadas en Tetris que equivalen al puntaje máximo.
TETRIS_LINES_FOR_FULL_SCORE = 20
SUDOKU_ERROR_PENALTY = 0.10
SUDOKU_MAX_PENALTY = 0.50


class InvalidMetrics(ValueError):
    """Faltan métricas obligatorias o tienen valores imposibles."""


def validate_metrics(spec: GameSpec, metrics: dict[str, int | float]) -> None:
    missing = [key for key in spec.required_metrics if key not in metrics]
    if missing:
        raise InvalidMetrics(f"Faltan métricas de {spec.game_id}: {', '.join(missing)}.")
    if any(value < 0 for value in metrics.values()):
        raise InvalidMetrics("Las métricas no pueden ser negativas.")


def _fraction(numerator: float, denominator: float) -> float:
    return 0.0 if denominator <= 0 else max(0.0, min(1.0, numerator / denominator))


def score_ratio(spec: GameSpec, completed: bool, metrics: dict[str, int | float]) -> float:
    kind = spec.scoring
    if kind == "accuracy":
        return round(_fraction(metrics["correct"], metrics["total"]), 4)
    if kind == "lines":
        return round(_fraction(metrics["lines"], TETRIS_LINES_FOR_FULL_SCORE), 4)
    if not completed:
        return 0.0
    if kind == "errors":
        penalty = min(SUDOKU_MAX_PENALTY, metrics["error_count"] * SUDOKU_ERROR_PENALTY)
        return round(1.0 - penalty, 4)
    if kind == "pairs":
        return round(_fraction(metrics["pairs"], metrics["attempts"]), 4)
    return 1.0


def resolve_beta(spec: GameSpec, level: DifficultyLevel | None, metrics: dict[str, int | float]) -> float:
    if spec.game_id == "calculo":
        key = str(int(max(1, min(5, metrics["max_level"]))))
        return spec.level_betas.get(key, spec.default_beta)
    if level is not None:
        return spec.level_betas.get(level, spec.default_beta)
    return spec.default_beta
