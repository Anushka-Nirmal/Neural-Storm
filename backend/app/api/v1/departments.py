import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    AuthenticatedUserContext,
    require_department_staff,
    require_department_head,
)
from app.models.complaint import Complaint, ComplaintStatusHistory
from app.models.department import Department, ComplaintCategory
from app.schemas.department import DepartmentResponse, CategoryResponse
from app.schemas.complaint import (
    ComplaintResponse,
    StatusUpdateRequest,
    AssignRequest,
    EscalateRequest,
    ResolveRequest,
)
from app.services.complaint_service import ComplaintService
from app.api.v1.complaints import format_complaint_response

router = APIRouter(tags=["Department Operations"])


@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    """List all active departments."""
    depts = db.query(Department).filter(Department.is_active == True).order_by(Department.name.asc()).all()
    return depts


@router.get("/departments/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """List all active complaint categories."""
    cats = db.query(ComplaintCategory).filter(ComplaintCategory.is_active == True).order_by(ComplaintCategory.name.asc()).all()
    return cats


@router.get("/departments/me/complaints", response_model=List[ComplaintResponse])
def get_department_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = None,
    category_id: Optional[str] = None,
    assigned_to_me: bool = False,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: AuthenticatedUserContext = Depends(require_department_staff),
    db: Session = Depends(get_db),
):
    query = db.query(Complaint)

    # If not system admin, restrict strictly to officer's assigned department
    if not current_user.has_role("system_admin"):
        if not current_user.department_id:
            return []
        query = query.filter(Complaint.assigned_department_id == current_user.department_id)

    if assigned_to_me:
        query = query.filter(Complaint.assigned_officer_id == current_user.id)
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if priority:
        query = query.filter(Complaint.priority == priority)
    if category_id:
        query = query.filter(Complaint.category_id == category_id)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Complaint.title.ilike(search_fmt)) | (Complaint.ticket_id.ilike(search_fmt))
        )

    complaints = query.order_by(Complaint.submitted_at.desc()).offset(skip).limit(limit).all()
    return [format_complaint_response(c, db) for c in complaints]


@router.get("/departments/me/analytics")
def get_department_analytics(
    current_user: AuthenticatedUserContext = Depends(require_department_staff),
    db: Session = Depends(get_db),
):
    dept_id = current_user.department_id
    query = db.query(Complaint)
    if not current_user.has_role("system_admin") and dept_id:
        query = query.filter(Complaint.assigned_department_id == dept_id)

    total_assigned = query.count()
    new_received = query.filter(Complaint.status == "submitted").count()
    in_progress = query.filter(Complaint.status.in_(["under_review", "assigned", "in_progress", "awaiting_information"])).count()
    resolved = query.filter(Complaint.status.in_(["resolved", "closed"])).count()
    escalated = query.filter(Complaint.status == "escalated").count()

    now = datetime.datetime.now(datetime.timezone.utc)
    overdue = query.filter(
        Complaint.status.in_(["submitted", "acknowledged", "under_review", "assigned", "in_progress", "escalated"]),
        Complaint.due_at <= now,
    ).count()

    # Category breakdown
    category_counts = (
        db.query(ComplaintCategory.name, func.count(Complaint.id))
        .join(Complaint, Complaint.category_id == ComplaintCategory.id)
        .filter(Complaint.assigned_department_id == dept_id if dept_id and not current_user.has_role("system_admin") else True)
        .group_by(ComplaintCategory.name)
        .all()
    )
    cat_distribution = [{"category": name, "count": count} for name, count in category_counts]

    # Priority breakdown
    priority_counts = (
        query.with_entities(Complaint.priority, func.count(Complaint.id))
        .group_by(Complaint.priority)
        .all()
    )
    priority_distribution = [{"priority": p, "count": c} for p, c in priority_counts]

    # Resolution rate
    resolution_rate = round((resolved / total_assigned * 100), 1) if total_assigned > 0 else 0.0

    return {
        "total_assigned": total_assigned,
        "new_received": new_received,
        "in_progress": in_progress,
        "resolved": resolved,
        "escalated": escalated,
        "overdue": overdue,
        "resolution_rate_percent": resolution_rate,
        "category_distribution": cat_distribution,
        "priority_distribution": priority_distribution,
    }


@router.post("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
@router.put("/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status_endpoint(
    complaint_id: str,
    payload: StatusUpdateRequest,
    current_user: AuthenticatedUserContext = Depends(require_department_staff),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if not current_user.has_role("system_admin") and current_user.department_id:
        if complaint.assigned_department_id != current_user.department_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized for this department")

    updated = ComplaintService.update_status(
        db=db,
        complaint=complaint,
        new_status=payload.new_status,
        actor_id=current_user.id,
        public_comment=payload.public_comment,
        internal_note=payload.internal_note,
    )
    return format_complaint_response(updated, db)


@router.post("/complaints/{complaint_id}/assign", response_model=ComplaintResponse)
def assign_complaint_endpoint(
    complaint_id: str,
    payload: AssignRequest,
    current_user: AuthenticatedUserContext = Depends(require_department_staff),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    updated = ComplaintService.assign_complaint(
        db=db,
        complaint=complaint,
        assigned_by_id=current_user.id,
        department_id=payload.department_id,
        officer_id=payload.officer_id,
        reason=payload.reason,
    )
    return format_complaint_response(updated, db)


@router.post("/complaints/{complaint_id}/escalate", response_model=ComplaintResponse)
def escalate_complaint_endpoint(
    complaint_id: str,
    payload: EscalateRequest,
    current_user: AuthenticatedUserContext = Depends(require_department_staff),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    complaint.priority = "critical"
    updated = ComplaintService.update_status(
        db=db,
        complaint=complaint,
        new_status="escalated",
        actor_id=current_user.id,
        public_comment=f"Escalated to senior administration: {payload.reason}",
    )
    return format_complaint_response(updated, db)


@router.post("/complaints/{complaint_id}/resolve", response_model=ComplaintResponse)
def resolve_complaint_endpoint(
    complaint_id: str,
    payload: ResolveRequest,
    current_user: AuthenticatedUserContext = Depends(require_department_staff),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    complaint.resolution_summary = payload.resolution_summary.strip()
    updated = ComplaintService.update_status(
        db=db,
        complaint=complaint,
        new_status="resolved",
        actor_id=current_user.id,
        public_comment=payload.public_comment or f"Resolution: {payload.resolution_summary}",
    )
    return format_complaint_response(updated, db)
