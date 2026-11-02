import os
from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_ENV_PATH = str(_BACKEND_DIR / ".env")


class Settings(BaseSettings):
    PROJECT_NAME: str = "JanSahayak AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    DEMO_MODE: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./jansahayak.db"

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = "jansahayak-secret-key-32-chars-minimum-change-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI Service Configuration
    SARVAM_API_KEY: str = ""
    SARVAM_API_BASE_URL: str = "https://api.sarvam.ai"
    AI_REQUEST_TIMEOUT_SECONDS: int = 15
    AI_CONFIDENCE_THRESHOLD_HIGH: float = 0.80
    AI_CONFIDENCE_THRESHOLD_MEDIUM: float = 0.55

    # Storage and Limits
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_ATTACHMENT_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "audio/mpeg",
        "audio/wav",
        "audio/webm",
        "audio/ogg"
    ]

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://jansahayak.vercel.app"
    ]

    # Email / SMS / External Providers
    EMAIL_PROVIDER: str = "console"
    EMAIL_API_KEY: str = ""
    SMS_PROVIDER: str = "console"
    SMS_API_KEY: str = ""

    # Escalation SLA Defaults (hours)
    SLA_CRITICAL_HOURS: int = 24
    SLA_HIGH_HOURS: int = 48
    SLA_MEDIUM_HOURS: int = 96
    SLA_LOW_HOURS: int = 168

    model_config = SettingsConfigDict(
        env_file=(_ENV_PATH, ".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
