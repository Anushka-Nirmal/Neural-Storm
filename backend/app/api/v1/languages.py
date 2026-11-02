from typing import List
from fastapi import APIRouter
from app.services.ai.languages import get_all_languages
from app.schemas.ai import LanguageCapability

router = APIRouter(prefix="/languages", tags=["Languages"])


@router.get("", response_model=List[LanguageCapability])
def get_supported_languages():
    """Returns configured Indian language capabilities."""
    all_langs = get_all_languages()
    return [
        LanguageCapability(
            code=l["code"],
            name=l["name"],
            native_name=l["native_name"],
            ui_supported=l["ui_supported"],
            speech_supported=l["speech_supported"],
            translation_supported=l["translation_supported"],
        )
        for l in all_langs
    ]
