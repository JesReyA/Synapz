import pytest

from app.schemas.adaptive import GameAttemptRequest, GeneralMetrics
from app.services import adaptive_service


def _request(game_id="sudoku", completed=True, duration=120_000, level="medio", **metrics):
    return GameAttemptRequest(
        game_id=game_id,
        level=level,
        completed=completed,
        general=GeneralMetrics(total_duration_ms=duration),
        metrics=metrics or {"error_count": 0},
    )


def test_valid_attempt_updates_theta_and_persists(repo, student_id):
    out = adaptive_service.submit_attempt(repo, student_id, _request())
    assert not out.is_rapid_guess
    assert out.ability.domain_id == "MATH" and out.ability.items_completed == 1
    assert out.ability.theta > 0
    assert repo.get_abilities(student_id)["MATH"].theta == out.ability.theta
    assert len(repo.attempts) == 1


def test_rapid_guess_freezes_theta_but_is_recorded(repo, student_id):
    out = adaptive_service.submit_attempt(repo, student_id, _request(duration=2_000))
    assert out.is_rapid_guess and out.ability.theta == 0.0 and out.ability.items_completed == 0
    assert repo.get_abilities(student_id) == {}
    assert repo.attempts[0].is_rapid_guess
    assert repo.get_socio(student_id).perseverance < 0


def test_unscored_game_rejected(repo, student_id):
    with pytest.raises(adaptive_service.AdaptiveError) as err:
        adaptive_service.submit_attempt(repo, student_id, _request("ajedrez"))
    assert err.value.status_code == 422


def test_missing_metrics_rejected(repo, student_id):
    with pytest.raises(adaptive_service.AdaptiveError):
        adaptive_service.submit_attempt(repo, student_id, _request("calculo", correct=3))


def test_repeated_failures_raise_anxiety_and_hide_timers(repo, student_id):
    for _ in range(12):
        adaptive_service.submit_attempt(repo, student_id, _request(completed=False))
    out = adaptive_service.submit_attempt(repo, student_id, _request(completed=False))
    assert out.ux_adaptation.hide_timers
    assert out.ability.theta < 0


def test_difficulty_recommendation_tracks_ability(repo, student_id):
    assert adaptive_service.get_difficulty(repo, student_id, "sudoku").recommended_level == "medio"
    for _ in range(8):
        adaptive_service.submit_attempt(repo, student_id, _request(completed=False))
    assert adaptive_service.get_difficulty(repo, student_id, "sudoku").recommended_level == "facil"


def test_profile_without_data_has_no_reference_level(repo, student_id):
    profile = adaptive_service.get_profile(repo, student_id)
    assert [a.domain_id for a in profile.abilities] == ["MATH", "READ", "SCIE", "COMP"]
    assert profile.reference_level is None


def test_profile_with_data_has_reference_level(repo, student_id):
    adaptive_service.submit_attempt(repo, student_id, _request())
    assert adaptive_service.get_profile(repo, student_id).reference_level is not None
