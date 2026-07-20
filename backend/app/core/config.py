import os
from pydantic import BaseModel

class Settings(BaseModel):
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1/chat/completions"

settings = Settings()