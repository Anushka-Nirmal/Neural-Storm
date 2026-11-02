from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ComplaintCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    language: str = Field(default="en", max_length=20)
    translated_description: Optional[str] = None
    ai_summary: Optional[str] = None
    category_id: Optional[str] = None
    assigned_department_id: Optional[str] = None
    ai_suggested_department_id: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_suggested_urgency: Optional[str] = None
    priority: Optional[str] = "medium"  # low, medium, high, critical
    state: Optional[str] = None
    district: Optional[str] = None
    locality: Optional[str] = None
    idempotency_key: Optional[str] = None


class StatusHistoryResponse(BaseModel):
    id: str
    previous_status: Optional[str] = None
    new_status: str
    changed_by_name: Optional[str] = None
    public_comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1, max_length=2000)
    visibility: str = Field(default="public", description="public or internal")


class CommentResponse(BaseModel):
    id: str
    author_id: Optional[str] = None
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    body: str
    visibility: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttachmentResponse(BaseModel):
    id: str
    original_filename: str
    content_type: str
    file_size: int
    storage_path: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback_text: Optional[str] = Field(default=None, max_length=1000)


class FeedbackResponse(BaseModel):
    id: str
    rating: int
    feedback_text: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ComplaintResponse(BaseModel):
    id: str
    ticket_id: str
    title: str
    original_language: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    assigned_department_id: Optional[str] = None
    department_name: Optional[str] = None
    priority: str
    status: str
    submitted_at: datetime
    updated_at: datetime
    due_at: Optional[datetime] = None
    state: Optional[str] = None
    district: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ComplaintDetailResponse(ComplaintResponse):
    original_description: str
    translated_description: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_suggested_urgency: Optional[str] = None
    ai_confidence: Optional[float] = None
    locality: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    assigned_officer_name: Optional[str] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    resolution_summary: Optional[str] = None
    status_history: List[StatusHistoryResponse] = []
    comments: List[CommentResponse] = []
    attachments: List[AttachmentResponse] = []
    feedback: Optional[FeedbackResponse] = None

    model_config = ConfigDict(from_attributes=True)


class StatusUpdateRequest(BaseModel):
    new_status: str
    public_comment: Optional[str] = None
    internal_note: Optional[str] = None
    resolution_summary: Optional[str] = None


class AssignRequest(BaseModel):
    department_id: Optional[str] = None
    officer_id: Optional[str] = None
    reason: Optional[str] = None


class EscalateRequest(BaseModel):
    reason: str = Field(..., min_length=5)


class ResolveRequest(BaseModel):
    resolution_summary: str = Field(..., min_length=10)
    public_comment: Optional[str] = None


class ReopenRequest(BaseModel):
    reason: str = Field(..., min_length=10)
