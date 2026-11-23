"""Respuesta de GET /api/progress/me. Espejo de API_CONTRACT.md §2.10."""

import datetime as dt
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.reports import InflectionPoint, TrendPoint

SubjectArea = Literal["math", "reading", "science"]


class Streak(BaseModel):
    current_days: int = Field(ge=0)
    best_days: int = Field(ge=0)


class ProgressTopic(BaseModel):
    topic_id: UUID
    classroom_id: UUID
    title: str
    subject_area: SubjectArea
    score: float = Field(ge=0, le=100)
    trend: list[TrendPoint]
    feyn_mastered: bool


class MentalMathSession(BaseModel):
    id: UUID
    date: dt.date
    correct: int = Field(ge=0)
    total: int = Field(ge=0)
    avg_response_ms: int = Field(ge=0)
    max_level: int = Field(ge=1)


class ReadingScoreSession(BaseModel):
    id: UUID
    date: dt.date
    comprehension_score: float = Field(ge=0, le=100)
    audio_score: float | None = Field(default=None, ge=0, le=100)


class ReferenceLevel(BaseModel):
    framework: Literal["PISA"]
    level: int = Field(ge=1)
    max_level: int
    label: str
    description: str


class TopicRecommendation(BaseModel):
    topic_id: UUID
    text: str


class StudentProgressResponse(BaseModel):
    student_id: UUID
    generated_at: dt.datetime
    cycle_start: dt.date
    topics: list[ProgressTopic]
    inflection_points: list[InflectionPoint]
    mental_math_sessions: list[MentalMathSession]
    reading_sessions: list[ReadingScoreSession]
    streak: Streak
    reference_level: ReferenceLevel
    recommendations: list[TopicRecommendation]
