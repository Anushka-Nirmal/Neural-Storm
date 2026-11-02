from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.user import generate_uuid, utc_now


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipient_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    complaint_id = Column(String(36), ForeignKey("complaints.id", ondelete="SET NULL"), nullable=True, index=True)
    channel = Column(String(30), default="in_app", nullable=False)  # in_app, email, sms
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="sent", nullable=False)  # sent, read, pending, failed
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False, index=True)
    sent_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    recipient = relationship("User", back_populates="notifications")
    complaint = relationship("Complaint")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    email_enabled = Column(Boolean, default=True, nullable=False)
    sms_enabled = Column(Boolean, default=False, nullable=False)
    in_app_enabled = Column(Boolean, default=True, nullable=False)
    preferred_language = Column(String(20), default="en", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="preferences")
