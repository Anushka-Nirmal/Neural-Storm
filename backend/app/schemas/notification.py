from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: str
    complaint_id: Optional[str] = None
    channel: str
    title: str
    message: str
    status: str
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationPreferenceUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None
    in_app_enabled: Optional[bool] = None
    preferred_language: Optional[str] = None


class NotificationPreferenceResponse(BaseModel):
    email_enabled: bool
    sms_enabled: bool
    in_app_enabled: bool
    preferred_language: str

    model_config = ConfigDict(from_attributes=True)
