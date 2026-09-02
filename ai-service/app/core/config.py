import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous HR AI Agent - Service"
    VERSION: str = "2.0"
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    DB_PATH: str = os.getenv("DB_PATH", os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../data/hr_agent.db")))

settings = Settings()
