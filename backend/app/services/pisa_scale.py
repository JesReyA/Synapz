"""Conversión de θ (logits) a la escala PISA y a su nivel de desempeño. Funciones puras.

Los umbrales siguen la tabla de `marco-de-evaluación-pisa` (steering). Es la única
tabla de niveles del proyecto: no duplicar estos valores en otro archivo.
"""
from dataclasses import dataclass

from app.schemas.progress import ReferenceLevel

MAX_LEVEL = 6


@dataclass(frozen=True)
class PisaLevel:
    level: int
    label: str
    min_score: int
    description: str


# Del más alto al más bajo. `level` 1 aparece dos veces (1a y 1b/1c).
_LEVELS: tuple[PisaLevel, ...] = (
    PisaLevel(6, "Nivel 6", 669, "Desarrolla modelos y estrategias avanzadas para situaciones complejas y comunica argumentos rigurosos."),
    PisaLevel(5, "Nivel 5", 571, "Trabaja con modelos de situaciones complejas e integra distintas representaciones."),
    PisaLevel(4, "Nivel 4", 510, "Trabaja con modelos explícitos en situaciones complejas y argumenta con razonamientos estructurados."),
    PisaLevel(3, "Nivel 3", 448, "Ejecuta procedimientos claramente descritos e interpreta representaciones de distintas fuentes."),
    PisaLevel(2, "Nivel 2 (competencia básica)", 387, "Reconoce situaciones que requieren inferencias directas y extrae información de una sola fuente."),
    PisaLevel(1, "Nivel 1a", 326, "Responde preguntas de contextos familiares donde toda la información es explícita."),
    PisaLevel(1, "Nivel 1b/1c", 0, "Resuelve solo tareas rutinarias simples con instrucciones paso a paso."),
)


def theta_to_score(theta: float) -> int:
    """Puntuación PISA = 500 + θ · 100."""
    return int(round(500 + theta * 100))


def level_for_score(score: int) -> PisaLevel:
    for level in _LEVELS:
        if score >= level.min_score:
            return level
    return _LEVELS[-1]


def theta_to_placement(theta: float) -> tuple[int, PisaLevel]:
    score = theta_to_score(theta)
    return score, level_for_score(score)


def reference_level_for(theta: float) -> ReferenceLevel:
    _, level = theta_to_placement(theta)
    return ReferenceLevel(
        framework="PISA",
        level=level.level,
        max_level=MAX_LEVEL,
        label=level.label,
        description=level.description,
    )
