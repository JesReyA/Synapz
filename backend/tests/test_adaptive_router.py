import time
from uuid import uuid4

import jwt
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

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
def client(repo):
    app = FastAPI()
    app.include_router(adaptive.router)
    app.dependency_overrides[adaptive.get_adaptive_repository] = lambda: repo
    return TestClient(app)


def _token(role="student", secret=None):
    claims = {
        "sub": str(uuid4()),
        "aud": "authenticated",
        "exp": int(time.time()) + 600,
        "app_metadata": {"role": role},
    }
    return jwt.encode(claims, secret or settings.SUPABASE_JWT_SECRET, algorithm="HS256")


def _auth(**kw):
    return {"Authorization": f"Bearer {_token(**kw)}"}


def test_requires_token(client):
    assert client.post("/api/adaptive/game-attempts", json=BODY).status_code == 401
    bad = {"Authorization": f"Bearer {_token(secret='x' * 40)}"}
    assert client.get("/api/adaptive/profile", headers=bad).status_code == 401


def test_teacher_is_forbidden(client):
    res = client.get("/api/adaptive/profile", headers=_auth(role="teacher"))
    assert res.status_code == 403 and res.json()["detail"]["code"] == "FORBIDDEN"


def test_submit_and_read_back(client):
    headers = _auth()
    res = client.post("/api/adaptive/game-attempts", json=BODY, headers=headers)
    assert res.status_code == 200
    assert res.json()["ability"]["domain_id"] == "MATH"
    profile = client.get("/api/adaptive/profile", headers=headers).json()
    assert profile["reference_level"]["framework"] == "PISA"


def test_unscored_game_returns_contract_error(client):
    body = {**BODY, "game_id": "ajedrez", "metrics": {}}
    res = client.post("/api/adaptive/game-attempts", json=body, headers=_auth())
    assert res.status_code == 422 and res.json()["detail"]["code"] == "VALIDATION_ERROR"


def test_unknown_game_is_rejected(client):
    assert client.get("/api/adaptive/difficulty/otro", headers=_auth()).status_code == 422


def test_difficulty_endpoint(client):
    res = client.get("/api/adaptive/difficulty/memorama", headers=_auth())
    assert res.status_code == 200 and res.json()["recommended_level"] == "medio"
