import asyncio
from app.services.ai.fallback_provider import LocalFallbackAIProvider


def test_fallback_language_detection():
    provider = LocalFallbackAIProvider()

    # Hindi script detection
    res_hi = asyncio.run(provider.detect_language("हमारे इलाके में पानी की भारी समस्या है।"))
    assert res_hi["language_code"] in ["hi", "mr"]

    # Tamil script detection
    res_ta = asyncio.run(provider.detect_language("எங்கள் பகுதியில் குடிநீர் விநியோகம் இல்லை"))
    assert res_ta["language_code"] == "ta"

    # English text
    res_en = asyncio.run(provider.detect_language("There is no electricity in our sector for 2 days."))
    assert res_en["language_code"] == "en"


def test_fallback_classification_and_urgency():
    provider = LocalFallbackAIProvider()
    cats = [
        {"id": "1", "name": "Water Supply"},
        {"id": "2", "name": "Electricity"},
        {"id": "3", "name": "Roads & Infrastructure"},
    ]
    depts = [
        {"id": "d1", "name": "Department of Water Supply & Sewerage"},
        {"id": "d2", "name": "Department of Energy & Power"},
    ]

    analysis = asyncio.run(
        provider.classify_and_analyze(
            title="Contaminated drinking water pipeline leak",
            description="Drinking water pipe has broken and dirty sewage is mixing into it. Urgent danger to health.",
            detected_language="en",
            available_categories=cats,
            available_departments=depts,
        )
    )

    assert analysis["suggested_category"] == "Water Supply"
    assert analysis["suggested_urgency"] in ["high", "critical"]
    assert analysis["confidence"] >= 0.70
    assert len(analysis["summary"]) > 10
