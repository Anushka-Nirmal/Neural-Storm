import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, AuthenticatedUserContext
from app.models.department import Department, ComplaintCategory
from app.models.audit import AIProcessingLog
from app.schemas.ai import (
    AIAnalyzeRequest,
    AIAnalyzeResponse,
    AITranslateRequest,
    AITranslateResponse,
    AITranscribeResponse,
)
from app.services.ai.factory import get_ai_provider

router = APIRouter(prefix="/ai", tags=["AI Services"])


@router.post("/analyze", response_model=AIAnalyzeResponse)
async def analyze_complaint(
    payload: AIAnalyzeRequest,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    start_time = time.time()
    provider = get_ai_provider()

    # Retrieve active categories and departments
    categories = db.query(ComplaintCategory).filter(ComplaintCategory.is_active == True).all()
    departments = db.query(Department).filter(Department.is_active == True).all()

    cat_list = [{"id": c.id, "name": c.name} for c in categories]
    dept_list = [{"id": d.id, "name": d.name} for d in departments]

    try:
        # Step 1: Detect language
        lang_res = await provider.detect_language(
            payload.description, user_hint=payload.selected_language
        )
        detected_lang = lang_res.get("language_code", "en")
        language_name = lang_res.get("language_name", "English")

        # Step 2: Translate if non-English
        translated_text = None
        if detected_lang != "en":
            tr_res = await provider.translate_text(
                payload.description, source_language=detected_lang, target_language="en"
            )
            translated_text = tr_res.get("translated_text")

        # Step 3: Classify, assign department recommendation, assess urgency, summarize
        analysis = await provider.classify_and_analyze(
            title=payload.title,
            description=translated_text or payload.description,
            detected_language=detected_lang,
            available_categories=cat_list,
            available_departments=dept_list,
        )

        duration_ms = int((time.time() - start_time) * 1000)

        # Log AI processing metric safely
        ai_log = AIProcessingLog(
            provider=analysis.get("provider", "local_fallback"),
            model_name=analysis.get("model", "heuristic"),
            operation="classification_analysis",
            status="success",
            duration_ms=duration_ms,
        )
        db.add(ai_log)
        db.commit()

        return AIAnalyzeResponse(
            detected_language=detected_lang,
            language_name=language_name,
            translated_text=translated_text,
            suggested_category=analysis["suggested_category"],
            suggested_category_id=analysis["suggested_category_id"],
            suggested_department=analysis["suggested_department"],
            suggested_department_id=analysis["suggested_department_id"],
            suggested_urgency=analysis["suggested_urgency"],
            summary=analysis["summary"],
            confidence=analysis["confidence"],
            reasoning_summary=analysis["reasoning_summary"],
            requires_human_review=analysis["requires_human_review"],
            provider=analysis["provider"],
            model=analysis["model"],
        )
    except Exception as e:
        db.rollback()
        duration_ms = int((time.time() - start_time) * 1000)
        ai_log = AIProcessingLog(
            provider=provider.provider_name,
            model_name="error",
            operation="classification_analysis",
            status="failed",
            duration_ms=duration_ms,
            safe_error_code="ANALYSIS_EXCEPTION",
        )
        db.add(ai_log)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI analysis encountered an error. You may proceed with manual category selection.",
        )


@router.post("/translate", response_model=AITranslateResponse)
async def translate_text_endpoint(
    payload: AITranslateRequest,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
):
    provider = get_ai_provider()
    result = await provider.translate_text(
        text=payload.text,
        source_language=payload.source_language,
        target_language=payload.target_language,
    )
    return AITranslateResponse(
        source_language=result["source_language"],
        target_language=result["target_language"],
        translated_text=result["translated_text"],
        provider=result["provider"],
    )


@router.post("/transcribe", response_model=AITranscribeResponse)
async def transcribe_audio_endpoint(
    audio: UploadFile = File(...),
    language_code: Optional[str] = Form(None),
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate audio MIME
    if audio.content_type not in settings.ALLOWED_ATTACHMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{audio.content_type}'.",
        )

    # Read audio bytes with size limit
    audio_bytes = await audio.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(audio_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio file exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB.",
        )

    provider = get_ai_provider()
    result = await provider.transcribe_audio(
        audio_bytes=audio_bytes,
        filename=audio.filename or "recording.webm",
        mime_type=audio.content_type,
        language_code=language_code,
    )

    return AITranscribeResponse(
        transcription=result["transcription"],
        detected_language=result["detected_language"],
        language_name=result["language_name"],
        confidence=result["confidence"],
        provider=result["provider"],
    )
