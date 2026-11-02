from app.core.config import settings
from app.services.ai.base import BaseAIProvider
from app.services.ai.fallback_provider import LocalFallbackAIProvider
from app.services.ai.sarvam_provider import SarvamAIProvider


def get_ai_provider() -> BaseAIProvider:
    """Returns the configured AI Provider instance (Sarvam or local fallback)."""
    if settings.SARVAM_API_KEY and settings.SARVAM_API_KEY.strip():
        return SarvamAIProvider(
            api_key=settings.SARVAM_API_KEY.strip(),
            base_url=settings.SARVAM_API_BASE_URL,
        )
    return LocalFallbackAIProvider()
