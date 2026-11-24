import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

class Settings (BaseModel):
    GEMINI_API_KEY: str
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    

settings = Settings(
    GEMINI_API_KEY=os.getenv("GEMINI_API_KEY"),
    SUPABASE_URL=os.getenv("SUPABASE_URL", ""),
    SUPABASE_KEY=os.getenv("SUPABASE_KEY", "")
)
