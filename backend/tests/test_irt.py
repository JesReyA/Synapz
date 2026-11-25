from app.services.irt import expected_probability, update_theta


def test_probability_is_half_when_theta_equals_beta():
    assert expected_probability(0.5, 0.5) == 0.5


def test_probability_grows_with_theta():
    assert expected_probability(1.0, 0.0) > expected_probability(0.0, 0.0) > expected_probability(-1.0, 0.0)


def test_success_on_hard_item_raises_theta_more_than_on_easy_item():
    hard = update_theta(0.0, beta=1.5, score_ratio=1.0, items_completed=0)
    easy = update_theta(0.0, beta=-1.5, score_ratio=1.0, items_completed=0)
    assert hard > easy > 0.0


def test_failure_lowers_theta():
    assert update_theta(0.0, beta=0.0, score_ratio=0.0, items_completed=0) < 0.0


def test_step_shrinks_with_experience_but_keeps_floor():
    novice = update_theta(0.0, 0.0, 1.0, items_completed=0) - 0.0
    veteran = update_theta(0.0, 0.0, 1.0, items_completed=10_000) - 0.0
    assert 0 < veteran < novice
    # Con θ=β, P=0.5 y α=1: el avance es MIN_STEP · 0.5.
    assert veteran == round(0.15 * 0.5, 4)


def test_hints_reduce_gain():
    clean = update_theta(0.0, 0.0, 1.0, 0, hints_used=0)
    hinted = update_theta(0.0, 0.0, 1.0, 0, hints_used=2)
    assert hinted < clean


def test_theta_stays_in_range():
    assert update_theta(3.5, -3.0, 1.0, 0) <= 3.5
    assert update_theta(-3.5, 3.0, 0.0, 0) >= -3.5
