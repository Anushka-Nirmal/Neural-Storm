import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text
from app.core.database import Base
from app.models.user import generate_uuid, utc_now


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)  # e.g., "COMPLAINT_CREATED", "STATUS_UPDATED"
    entity_type = Column(String(50), nullable=False, index=True)  # "complaint", "user", "department"
    entity_id = Column(String(64), nullable=False, index=True)
    safe_metadata = Column(Text, nullable=True)  # JSON-encoded sanitized dictionary
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    def set_metadata(self, data: Optional[Dict[str, Any]]):
        if data:
            self.safe_metadata = json.dumps(data)
        else:
            self.safe_metadata = None

    def get_metadata(self) -> Dict[str, Any]:
        if self.safe_metadata:
            try:
                return json.loads(self.safe_metadata)
            except Exception:
                return {}
        return {}


class AIProcessingLog(Base):
    __tablename__ = "ai_processing_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="SET NULL"), nullable=True, index=True)
    provider = Column(String(50), nullable=False)  # "sarvam", "local_fallback"
    model_name = Column(String(100), nullable=False)
    operation = Column(String(50), nullable=False)  # "transcription", "translation", "classification", "summarization"
    status = Column(String(30), nullable=False)  # "success", "failed", "fallback"
    duration_ms = Column(Integer, nullable=False)
    safe_error_code = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
