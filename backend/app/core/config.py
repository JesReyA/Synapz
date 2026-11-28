import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Settings (BaseModel):
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-3.6-flash"
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""


settings = Settings(
    GEMINI_API_KEY=os.getenv("GEMINI_API_KEY"),
    GEMINI_MODEL=os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
    SUPABASE_URL=os.getenv("SUPABASE_URL", ""),
    SUPABASE_KEY=os.getenv("SUPABASE_KEY", ""),
    SUPABASE_JWT_SECRET=os.getenv("SUPABASE_JWT_SECRET", ""),
)