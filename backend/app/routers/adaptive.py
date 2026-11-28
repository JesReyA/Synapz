from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.core.db import get_pool
from app.core.security import CurrentUser, get_current_student
from app.schemas.adaptive import (
    AdaptiveProfileResponse,
    DifficultyRecommendation,
    GameAttemptRequest,
    GameAttemptResponse,
    GameId,
)
from app.services import adaptive_service
from app.services.adaptive_repository import AdaptiveRepository, PostgresAdaptiveRepository

router = APIRouter(prefix="/api/adaptive", tags=["Adaptive Engine"])


def get_adaptive_repository() -> AdaptiveRepository:
    return PostgresAdaptiveRepository(get_pool())


Student = Annotated[CurrentUser, Depends(get_current_student)]
Repo = Annotated[AdaptiveRepository, Depends(get_adaptive_repository)]


def _http_error(exc: adaptive_service.AdaptiveError) -> HTTPException:
    return HTTPException(status_code=exc.status_code, detail={"code": exc.code, "message": exc.message})


@router.post("/game-attempts", response_model=GameAttemptResponse)
def submit_game_attempt(payload: GameAttemptRequest, student: Student, repo: Repo) -> GameAttemptResponse:
    try:
        return adaptive_service.submit_attempt(repo, student.id, payload)
    except adaptive_service.AdaptiveError as exc:
        raise _http_error(exc) from exc


@router.get("/difficulty/{game_id}", response_model=DifficultyRecommendation)
def get_game_difficulty(game_id: GameId, student: Student, repo: Repo) -> DifficultyRecommendation:
    return adaptive_service.get_difficulty(repo, student.id, game_id)


@router.get("/profile", response_model=AdaptiveProfileResponse)
def get_adaptive_profile(student: Student, repo: Repo) -> AdaptiveProfileResponse:
    return adaptive_service.get_profile(repo, student.id)
