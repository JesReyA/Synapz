import time
from uuid import uuid4

import jwt
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core import security
from app.core.config import settings
from app.routers import adaptive

BODY = {
    "game_id": "sudoku",
    "level": "facil",
    "completed": True,
    "general": {"total_duration_ms": 90_000},
    "metrics": {"error_count": 1},
}


@pytest.fixture
def client(repo, profiles):
    app = FastAPI()
    app.include_router(adaptive.router)
    app.dependency_overrides[adaptive.get_adaptive_repository] = lambda: repo
    app.dependency_overrides[security.get_profile_store] = lambda: profiles
    return TestClient(app)


@pytest.fixture
def auth(profiles):
    """Crea un token de Foundathyon. El rol sale del perfil en la base, no del token."""

    def make(role="student", secret=None, **extra_claims):
        user_id = uuid4()
        if role != "student":
            profiles.roles[user_id] = role
        claims = {"sub": str(user_id), "exp": int(time.time()) + 600, **extra_claims}
        token = jwt.encode(claims, secret or settings.FOUNDATHYON_JWT_SECRET, algorithm="HS256")
        return {"Authorization": f"Bearer {token}"}

    return make


def test_requires_token(client, auth):
    assert client.post("/api/adaptive/game-attempts", json=BODY).status_code == 401
    bad = auth(secret="x" * 40)
    assert client.get("/api/adaptive/profile", headers=bad).status_code == 401


def test_teacher_is_forbidden(client, auth):
    res = client.get("/api/adaptive/profile", headers=auth(role="teacher"))
    assert res.status_code == 403 and res.json()["detail"]["code"] == "FORBIDDEN"


def test_first_access_creates_student_profile(client, auth, profiles):
    assert client.get("/api/adaptive/profile", headers=auth()).status_code == 200
    assert len(profiles.created) == 1


def test_role_claim_in_token_is_ignored(client, auth):
    headers = auth(role="student", app_metadata={"role": "teacher"}, role_claim="teacher")
    assert client.get("/api/adaptive/profile", headers=headers).status_code == 200


def test_submit_and_read_back(client, auth):
    headers = auth()
    res = client.post("/api/adaptive/game-attempts", json=BODY, headers=headers)
    assert res.status_code == 200
    assert res.json()["ability"]["domain_id"] == "MATH"
    profile = client.get("/api/adaptive/profile", headers=headers).json()
    assert profile["reference_level"]["framework"] == "PISA"


def test_unscored_game_returns_contract_error(client, auth):
    body = {**BODY, "game_id": "ajedrez", "metrics": {}}
    res = client.post("/api/adaptive/game-attempts", json=body, headers=auth())
    assert res.status_code == 422 and res.json()["detail"]["code"] == "VALIDATION_ERROR"


def test_unknown_game_is_rejected(client, auth):
    assert client.get("/api/adaptive/difficulty/otro", headers=auth()).status_code == 422


def test_difficulty_endpoint(client, auth):
    res = client.get("/api/adaptive/difficulty/memorama", headers=auth())
    assert res.status_code == 200 and res.json()["recommended_level"] == "medio"
