from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional


class BaseAIProvider(ABC):
    """Abstract Base Class for all AI providers."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def detect_language(self, text: str, user_hint: Optional[str] = None) -> Dict[str, Any]:
        """Detect language of given text. Returns code, name, confidence."""
        pass

    @abstractmethod
    async def transcribe_audio(
        self, audio_bytes: bytes, filename: str, mime_type: str, language_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """Transcribe speech audio to text and detect language."""
        pass

    @abstractmethod
    async def translate_text(
        self, text: str, source_language: Optional[str] = None, target_language: str = "en"
    ) -> Dict[str, Any]:
        """Translate text into target language."""
        pass

    @abstractmethod
    async def classify_and_analyze(
        self,
        title: str,
        description: str,
        detected_language: str,
        available_categories: List[Dict[str, Any]],
        available_departments: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Classify category, department recommendation, urgency, and generate summary."""
        pass
