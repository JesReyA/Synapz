"""Acceso a datos del motor adaptativo. Único módulo que habla con PostgreSQL (Foundathyon) para estas tablas."""
from dataclasses import dataclass
from typing import Any, Protocol
from uuid import UUID

from psycopg.types.json import Jsonb
from psycopg_pool import ConnectionPool

from app.services.socioemotional import SocioProfile


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


class PostgresAdaptiveRepository:
    """Implementación sobre PostgreSQL con consultas parametrizadas. La autorización la hace el router."""

    def __init__(self, pool: ConnectionPool) -> None:
        self._pool = pool

    def get_abilities(self, student_id: UUID) -> dict[str, AbilityRow]:
        with self._pool.connection() as conn:
            rows = conn.execute(
                "SELECT domain_id, theta, items_completed FROM public.student_abilities WHERE student_id = %s",
                (student_id,),
            ).fetchall()
        return {
            row["domain_id"]: AbilityRow(row["domain_id"], float(row["theta"]), int(row["items_completed"]))
            for row in rows
        }

    def save_ability(self, student_id: UUID, ability: AbilityRow) -> None:
        with self._pool.connection() as conn:
            conn.execute(
                "INSERT INTO public.student_abilities (student_id, domain_id, theta, items_completed) "
                "VALUES (%s, %s, %s, %s) "
                "ON CONFLICT (student_id, domain_id) DO UPDATE SET "
                "theta = EXCLUDED.theta, items_completed = EXCLUDED.items_completed, updated_at = now()",
                (student_id, ability.domain_id, ability.theta, ability.items_completed),
            )

    def get_socio(self, student_id: UUID) -> SocioProfile:
        with self._pool.connection() as conn:
            row = conn.execute(
                "SELECT anxiety_index, self_efficacy_index, perseverance_index, metacognition_index "
                "FROM public.student_socioemotional WHERE student_id = %s",
                (student_id,),
            ).fetchone()
        if row is None:
            return SocioProfile()
        return SocioProfile(
            anxiety=float(row["anxiety_index"]),
            self_efficacy=float(row["self_efficacy_index"]),
            perseverance=float(row["perseverance_index"]),
            metacognition=float(row["metacognition_index"]),
        )

    def save_socio(self, student_id: UUID, profile: SocioProfile) -> None:
        with self._pool.connection() as conn:
            conn.execute(
                "INSERT INTO public.student_socioemotional "
                "(student_id, anxiety_index, self_efficacy_index, perseverance_index, metacognition_index, "
                "hide_timers, auto_enable_scaffolding) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s) "
                "ON CONFLICT (student_id) DO UPDATE SET "
                "anxiety_index = EXCLUDED.anxiety_index, "
                "self_efficacy_index = EXCLUDED.self_efficacy_index, "
                "perseverance_index = EXCLUDED.perseverance_index, "
                "metacognition_index = EXCLUDED.metacognition_index, "
                "hide_timers = EXCLUDED.hide_timers, "
                "auto_enable_scaffolding = EXCLUDED.auto_enable_scaffolding, "
                "updated_at = now()",
                (
                    student_id,
                    profile.anxiety,
                    profile.self_efficacy,
                    profile.perseverance,
                    profile.metacognition,
                    profile.hide_timers,
                    profile.auto_enable_scaffolding,
                ),
            )

    def recent_attempts(self, student_id: UUID, limit: int) -> list[RecentAttempt]:
        with self._pool.connection() as conn:
            rows = conn.execute(
                "SELECT score_ratio, is_rapid_guess FROM public.game_attempts "
                "WHERE student_id = %s ORDER BY created_at DESC LIMIT %s",
                (student_id, limit),
            ).fetchall()
        return [RecentAttempt(float(r["score_ratio"]), bool(r["is_rapid_guess"])) for r in rows]

    def insert_attempt(self, record: AttemptRecord) -> UUID:
        with self._pool.connection() as conn:
            row = conn.execute(
                "INSERT INTO public.game_attempts "
                "(student_id, game_id, domain_id, process_id, level, completed, beta, score_ratio, "
                "is_rapid_guess, theta_before, theta_after, general_metrics, game_metrics, events) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    record.student_id,
                    record.game_id,
                    record.domain_id,
                    record.process_id,
                    record.level,
                    record.completed,
                    record.beta,
                    record.score_ratio,
                    record.is_rapid_guess,
                    record.theta_before,
                    record.theta_after,
                    Jsonb(record.general_metrics),
                    Jsonb(record.game_metrics),
                    Jsonb(record.events),
                ),
            ).fetchone()
        if row is None:
            raise RuntimeError("No se pudo guardar el intento.")
        return UUID(str(row["id"]))