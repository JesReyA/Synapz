"""Validación del token de sesión de Foundathyon y rol del usuario autenticado.

El token se verifica con `FOUNDATHYON_JWT_SECRET` (algoritmo `FOUNDATHYON_JWT_ALGORITHM`, HS256 por defecto) y
su `sub` es el UUID del usuario. El rol NO sale del token: se lee de `public.profiles.role`. La primera vez que
se valida la sesión de un usuario se crea su perfil (`INSERT ... ON CONFLICT (id) DO NOTHING`).
"""
from dataclasses import dataclass
from typing import Annotated, Any
from uuid import UUID

import jwt
from fastapi import Depends, Header, HTTPException

from app.core.config import settings
from app.core.db import get_pool
from app.services.profile_repository import PostgresProfileStore, ProfileStore


@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    role: str


def _error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


def _decode(token: str) -> dict[str, Any]:
    if not settings.FOUNDATHYON_JWT_SECRET:
        raise _error(500, "INTERNAL", "El servidor no tiene configurado FOUNDATHYON_JWT_SECRET.")
    try:
        return jwt.decode(
            token,
            settings.FOUNDATHYON_JWT_SECRET,
            algorithms=[settings.FOUNDATHYON_JWT_ALGORITHM],
            options={"require": ["sub", "exp"], "verify_aud": False},
        )
    except jwt.PyJWTError as exc:
        raise _error(401, "UNAUTHORIZED", "Sesión inválida o expirada.") from exc


def get_profile_store() -> ProfileStore:
    return PostgresProfileStore(get_pool())


def get_current_user(
    store: Annotated[ProfileStore, Depends(get_profile_store)],
    authorization: Annotated[str | None, Header()] = None,
) -> CurrentUser:
    """Lee `Authorization: Bearer <token>`, crea el perfil si es el primer acceso y devuelve el rol de la base."""
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise _error(401, "UNAUTHORIZED", "Falta el encabezado Authorization.")
    claims = _decode(token)
    try:
        user_id = UUID(str(claims.get("sub")))
    except ValueError as exc:
        raise _error(401, "UNAUTHORIZED", "El token no identifica a un usuario.") from exc
    full_name = str(claims.get("name") or claims.get("full_name") or "")
    return CurrentUser(id=user_id, role=store.ensure_profile(user_id, full_name))


def get_current_student(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    if user.role != "student":
        raise _error(403, "FORBIDDEN", "Este recurso es solo para alumnos.")
    return user
