"""Reporte del aula, resumen docente y puntos extra. Espejo de API_CONTRACT.md §2.8, §2.15 y §2.16."""

import datetime as dt
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.progress import ReferenceLevel, SubjectArea, TopicRecommendation
from app.schemas.reports import InflectionPoint


class ClassTrendPoint(BaseModel):
    date: dt.date
    avg_score: float = Field(ge=0, le=100)


class TopicPerformance(BaseModel):
    topic_id: UUID
    title: str
    avg_score: float = Field(ge=0, le=100)
    students_below_threshold: int = Field(ge=0)
    trend: list[ClassTrendPoint]


class AtRiskStudent(BaseModel):
    student_id: UUID
    full_name: str
    reasons: list[str]


class GroupReference(BaseModel):
    framework: Literal["PISA"]
    group_level: ReferenceLevel
    target_level: int = 4
    target_min_score: float = 60


class ClassroomReport(BaseModel):
    classroom_id: UUID
    generated_at: dt.datetime
    student_count: int = Field(ge=0)
    overall_avg: float = Field(ge=0, le=100)
    topics: list[TopicPerformance]
    hardest_topics: list[TopicPerformance]
    easiest_topics: list[TopicPerformance]
    at_risk_students: list[AtRiskStudent]
    recommendations: list[TopicRecommendation]
    inflection_points: list[InflectionPoint]
    integrity_flags: int = Field(ge=0)
    reference: GroupReference


class TeacherClassroomSummary(BaseModel):
    id: UUID
    name: str
    subject: str
    subject_area: SubjectArea
    grade_group: str
    invite_code: str = Field(min_length=6, max_length=6)
    student_count: int = Field(ge=0)
    overall_avg: float | None = Field(default=None, ge=0, le=100)
    at_risk_count: int = Field(ge=0)
    topics_pending_review: int = Field(ge=0)


class TeacherOverviewResponse(BaseModel):
    teacher_id: UUID
    generated_at: dt.datetime
    classrooms: list[TeacherClassroomSummary]


class GrantBonusPointsRequest(BaseModel):
    student_id: UUID
    points: int = Field(ge=1, le=50)
    reason: str = Field(min_length=1, max_length=140)


class GrantBonusPointsResponse(BaseModel):
    student_id: UUID
    bonus_points: int
    total_points: int
