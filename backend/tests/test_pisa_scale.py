import pytest

from app.services.pisa_scale import reference_level_for, theta_to_placement, theta_to_score


def test_score_formula():
    assert theta_to_score(0.0) == 500
    assert theta_to_score(-1.13) == 387


@pytest.mark.parametrize(
    ("score", "level", "label"),
    [
        (669, 6, "Nivel 6"),
        (668, 5, "Nivel 5"),
        (571, 5, "Nivel 5"),
        (570, 4, "Nivel 4"),
        (510, 4, "Nivel 4"),
        (509, 3, "Nivel 3"),
        (448, 3, "Nivel 3"),
        (447, 2, "Nivel 2 (competencia básica)"),
        (387, 2, "Nivel 2 (competencia básica)"),
        (386, 1, "Nivel 1a"),
        (326, 1, "Nivel 1a"),
        (325, 1, "Nivel 1b/1c"),
    ],
)
def test_level_boundaries(score, level, label):
    _, placement = theta_to_placement((score - 500) / 100)
    assert (placement.level, placement.label) == (level, label)


def test_reference_level_matches_progress_schema():
    ref = reference_level_for(0.0)
    assert ref.framework == "PISA" and ref.max_level == 6 and ref.level == 3
