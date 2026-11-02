import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user, AuthenticatedUserContext
from app.models.notification import Notification, NotificationPreference
from app.schemas.notification import (
    NotificationResponse,
    NotificationPreferenceUpdate,
    NotificationPreferenceResponse,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Notification).filter(Notification.recipient_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.status != "read")

    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.recipient_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.status = "read"
    notif.read_at = datetime.datetime.now(datetime.timezone.utc)
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/read-all")
def mark_all_notifications_read(
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.datetime.now(datetime.timezone.utc)
    db.query(Notification).filter(
        Notification.recipient_id == current_user.id,
        Notification.status != "read",
    ).update({"status": "read", "read_at": now})
    db.commit()
    return {"message": "All notifications marked as read."}


@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_notification_preferences(
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.patch("/preferences", response_model=NotificationPreferenceResponse)
def update_notification_preferences(
    payload: NotificationPreferenceUpdate,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    if payload.email_enabled is not None:
        pref.email_enabled = payload.email_enabled
    if payload.sms_enabled is not None:
        pref.sms_enabled = payload.sms_enabled
    if payload.in_app_enabled is not None:
        pref.in_app_enabled = payload.in_app_enabled
    if payload.preferred_language is not None:
        pref.preferred_language = payload.preferred_language

    db.commit()
    db.refresh(pref)
    return pref
