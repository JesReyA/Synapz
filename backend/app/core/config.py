import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Settings (BaseModel):
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-3.6-flash"
    # PostgreSQL de Foundathyon.
    DATABASE_URL: str = ""
    # Token de sesión de Foundathyon.
    FOUNDATHYON_JWT_SECRET: str = ""
    FOUNDATHYON_JWT_ALGORITHM: str = "HS256"
    # Supabase se usa únicamente para Storage.
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""


settings = Settings(
    GEMINI_API_KEY=os.getenv("GEMINI_API_KEY"),
    GEMINI_MODEL=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
    DATABASE_URL=os.getenv("DATABASE_URL", ""),
    FOUNDATHYON_JWT_SECRET=os.getenv("FOUNDATHYON_JWT_SECRET", ""),
    FOUNDATHYON_JWT_ALGORITHM=os.getenv("FOUNDATHYON_JWT_ALGORITHM", "HS256"),
    SUPABASE_URL=os.getenv("SUPABASE_URL", ""),
    SUPABASE_SERVICE_ROLE_KEY=os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
)