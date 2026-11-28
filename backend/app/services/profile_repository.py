"""Perfiles de usuario en `public.profiles`. Único módulo que crea y lee perfiles."""
from typing import Protocol
from uuid import UUID

from psycopg_pool import ConnectionPool


class ProfileStore(Protocol):
    def ensure_profile(self, user_id: UUID, full_name: str) -> str:
        """Devuelve el rol del usuario y crea su perfil si es el primer acceso."""
        ...


class PostgresProfileStore:
    def __init__(self, pool: ConnectionPool) -> None:
        self._pool = pool

    def ensure_profile(self, user_id: UUID, full_name: str) -> str:
        with self._pool.connection() as conn:
            row = conn.execute("SELECT role FROM public.profiles WHERE id = %s", (user_id,)).fetchone()
            if row is None:
                # Primer acceso: todo usuario nuevo nace `student`. El rol nunca viene del token ni del cliente.
                conn.execute(
                    "INSERT INTO public.profiles (id, role, full_name) VALUES (%s, 'student', %s) "
                    "ON CONFLICT (id) DO NOTHING",
                    (user_id, full_name),
                )
                row = conn.execute("SELECT role FROM public.profiles WHERE id = %s", (user_id,)).fetchone()
        if row is None:
            raise RuntimeError("No se pudo crear el perfil del usuario.")
        return str(row["role"])
