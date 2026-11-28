"""Orquesta el motor adaptativo: puntaje, TRI, índices socioemocionales y persistencia."""
from typing import get_args
from uuid import UUID

from app.schemas.adaptive import (
    AdaptiveProfileResponse,
    DifficultyRecommendation,
    DomainAbility,
    DomainId,
    GameAttemptRequest,
    GameAttemptResponse,
    GameId,
    SocioemotionalIndices,
    UxAdaptationFlags,
)
from app.services import difficulty_planner, irt, pisa_scale, scoring, telemetry_validator
from app.services.adaptive_repository import AbilityRow, AdaptiveRepository, AttemptRecord
from app.services.pisa_catalog import get_spec
from app.services.socioemotional import SocioProfile, is_failure, update_indices

DOMAINS: tuple[DomainId, ...] = get_args(DomainId)
RECENT_WINDOW = 10


class AdaptiveError(Exception):
    """Error de negocio con el código del contrato (`ApiError.code`)."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def _flags(profile: SocioProfile) -> UxAdaptationFlags:
    return UxAdaptationFlags(
        hide_timers=profile.hide_timers,
        auto_enable_scaffolding=profile.auto_enable_scaffolding,
    )


def _ability_out(row: AbilityRow) -> DomainAbility:
    score, level = pisa_scale.theta_to_placement(row.theta)
    return DomainAbility(
        domain_id=row.domain_id,  # type: ignore[arg-type]
        theta=row.theta,
        pisa_scaled_score=score,
        pisa_level=level.level,
        pisa_label=level.label,
        items_completed=row.items_completed,
    )


def _consecutive_failures(repo: AdaptiveRepository, student_id: UUID) -> int:
    count = 0
    for attempt in repo.recent_attempts(student_id, RECENT_WINDOW):
        if attempt.is_rapid_guess:
            continue
        if not is_failure(attempt.score_ratio, False):
            break
        count += 1
    return count


def submit_attempt(repo: AdaptiveRepository, student_id: UUID, request: GameAttemptRequest) -> GameAttemptResponse:
    spec = get_spec(request.game_id)
    if not spec.scored:
        raise AdaptiveError(422, "VALIDATION_ERROR", "Este juego no genera mediciones.")
    try:
        scoring.validate_metrics(spec, request.metrics)
    except scoring.InvalidMetrics as exc:
        raise AdaptiveError(422, "VALIDATION_ERROR", str(exc)) from exc

    ratio = scoring.score_ratio(spec, request.completed, request.metrics)
    beta = scoring.resolve_beta(spec, request.level, request.metrics)
    rapid = telemetry_validator.is_rapid_guess(spec, request.metrics, request.general.total_duration_ms)

    abilities = repo.get_abilities(student_id)
    current = abilities.get(spec.domain, AbilityRow(spec.domain))
    socio = repo.get_socio(student_id)
    prior_failures = _consecutive_failures(repo, student_id)

    if rapid:
        updated = current
    else:
        theta_after = irt.update_theta(
            current.theta,
            beta,
            ratio,
            current.items_completed,
            hints_used=request.general.hints_requested_count,
        )
        updated = AbilityRow(spec.domain, theta_after, current.items_completed + 1)

    new_socio = update_indices(
        socio,
        score_ratio=ratio,
        is_rapid_guess=rapid,
        beta=beta,
        theta_before=current.theta,
        prior_consecutive_failures=prior_failures,
    )

    attempt_id = repo.insert_attempt(
        AttemptRecord(
            student_id=student_id,
            game_id=spec.game_id,
            domain_id=spec.domain,
            process_id=spec.process,
            level=request.level,
            completed=request.completed,
            beta=beta,
            score_ratio=ratio,
            is_rapid_guess=rapid,
            theta_before=current.theta,
            theta_after=updated.theta,
            general_metrics=request.general.model_dump(),
            game_metrics=dict(request.metrics),
            events=[event.model_dump() for event in request.events],
        )
    )
    if not rapid:
        repo.save_ability(student_id, updated)
    repo.save_socio(student_id, new_socio)

    return GameAttemptResponse(
        attempt_id=attempt_id,
        is_rapid_guess=rapid,
        score_ratio=ratio,
        beta=beta,
        theta_before=current.theta,
        ability=_ability_out(updated),
        ux_adaptation=_flags(new_socio),
    )


def get_difficulty(repo: AdaptiveRepository, student_id: UUID, game_id: GameId) -> DifficultyRecommendation:
    spec = get_spec(game_id)
    theta = repo.get_abilities(student_id).get(spec.domain, AbilityRow(spec.domain)).theta
    level = difficulty_planner.recommend_level(spec, theta)
    return DifficultyRecommendation(
        game_id=game_id,
        domain_id=spec.domain,
        theta=theta,
        target_beta=difficulty_planner.target_beta(theta),
        recommended_level=level,  # type: ignore[arg-type]
        ux_adaptation=_flags(repo.get_socio(student_id)),
    )


def get_profile(repo: AdaptiveRepository, student_id: UUID) -> AdaptiveProfileResponse:
    stored = repo.get_abilities(student_id)
    rows = [stored.get(domain, AbilityRow(domain)) for domain in DOMAINS]
    socio = repo.get_socio(student_id)
    measured = [row.theta for row in rows if row.items_completed > 0]
    reference = pisa_scale.reference_level_for(sum(measured) / len(measured)) if measured else None
    return AdaptiveProfileResponse(
        student_id=student_id,
        abilities=[_ability_out(row) for row in rows],
        indices=SocioemotionalIndices(
            anxiety=socio.anxiety,
            self_efficacy=socio.self_efficacy,
            perseverance=socio.perseverance,
            metacognition=socio.metacognition,
        ),
        ux_adaptation=_flags(socio),
        reference_level=reference,
    )
