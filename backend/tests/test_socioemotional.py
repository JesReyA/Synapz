from app.services.socioemotional import SocioProfile, update_indices


def _update(profile, ratio, **kw):
    params = dict(is_rapid_guess=False, beta=0.0, theta_before=0.0, prior_consecutive_failures=0)
    params.update(kw)
    return update_indices(profile, score_ratio=ratio, **params)


def test_rapid_guess_only_hurts_perseverance_and_metacognition():
    before = SocioProfile(anxiety=0.3, self_efficacy=0.2)
    after = _update(before, 0.0, is_rapid_guess=True)
    assert after.perseverance < before.perseverance
    assert after.metacognition < before.metacognition
    assert (after.anxiety, after.self_efficacy) == (before.anxiety, before.self_efficacy)


def test_success_raises_self_efficacy_and_lowers_anxiety():
    after = _update(SocioProfile(anxiety=0.5), 1.0)
    assert after.self_efficacy > 0 and after.anxiety < 0.5


def test_anxiety_rises_only_after_repeated_failures():
    assert _update(SocioProfile(), 0.0, prior_consecutive_failures=1).anxiety == 0.0
    assert _update(SocioProfile(), 0.0, prior_consecutive_failures=2).anxiety > 0.0


def test_hide_timers_flag_at_threshold():
    assert SocioProfile(anxiety=0.75).hide_timers
    assert not SocioProfile(anxiety=0.74).hide_timers


def test_scaffolding_follows_self_efficacy_only():
    assert SocioProfile(self_efficacy=-0.60).auto_enable_scaffolding
    assert not SocioProfile(anxiety=2.0, self_efficacy=0.0).auto_enable_scaffolding


def test_failure_on_reachable_item_lowers_self_efficacy():
    after = _update(SocioProfile(), 0.0, beta=-0.5, theta_before=0.0, prior_consecutive_failures=1)
    assert after.self_efficacy < 0
    harder = _update(SocioProfile(), 0.0, beta=1.0, theta_before=0.0, prior_consecutive_failures=1)
    assert harder.self_efficacy == 0.0


def test_indices_are_clipped():
    after = _update(SocioProfile(anxiety=2.99, self_efficacy=2.99), 1.0)
    assert after.self_efficacy <= 3.0
