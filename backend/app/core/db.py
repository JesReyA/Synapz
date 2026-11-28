"""Conexión a PostgreSQL de Foundathyon (`DATABASE_URL`). Solo se usa en el servidor."""
from functools import lru_cache

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.core.config import settings


@lru_cache(maxsize=1)
def get_pool() -> ConnectionPool:
    """Pool de conexiones. Las filas se devuelven como diccionarios."""
    if not settings.DATABASE_URL:
        raise RuntimeError("Falta DATABASE_URL en el entorno.")
    pool = ConnectionPool(
        conninfo=settings.DATABASE_URL,
        min_size=1,
        max_size=5,
        kwargs={"row_factory": dict_row},
        open=False,
    )
    pool.open()
    return pool


def close_pool() -> None:
    """Cierra el pool al apagar la aplicación (si llegó a crearse)."""
    if get_pool.cache_info().currsize:
        get_pool().close()
        get_pool.cache_clear()
