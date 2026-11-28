"""Motor adaptativo PISA. Espejo de API_CONTRACT.md §2.17."""
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.progress import ReferenceLevel

GameId = Literal[
    "batalla", "calculo", "sudoku", "ajedrez", "quince", "buscaminas", "tangram", "tetris", "memorama"
]
DomainId = Literal["MATH", "READ", "SCIE", "COMP"]
DifficultyLevel = Literal["facil", "medio", "dificil"]


class UxAdaptationFlags(BaseModel):
    hide_timers: bool
    auto_enable_scaffolding: bool


class DomainAbility(BaseModel):
    domain_id: DomainId
    theta: float = Field(ge=-3.5, le=3.5)
    pisa_scaled_score: int
    pisa_level: int = Field(ge=1, le=6)
    pisa_label: str
    items_completed: int = Field(ge=0)


class SocioemotionalIndices(BaseModel):
    anxiety: float
    self_efficacy: float
    perseverance: float
    metacognition: float


# ---------- POST /api/adaptive/game-attempts ----------


class GeneralMetrics(BaseModel):
    first_action_latency_ms: int | None = Field(default=None, ge=0)
    total_duration_ms: int = Field(ge=0, le=86_400_000)
    idle_time_ms: int = Field(default=0, ge=0)
    tab_blur_count: int = Field(default=0, ge=0)
    hints_requested_count: int = Field(default=0, ge=0)
    restart_click_count: int = Field(default=0, ge=0)


class TelemetryEvent(BaseModel):
    event_type: Literal["WINDOW_BLUR", "WINDOW_FOCUS"]
    elapsed_ms: int = Field(ge=0)
    payload: dict[str, Any] | None = None


class GameAttemptRequest(BaseModel):
    game_id: GameId
    level: DifficultyLevel | None = None
    completed: bool
    general: GeneralMetrics
    metrics: dict[str, int | float] = Field(default_factory=dict)
    events: list[TelemetryEvent] = Field(default_factory=list, max_length=200)


class GameAttemptResponse(BaseModel):
    attempt_id: UUID
    is_rapid_guess: bool
    score_ratio: float = Field(ge=0, le=1)
    beta: float
    theta_before: float
    ability: DomainAbility
    ux_adaptation: UxAdaptationFlags


# ---------- GET /api/adaptive/difficulty/{game_id} ----------


class DifficultyRecommendation(BaseModel):
    game_id: GameId
    domain_id: DomainId
    theta: float
    target_beta: float
    recommended_level: DifficultyLevel | None = None
    ux_adaptation: UxAdaptationFlags


# ---------- GET /api/adaptive/profile ----------


class AdaptiveProfileResponse(BaseModel):
    student_id: UUID
    abilities: list[DomainAbility]
    indices: SocioemotionalIndices
    ux_adaptation: UxAdaptationFlags
    reference_level: ReferenceLevel | None = None
