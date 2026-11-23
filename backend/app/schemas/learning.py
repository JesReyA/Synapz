"""Vista Aprender y nivelación. Espejo de API_CONTRACT.md §2.13 y §2.14."""

import datetime as dt
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.progress import SubjectArea

StudyCategory = Literal["lessons", "reading", "remedial"]
StudyBadge = Literal["visual", "text", "audio", "live_voice", "practice"]
RemedialSkill = Literal["addition", "fractions"]


class StudyCard(BaseModel):
    id: str
    category: StudyCategory
    classroom_id: UUID
    topic_id: UUID
    topic_title: str
    subject: str
    subject_area: SubjectArea
    title: str
    description: str
    badge: StudyBadge
    progress: float = Field(ge=0, le=100)
    minutes: int = Field(ge=1)
    remedial_set_id: UUID | None = None


class DailyFocus(BaseModel):
    card_id: str
    headline: str
    reason: str
    based_on: list[str]


class LearningHomeResponse(BaseModel):
    generated_at: dt.datetime
    daily_focus: DailyFocus | None = None
    cards: list[StudyCard]


class RemedialExercise(BaseModel):
    id: str
    skill: RemedialSkill
    prompt: str
    accepted_answers: list[str] = Field(min_length=1)
    display_answer: str
    hint_title: str
    everyday_hint: str
    worked_example: str


class RemedialPrerequisite(BaseModel):
    classroom_id: UUID
    topic_id: UUID
    title: str


class RemedialSet(BaseModel):
    id: UUID
    title: str
    prerequisite: RemedialPrerequisite
    exercises: list[RemedialExercise] = Field(min_length=1)


class SubmitRemedialResultRequest(BaseModel):
    first_try_correct: int = Field(ge=0)
    total: int = Field(ge=1)


class SubmitRemedialResultResponse(BaseModel):
    set_id: UUID
    progress: float = Field(ge=0, le=100)
    best_first_try_pct: float = Field(ge=0, le=100)
