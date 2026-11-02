from typing import Optional, List
from pydantic import BaseModel, Field


class AIAnalyzeRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    selected_language: Optional[str] = Field(default="en")
    state: Optional[str] = None
    district: Optional[str] = None


class AIAnalyzeResponse(BaseModel):
    detected_language: str
    language_name: str
    translated_text: Optional[str] = None
    suggested_category: str
    suggested_category_id: Optional[str] = None
    suggested_department: str
    suggested_department_id: Optional[str] = None
    suggested_urgency: str  # low, medium, high, critical
    summary: str
    confidence: float
    reasoning_summary: str
    requires_human_review: bool = False
    provider: str
    model: str


class AITranslateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_language: Optional[str] = None
    target_language: str = "en"


class AITranslateResponse(BaseModel):
    source_language: str
    target_language: str
    translated_text: str
    provider: str


class AITranscribeResponse(BaseModel):
    transcription: str
    detected_language: str
    language_name: str
    confidence: float
    provider: str


class LanguageCapability(BaseModel):
    code: str
    name: str
    native_name: str
    ui_supported: bool
    speech_supported: bool
    translation_supported: bool
