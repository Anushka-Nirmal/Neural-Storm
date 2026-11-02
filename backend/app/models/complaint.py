from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Float, Integer, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, utc_now


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticket_id = Column(String(32), unique=True, nullable=False, index=True)
    citizen_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    original_description = Column(Text, nullable=False)
    original_language = Column(String(20), default="en", nullable=False)
    translated_description = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)

    category_id = Column(String(36), ForeignKey("complaint_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_officer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    ai_suggested_department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)

    ai_confidence = Column(Float, nullable=True)
    ai_suggested_urgency = Column(String(20), nullable=True)  # low, medium, high, critical
    priority = Column(String(20), default="medium", nullable=False, index=True)
    status = Column(String(30), default="submitted", nullable=False, index=True)

    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    locality = Column(String(255), nullable=True)

    submitted_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    due_at = Column(DateTime(timezone=True), nullable=True, index=True)

    resolution_summary = Column(Text, nullable=True)
    idempotency_key = Column(String(64), unique=True, nullable=True, index=True)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="complaints")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])
    category = relationship("ComplaintCategory", back_populates="complaints")
    assigned_department = relationship("Department", foreign_keys=[assigned_department_id], back_populates="complaints")
    ai_suggested_department = relationship("Department", foreign_keys=[ai_suggested_department_id])

    status_history = relationship("ComplaintStatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintStatusHistory.created_at.desc()")
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintAssignment.assigned_at.desc()")
    comments = relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintComment.created_at.asc()")
    attachments = relationship("ComplaintAttachment", back_populates="complaint", cascade="all, delete-orphan")
    feedback = relationship("ComplaintFeedback", back_populates="complaint", uselist=False, cascade="all, delete-orphan")


class ComplaintAssignment(Base):
    __tablename__ = "complaint_assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    unassigned_at = Column(DateTime(timezone=True), nullable=True)
    reason = Column(Text, nullable=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="assignments")
    officer = relationship("User", foreign_keys=[assigned_to])
    assigner = relationship("User", foreign_keys=[assigned_by])
    department = relationship("Department")


class ComplaintStatusHistory(Base):
    __tablename__ = "complaint_status_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    changed_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    public_comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)

    # Relationships
    complaint = relationship("Complaint", back_populates="status_history")
    actor = relationship("User")


class ComplaintComment(Base):
    __tablename__ = "complaint_comments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    body = Column(Text, nullable=False)
    visibility = Column(String(20), default="public", nullable=False)  # "public" or "internal"
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    complaint = relationship("Complaint", back_populates="comments")
    author = relationship("User")


class ComplaintAttachment(Base):
    __tablename__ = "complaint_attachments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    storage_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    complaint = relationship("Complaint", back_populates="attachments")


class ComplaintFeedback(Base):
    __tablename__ = "complaint_feedback"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    citizen_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 to 5
    feedback_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    complaint = relationship("Complaint", back_populates="feedback")
    citizen = relationship("User")
