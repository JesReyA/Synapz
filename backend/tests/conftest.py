import os
from uuid import UUID, uuid4

import pytest

# `app.core.config` exige esta variable al importarse.
os.environ.setdefault("GEMINI_API_KEY", "test")
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-secret-test-secret-test-secret")

from app.services.adaptive_repository import AbilityRow, AttemptRecord, RecentAttempt  # noqa: E402
from app.services.socioemotional import SocioProfile  # noqa: E402


class InMemoryRepository:
    """Repositorio en memoria con la misma interfaz que `SupabaseAdaptiveRepository`."""

    def __init__(self) -> None:
        self.abilities: dict[tuple[UUID, str], AbilityRow] = {}
        self.socio: dict[UUID, SocioProfile] = {}
        self.attempts: list[AttemptRecord] = []

    def get_abilities(self, student_id):
        return {d: a for (s, d), a in self.abilities.items() if s == student_id}

    def save_ability(self, student_id, ability):
        self.abilities[(student_id, ability.domain_id)] = ability

    def get_socio(self, student_id):
        return self.socio.get(student_id, SocioProfile())

    def save_socio(self, student_id, profile):
        self.socio[student_id] = profile

    def recent_attempts(self, student_id, limit):
        mine = [a for a in self.attempts if a.student_id == student_id]
        return [RecentAttempt(a.score_ratio, a.is_rapid_guess) for a in reversed(mine)][:limit]

    def insert_attempt(self, record):
        self.attempts.append(record)
        return uuid4()


@pytest.fixture
def repo() -> InMemoryRepository:
    return InMemoryRepository()


@pytest.fixture
def student_id() -> UUID:
    return uuid4()
