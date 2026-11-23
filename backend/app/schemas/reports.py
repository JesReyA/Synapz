"""Modelos compartidos de reportes. Espejo de API_CONTRACT.md §2.8."""

import datetime as dt
from uuid import UUID

from pydantic import BaseModel, Field


class TrendPoint(BaseModel):
    date: dt.date
    score: float = Field(ge=0, le=100)


class InflectionPoint(BaseModel):
    strategy_id: UUID
    applied_at: dt.datetime
    description: str
    avg_before: float
    avg_after: float
    delta: float  # avg_after - avg_before, en puntos porcentuales
    topic_id: UUID | None = None
