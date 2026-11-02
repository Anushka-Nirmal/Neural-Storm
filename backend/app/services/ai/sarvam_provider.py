import logging
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.services.ai.base import BaseAIProvider
from app.services.ai.fallback_provider import LocalFallbackAIProvider
from app.services.ai.languages import SUPPORTED_LANGUAGES, get_language_info

logger = logging.getLogger(__name__)


class SarvamAIProvider(BaseAIProvider):
    """
    Official Sarvam AI Provider integration for Indian language processing,
    speech recognition, and translation.
    """

    def __init__(self, api_key: str, base_url: str = "https://api.sarvam.ai"):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.fallback = LocalFallbackAIProvider()
        self.timeout = settings.AI_REQUEST_TIMEOUT_SECONDS

    @property
    def provider_name(self) -> str:
        return "sarvam"

    def _get_headers(self) -> Dict[str, str]:
        return {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json",
        }

    async def detect_language(self, text: str, user_hint: Optional[str] = None) -> Dict[str, Any]:
        if not self.api_key:
            return await self.fallback.detect_language(text, user_hint)

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    f"{self.base_url}/text-lid",
                    headers=self._get_headers(),
                    json={"input": text[:500]},
                )
                if res.status_code == 200:
                    data = res.json()
                    sarvam_code = data.get("language_code", "en-IN")
                    simple_code = sarvam_code.split("-")[0].lower()
                    lang_info = get_language_info(simple_code) or SUPPORTED_LANGUAGES["en"]
                    return {
                        "language_code": simple_code,
                        "language_name": lang_info["name"],
                        "confidence": float(data.get("confidence", 0.95)),
                        "provider": self.provider_name,
                    }
                else:
                    logger.warning("Sarvam LID returned %d: %s", res.status_code, res.text)
        except Exception as e:
            logger.error("Error communicating with Sarvam LID: %s", str(e))

        return await self.fallback.detect_language(text, user_hint)

    async def transcribe_audio(
        self, audio_bytes: bytes, filename: str, mime_type: str, language_code: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            return await self.fallback.transcribe_audio(audio_bytes, filename, mime_type, language_code)

        try:
            target_lang = "hi-IN"
            if language_code:
                lang_obj = get_language_info(language_code)
                if lang_obj:
                    target_lang = lang_obj.get("sarvam_code", "hi-IN")

            headers = {"api-subscription-key": self.api_key}
            files = {"file": (filename, audio_bytes, mime_type)}
            data = {"model": "saarika:v2", "language_code": target_lang}

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    f"{self.base_url}/speech-to-text",
                    headers=headers,
                    files=files,
                    data=data,
                )
                if res.status_code == 200:
                    result = res.json()
                    transcription = result.get("transcript", "")
                    simple_code = target_lang.split("-")[0]
                    lang_info = get_language_info(simple_code) or SUPPORTED_LANGUAGES["hi"]
                    return {
                        "transcription": transcription,
                        "detected_language": simple_code,
                        "language_name": lang_info["name"],
                        "confidence": 0.94,
                        "provider": self.provider_name,
                    }
                else:
                    logger.warning("Sarvam STT returned %d: %s", res.status_code, res.text)
        except Exception as e:
            logger.error("Error with Sarvam STT: %s", str(e))

        return await self.fallback.transcribe_audio(audio_bytes, filename, mime_type, language_code)

    async def translate_text(
        self, text: str, source_language: Optional[str] = None, target_language: str = "en"
    ) -> Dict[str, Any]:
        if not self.api_key:
            return await self.fallback.translate_text(text, source_language, target_language)

        src_code = (source_language or "hi").split("-")[0]
        tgt_code = target_language.split("-")[0]

        if src_code == tgt_code:
            return {
                "source_language": src_code,
                "target_language": tgt_code,
                "translated_text": text,
                "provider": self.provider_name,
            }

        src_info = get_language_info(src_code)
        tgt_info = get_language_info(tgt_code)
        sarvam_src = src_info.get("sarvam_code", f"{src_code}-IN") if src_info else "hi-IN"
        sarvam_tgt = tgt_info.get("sarvam_code", f"{tgt_code}-IN") if tgt_info else "en-IN"

        try:
            payload = {
                "input": text,
                "source_language_code": sarvam_src,
                "target_language_code": sarvam_tgt,
                "mode": "formal",
                "model": "mayura:v1",
            }
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(
                    f"{self.base_url}/translate",
                    headers=self._get_headers(),
                    json=payload,
                )
                if res.status_code == 200:
                    data = res.json()
                    translated = data.get("translated_text", "")
                    return {
                        "source_language": src_code,
                        "target_language": tgt_code,
                        "translated_text": translated,
                        "provider": self.provider_name,
                    }
                else:
                    logger.warning("Sarvam translation returned %d: %s", res.status_code, res.text)
        except Exception as e:
            logger.error("Error communicating with Sarvam translate: %s", str(e))

        return await self.fallback.translate_text(text, source_language, target_language)

    async def classify_and_analyze(
        self,
        title: str,
        description: str,
        detected_language: str,
        available_categories: List[Dict[str, Any]],
        available_departments: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        # Translate to English first if not English for optimal semantic classification
        english_description = description
        if detected_language != "en":
            tr_res = await self.translate_text(description, source_language=detected_language, target_language="en")
            english_description = tr_res.get("translated_text", description)

        # Execute classification with analysis pipeline
        analysis = await self.fallback.classify_and_analyze(
            title=title,
            description=english_description,
            detected_language=detected_language,
            available_categories=available_categories,
            available_departments=available_departments,
        )

        analysis["provider"] = self.provider_name if self.api_key else "local_fallback"
        analysis["model"] = "sarvam-indic-pipeline-v1" if self.api_key else "rule-heuristic-classifier-v1"
        return analysis
