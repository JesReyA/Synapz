"""Verificación del JWT de Supabase y rol del usuario autenticado."""
from dataclasses import dataclass
from typing import Annotated, Any
from uuid import UUID

import jwt
from fastapi import Depends, Header, HTTPException

from app.core.config import settings


@dataclass(frozen=True)
class CurrentUser:
    id: UUID
    role: str


def _error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status_code, detail={"code": code, "message": message})


def _decode(token: str) -> dict[str, Any]:
    if not settings.SUPABASE_JWT_SECRET:
        raise _error(500, "INTERNAL", "El servidor no tiene configurado SUPABASE_JWT_SECRET.")
    try:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError as exc:
        raise _error(401, "UNAUTHORIZED", "Sesión inválida o expirada.") from exc


def get_current_user(authorization: Annotated[str | None, Header()] = None) -> CurrentUser:
    """Lee `Authorization: Bearer <JWT>`. El rol sale de `app_metadata.role`."""
    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise _error(401, "UNAUTHORIZED", "Falta el encabezado Authorization.")
    claims = _decode(token)
    try:
        user_id = UUID(str(claims.get("sub")))
    except ValueError as exc:
        raise _error(401, "UNAUTHORIZED", "El token no identifica a un usuario.") from exc
    role = (claims.get("app_metadata") or {}).get("role", "")
    return CurrentUser(id=user_id, role=str(role))


def get_current_student(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
    if user.role != "student":
        raise _error(403, "FORBIDDEN", "Este recurso es solo para alumnos.")
    return user
