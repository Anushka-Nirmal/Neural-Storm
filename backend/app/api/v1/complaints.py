import os
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_department_staff, AuthenticatedUserContext
from app.models.complaint import (
    Complaint,
    ComplaintStatusHistory,
    ComplaintComment,
    ComplaintAttachment,
    ComplaintFeedback,
)
from app.models.user import User
from app.models.department import Department, ComplaintCategory
from app.models.audit import AuditLog
from app.schemas.complaint import (
    StatusUpdateRequest,
    ComplaintCreate,
    ComplaintResponse,
    ComplaintDetailResponse,
    StatusHistoryResponse,
    CommentCreate,
    CommentResponse,
    AttachmentResponse,
    FeedbackCreate,
    FeedbackResponse,
    ReopenRequest,
)
from app.services.complaint_service import ComplaintService

router = APIRouter(prefix="/complaints", tags=["Complaints"])


def format_complaint_response(c: Complaint, db: Session) -> ComplaintResponse:
    cat_name = c.category.name if c.category else None
    dept_name = c.assigned_department.name if c.assigned_department else None
    return ComplaintResponse(
        id=c.id,
        ticket_id=c.ticket_id,
        title=c.title,
        original_language=c.original_language,
        category_id=c.category_id,
        category_name=cat_name,
        assigned_department_id=c.assigned_department_id,
        department_name=dept_name,
        priority=c.priority,
        status=c.status,
        submitted_at=c.submitted_at,
        updated_at=c.updated_at,
        due_at=c.due_at,
        state=c.state,
        district=c.district,
    )


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint(
    payload: ComplaintCreate,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = ComplaintService.create_complaint(
        db=db,
        citizen_id=current_user.id,
        title=payload.title,
        description=payload.description,
        language=payload.language,
        translated_description=payload.translated_description,
        ai_summary=payload.ai_summary,
        category_id=payload.category_id,
        assigned_department_id=payload.assigned_department_id,
        ai_suggested_department_id=payload.ai_suggested_department_id,
        ai_confidence=payload.ai_confidence,
        ai_suggested_urgency=payload.ai_suggested_urgency,
        priority=payload.priority or "medium",
        state=payload.state,
        district=payload.district,
        locality=payload.locality,
        idempotency_key=payload.idempotency_key,
    )
    return format_complaint_response(complaint, db)


@router.get("", response_model=List[ComplaintResponse])
def get_citizen_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Rule: Citizens must only view their own complaints
    query = db.query(Complaint).filter(Complaint.citizen_id == current_user.id)

    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if category_id:
        query = query.filter(Complaint.category_id == category_id)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            (Complaint.title.ilike(search_fmt)) | (Complaint.ticket_id.ilike(search_fmt))
        )

    complaints = query.order_by(Complaint.submitted_at.desc()).offset(skip).limit(limit).all()
    return [format_complaint_response(c, db) for c in complaints]


@router.get("/track/{ticket_id}")
def track_public_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    """
    Public ticket tracking endpoint.
    Safely presents complaint progress timeline without leaking citizen PII or internal notes.
    """
    clean_id = ticket_id.strip().upper()
    complaint = db.query(Complaint).filter(Complaint.ticket_id == clean_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No grievance found with Ticket ID '{clean_id}'. Please verify the reference code.",
        )

    # Status timeline
    history = (
        db.query(ComplaintStatusHistory)
        .filter(ComplaintStatusHistory.complaint_id == complaint.id)
        .order_by(ComplaintStatusHistory.created_at.asc())
        .all()
    )

    timeline = [
        {
            "status": h.new_status,
            "comment": h.public_comment,
            "timestamp": h.created_at,
        }
        for h in history
    ]

    return {
        "ticket_id": complaint.ticket_id,
        "title": complaint.title,
        "category_name": complaint.category.name if complaint.category else "General",
        "department_name": complaint.assigned_department.name if complaint.assigned_department else "Under Routing",
        "status": complaint.status,
        "priority": complaint.priority,
        "submitted_at": complaint.submitted_at,
        "updated_at": complaint.updated_at,
        "resolution_summary": complaint.resolution_summary if complaint.status in ["resolved", "closed"] else None,
        "timeline": timeline,
    }


@router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
def get_complaint_detail(
    complaint_id: str,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    # Access control: citizen owns it OR staff member
    is_owner = complaint.citizen_id == current_user.id
    is_staff = current_user.has_role("department_officer", "department_head", "system_admin")

    if not is_owner and not is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this complaint.",
        )

    # Department scoping check for officers/heads
    if is_staff and not current_user.has_role("system_admin"):
        if current_user.department_id and complaint.assigned_department_id != current_user.department_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This complaint belongs to another department.",
            )

    cat_name = complaint.category.name if complaint.category else None
    dept_name = complaint.assigned_department.name if complaint.assigned_department else None
    officer_name = complaint.assigned_officer.full_name if complaint.assigned_officer else None

    # History
    history_items = [
        StatusHistoryResponse(
            id=h.id,
            previous_status=h.previous_status,
            new_status=h.new_status,
            changed_by_name=h.actor.full_name if h.actor else "System",
            public_comment=h.public_comment,
            created_at=h.created_at,
        )
        for h in complaint.status_history
    ]

    # Comments: citizens only see "public" comments; staff see all
    comments_list = []
    for c in complaint.comments:
        if is_staff or c.visibility == "public":
            comments_list.append(
                CommentResponse(
                    id=c.id,
                    author_id=c.author_id,
                    author_name=c.author.full_name if c.author else "Officer",
                    author_role=c.author.roles[0].role if c.author and c.author.roles else "citizen",
                    body=c.body,
                    visibility=c.visibility,
                    created_at=c.created_at,
                )
            )

    # Attachments
    attachments_list = [
        AttachmentResponse(
            id=a.id,
            original_filename=a.original_filename,
            content_type=a.content_type,
            file_size=a.file_size,
            storage_path=a.storage_path,
            created_at=a.created_at,
        )
        for a in complaint.attachments
    ]

    # Feedback
    feedback_data = None
    if complaint.feedback:
        feedback_data = FeedbackResponse(
            id=complaint.feedback.id,
            rating=complaint.feedback.rating,
            feedback_text=complaint.feedback.feedback_text,
            created_at=complaint.feedback.created_at,
        )

    return ComplaintDetailResponse(
        id=complaint.id,
        ticket_id=complaint.ticket_id,
        title=complaint.title,
        original_description=complaint.original_description,
        original_language=complaint.original_language,
        translated_description=complaint.translated_description,
        ai_summary=complaint.ai_summary,
        category_id=complaint.category_id,
        category_name=cat_name,
        assigned_department_id=complaint.assigned_department_id,
        department_name=dept_name,
        assigned_officer_id=complaint.assigned_officer_id,
        assigned_officer_name=officer_name,
        ai_suggested_urgency=complaint.ai_suggested_urgency,
        ai_confidence=complaint.ai_confidence,
        priority=complaint.priority,
        status=complaint.status,
        state=complaint.state,
        district=complaint.district,
        locality=complaint.locality,
        submitted_at=complaint.submitted_at,
        updated_at=complaint.updated_at,
        due_at=complaint.due_at,
        resolved_at=complaint.resolved_at,
        closed_at=complaint.closed_at,
        resolution_summary=complaint.resolution_summary,
        status_history=history_items,
        comments=comments_list,
        attachments=attachments_list,
        feedback=feedback_data,
    )


@router.post("/{complaint_id}/comments", response_model=CommentResponse)
def add_complaint_comment(
    complaint_id: str,
    payload: CommentCreate,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    is_owner = complaint.citizen_id == current_user.id
    is_staff = current_user.has_role("department_officer", "department_head", "system_admin")

    if not is_owner and not is_staff:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Citizens can only add public comments
    visibility = payload.visibility
    if not is_staff:
        visibility = "public"

    comment = ComplaintComment(
        complaint_id=complaint.id,
        author_id=current_user.id,
        body=payload.body.strip(),
        visibility=visibility,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        author_id=comment.author_id,
        author_name=current_user.full_name,
        author_role=current_user.primary_role,
        body=comment.body,
        visibility=comment.visibility,
        created_at=comment.created_at,
    )


@router.post("/{complaint_id}/feedback", response_model=FeedbackResponse)
def submit_complaint_feedback(
    complaint_id: str,
    payload: FeedbackCreate,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only complaint author can submit feedback")

    if complaint.status not in ["resolved", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback can only be submitted once the grievance is marked resolved or closed.",
        )

    if complaint.feedback:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Feedback already submitted for this case.")

    fb = ComplaintFeedback(
        complaint_id=complaint.id,
        citizen_id=current_user.id,
        rating=payload.rating,
        feedback_text=payload.feedback_text,
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)

    return FeedbackResponse(
        id=fb.id,
        rating=fb.rating,
        feedback_text=fb.feedback_text,
        created_at=fb.created_at,
    )


@router.post("/{complaint_id}/reopen", response_model=ComplaintResponse)
def reopen_complaint(
    complaint_id: str,
    payload: ReopenRequest,
    current_user: AuthenticatedUserContext = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    if complaint.citizen_id != current_user.id and not current_user.has_role("system_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")

    if complaint.status not in ["resolved", "closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reopen a grievance currently in '{complaint.status}' status.",
        )

    updated = ComplaintService.update_status(
        db=db,
        complaint=complaint,
        new_status="reopened",
        actor_id=current_user.id,
        public_comment=f"Citizen requested reopening: {payload.reason}",
    )
    return format_complaint_response(updated, db)


@router.post("/{complaint_id}/status", response_model=ComplaintResponse)
@router.put("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status_direct(
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
        resolution_summary=payload.resolution_summary,
    )
    return format_complaint_response(updated, db)
