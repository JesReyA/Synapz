"""Mapeo de cada juego de Retos a un dominio y proceso PISA, y su dificultad β por nivel.

Los ids de juego son los del frontend (`frontend/web/src/types/games.ts`). El frontend no
conoce PISA: todo el mapeo vive aquí. Los valores de β y los tiempos mínimos son los puntos
de partida de `integración-pisa-en-minijuegos` y se calibrarán con datos reales.
"""
from dataclasses import dataclass, field
from typing import Literal

from app.schemas.adaptive import DomainId, GameId

ScoringKind = Literal["errors", "pairs", "binary", "lines", "accuracy"]


@dataclass(frozen=True)
class GameSpec:
    game_id: GameId
    domain: DomainId
    process: str
    scored: bool = True
    scoring: ScoringKind = "binary"
    default_beta: float = 0.0
    # β por nivel que ofrece el juego (clave = nivel del frontend).
    level_betas: dict[str, float] = field(default_factory=dict)
    # El juego arranca en el nivel recomendado (Sudoku, Memorama, Buscaminas).
    recommends_level: bool = False
    # Métricas obligatorias en `metrics`.
    required_metrics: tuple[str, ...] = ()
    # Una partida más corta que esto no se considera un intento válido.
    min_valid_duration_ms: int = 0
    # Juegos de ráfaga: se juzgan por tiempo medio de respuesta y precisión.
    burst: bool = False


GAME_SPECS: dict[GameId, GameSpec] = {
    spec.game_id: spec
    for spec in (
        GameSpec(
            "sudoku", "MATH", "MATH_EMPLOY", scoring="errors", recommends_level=True,
            level_betas={"facil": -1.5, "medio": 0.2, "dificil": 1.8}, default_beta=0.2,
            required_metrics=("error_count",), min_valid_duration_ms=20_000,
        ),
        GameSpec(
            "memorama", "READ", "READ_LOCALIZE", scoring="pairs", recommends_level=True,
            level_betas={"facil": -1.2, "medio": 0.1, "dificil": 1.5}, default_beta=0.1,
            required_metrics=("attempts", "pairs"), min_valid_duration_ms=8_000,
        ),
        GameSpec(
            "buscaminas", "SCIE", "SCIE_INTERPRET", scoring="binary", recommends_level=True,
            level_betas={"facil": -1.2, "medio": 0.4, "dificil": 2.0}, default_beta=0.4,
            min_valid_duration_ms=3_000,
        ),
        GameSpec(
            "quince", "MATH", "MATH_EMPLOY", scoring="binary", default_beta=0.0,
            required_metrics=("moves",), min_valid_duration_ms=5_000,
        ),
        GameSpec(
            "tangram", "MATH", "MATH_SPATIAL", scoring="binary", default_beta=1.5,
            min_valid_duration_ms=8_000,
        ),
        GameSpec(
            "tetris", "COMP", "COMP_THINK_REALTIME", scoring="lines", default_beta=0.0,
            required_metrics=("lines",), min_valid_duration_ms=15_000,
        ),
        GameSpec(
            "calculo", "MATH", "MATH_EMPLOY_QUANTITY", scoring="accuracy", burst=True,
            level_betas={"1": -1.2, "2": -0.6, "3": 0.0, "4": 0.9, "5": 1.8}, default_beta=0.0,
            required_metrics=("correct", "total", "avg_response_ms", "max_level"),
        ),
        GameSpec(
            "batalla", "MATH", "MATH_EMPLOY", scoring="accuracy", burst=True, default_beta=0.0,
            required_metrics=("correct", "total", "avg_response_ms"),
        ),
        # Partida entre dos personas en el mismo dispositivo: no mide a un alumno.
        GameSpec("ajedrez", "COMP", "COMP_THINK", scored=False),
    )
}


def get_spec(game_id: GameId) -> GameSpec:
    return GAME_SPECS[game_id]
