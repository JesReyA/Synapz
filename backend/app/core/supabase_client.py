"""Cliente de Supabase con la clave de servicio. Solo se usa en el servidor."""
from functools import lru_cache
from typing import TYPE_CHECKING

from app.core.config import settings

if TYPE_CHECKING:
    from supabase import Client


@lru_cache(maxsize=1)
def get_supabase_client() -> "Client":
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError("Faltan SUPABASE_URL o SUPABASE_KEY en el entorno.")
    from supabase import create_client

    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
