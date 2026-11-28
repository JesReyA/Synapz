"""Acceso a datos del motor adaptativo. Único módulo que habla con Supabase."""
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Protocol
from uuid import UUID

from app.services.socioemotional import SocioProfile

if TYPE_CHECKING:
    from supabase import Client


@dataclass(frozen=True)
class AbilityRow:
    domain_id: str
    theta: float = 0.0
    items_completed: int = 0


@dataclass(frozen=True)
class RecentAttempt:
    score_ratio: float
    is_rapid_guess: bool


@dataclass(frozen=True)
class AttemptRecord:
    student_id: UUID
    game_id: str
    domain_id: str
    process_id: str
    level: str | None
    completed: bool
    beta: float
    score_ratio: float
    is_rapid_guess: bool
    theta_before: float
    theta_after: float
    general_metrics: dict[str, Any]
    game_metrics: dict[str, Any]
    events: list[dict[str, Any]]


class AdaptiveRepository(Protocol):
    def get_abilities(self, student_id: UUID) -> dict[str, AbilityRow]: ...
    def save_ability(self, student_id: UUID, ability: AbilityRow) -> None: ...
    def get_socio(self, student_id: UUID) -> SocioProfile: ...
    def save_socio(self, student_id: UUID, profile: SocioProfile) -> None: ...
    def recent_attempts(self, student_id: UUID, limit: int) -> list[RecentAttempt]: ...
    def insert_attempt(self, record: AttemptRecord) -> UUID: ...


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SupabaseAdaptiveRepository:
    """Implementación sobre PostgREST con la clave de servicio (RLS no aplica al backend)."""

    def __init__(self, client: "Client") -> None:
        self._db = client

    def get_abilities(self, student_id: UUID) -> dict[str, AbilityRow]:
        rows = (
            self._db.table("student_abilities")
            .select("domain_id, theta, items_completed")
            .eq("student_id", str(student_id))
            .execute()
            .data
        )
        return {
            row["domain_id"]: AbilityRow(row["domain_id"], float(row["theta"]), int(row["items_completed"]))
            for row in rows
        }

    def save_ability(self, student_id: UUID, ability: AbilityRow) -> None:
        self._db.table("student_abilities").upsert(
            {
                "student_id": str(student_id),
                "domain_id": ability.domain_id,
                "theta": ability.theta,
                "items_completed": ability.items_completed,
                "updated_at": _now(),
            },
            on_conflict="student_id,domain_id",
        ).execute()

    def get_socio(self, student_id: UUID) -> SocioProfile:
        rows = (
            self._db.table("student_socioemotional")
            .select("anxiety_index, self_efficacy_index, perseverance_index, metacognition_index")
            .eq("student_id", str(student_id))
            .limit(1)
            .execute()
            .data
        )
        if not rows:
            return SocioProfile()
        row = rows[0]
        return SocioProfile(
            anxiety=float(row["anxiety_index"]),
            self_efficacy=float(row["self_efficacy_index"]),
            perseverance=float(row["perseverance_index"]),
            metacognition=float(row["metacognition_index"]),
        )

    def save_socio(self, student_id: UUID, profile: SocioProfile) -> None:
        self._db.table("student_socioemotional").upsert(
            {
                "student_id": str(student_id),
                "anxiety_index": profile.anxiety,
                "self_efficacy_index": profile.self_efficacy,
                "perseverance_index": profile.perseverance,
                "metacognition_index": profile.metacognition,
                "hide_timers": profile.hide_timers,
                "auto_enable_scaffolding": profile.auto_enable_scaffolding,
                "updated_at": _now(),
            },
            on_conflict="student_id",
        ).execute()

    def recent_attempts(self, student_id: UUID, limit: int) -> list[RecentAttempt]:
        rows = (
            self._db.table("game_attempts")
            .select("score_ratio, is_rapid_guess")
            .eq("student_id", str(student_id))
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
            .data
        )
        return [RecentAttempt(float(r["score_ratio"]), bool(r["is_rapid_guess"])) for r in rows]

    def insert_attempt(self, record: AttemptRecord) -> UUID:
        row = (
            self._db.table("game_attempts")
            .insert(
                {
                    "student_id": str(record.student_id),
                    "game_id": record.game_id,
                    "domain_id": record.domain_id,
                    "process_id": record.process_id,
                    "level": record.level,
                    "completed": record.completed,
                    "beta": record.beta,
                    "score_ratio": record.score_ratio,
                    "is_rapid_guess": record.is_rapid_guess,
                    "theta_before": record.theta_before,
                    "theta_after": record.theta_after,
                    "general_metrics": record.general_metrics,
                    "game_metrics": record.game_metrics,
                    "events": record.events,
                }
            )
            .execute()
            .data[0]
        )
        return UUID(row["id"])
