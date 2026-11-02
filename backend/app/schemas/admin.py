from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class UserRoleUpdate(BaseModel):
    role: str
    department_id: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: str
    actor_id: Optional[str] = None
    actor_name: Optional[str] = None
    action: str
    entity_type: str
    entity_id: str
    metadata: Dict[str, Any] = {}
    created_at: datetime


class AdminOverviewMetrics(BaseModel):
    total_users: int
    total_citizens: int
    total_department_staff: int
    total_complaints: int
    open_complaints: int
    in_progress_complaints: int
    resolved_complaints: int
    escalated_complaints: int
    avg_resolution_hours: float
    resolution_rate_percent: float
    total_departments: int
    total_categories: int
