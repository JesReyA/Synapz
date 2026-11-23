"""Ranking grupal, rachas y compañeros. Espejo de API_CONTRACT.md §2.11 y §2.12."""

import datetime as dt
from uuid import UUID

from pydantic import BaseModel, Field


class LeaderboardEntry(BaseModel):
    student_id: UUID
    name: str  # abreviado, por ejemplo "Valeria M."
    points: int
    is_me: bool


class LeaderboardResponse(BaseModel):
    classroom_id: UUID
    generated_at: dt.datetime
    entries: list[LeaderboardEntry]


class StreakWeekDay(BaseModel):
    date: dt.date
    active: bool


class StreakInfo(BaseModel):
    current_days: int = Field(ge=0)
    best_days: int = Field(ge=0)
    week: list[StreakWeekDay] = Field(min_length=7, max_length=7)


class FriendWeekly(BaseModel):
    student_id: UUID
    name: str
    weekly_points: int = Field(ge=0)
    is_me: bool


class StreakFriendsResponse(BaseModel):
    classroom_id: UUID
    generated_at: dt.datetime
    streak: StreakInfo
    invite_code: str
    friends: list[FriendWeekly]
