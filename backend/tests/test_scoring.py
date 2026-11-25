import pytest

from app.services.difficulty_planner import recommend_level, target_beta
from app.services.pisa_catalog import get_spec
from app.services.scoring import InvalidMetrics, resolve_beta, score_ratio, validate_metrics
from app.services.telemetry_validator import is_rapid_guess


def test_sudoku_errors_penalize_up_to_half():
    spec = get_spec("sudoku")
    assert score_ratio(spec, True, {"error_count": 0}) == 1.0
    assert score_ratio(spec, True, {"error_count": 2}) == 0.8
    assert score_ratio(spec, True, {"error_count": 99}) == 0.5
    assert score_ratio(spec, False, {"error_count": 0}) == 0.0


def test_memory_ratio_is_pairs_over_attempts():
    spec = get_spec("memorama")
    assert score_ratio(spec, True, {"pairs": 6, "attempts": 12}) == 0.5
    assert score_ratio(spec, True, {"pairs": 6, "attempts": 6}) == 1.0


def test_tetris_ratio_caps_at_one():
    assert score_ratio(get_spec("tetris"), True, {"lines": 50}) == 1.0


def test_missing_metrics_rejected():
    with pytest.raises(InvalidMetrics):
        validate_metrics(get_spec("calculo"), {"correct": 1})
    with pytest.raises(InvalidMetrics):
        validate_metrics(get_spec("quince"), {"moves": -1})


def test_beta_from_level_and_from_calculo_max_level():
    assert resolve_beta(get_spec("sudoku"), "dificil", {}) == 1.8
    assert resolve_beta(get_spec("sudoku"), None, {}) == 0.2
    assert resolve_beta(get_spec("calculo"), None, {"max_level": 5}) == 1.8
    assert resolve_beta(get_spec("calculo"), None, {"max_level": 99}) == 1.8


def test_rapid_guess_rules():
    burst = get_spec("calculo")
    assert is_rapid_guess(burst, {"correct": 1, "total": 10, "avg_response_ms": 500}, 60_000)
    assert not is_rapid_guess(burst, {"correct": 9, "total": 10, "avg_response_ms": 500}, 60_000)
    assert not is_rapid_guess(burst, {"correct": 1, "total": 10, "avg_response_ms": 2_000}, 60_000)
    puzzle = get_spec("sudoku")
    assert is_rapid_guess(puzzle, {}, 5_000)
    assert not is_rapid_guess(puzzle, {}, 120_000)


def test_recommended_level_follows_zpd():
    spec = get_spec("sudoku")
    assert target_beta(0.0) == 0.25
    assert recommend_level(spec, 0.0) == "medio"
    assert recommend_level(spec, -2.0) == "facil"
    assert recommend_level(spec, 3.0) == "dificil"
    assert recommend_level(get_spec("quince"), 0.0) is None
