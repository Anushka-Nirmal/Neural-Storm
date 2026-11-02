import datetime
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.complaint import (
    Complaint,
    ComplaintStatusHistory,
    ComplaintAssignment,
    ComplaintComment,
    ComplaintFeedback,
)
from app.models.department import Department, ComplaintCategory, CategoryDepartmentMapping
from app.models.notification import Notification
from app.models.audit import AuditLog
from app.utils.ticket_generator import generate_ticket_id

ALLOWED_TRANSITIONS: Dict[str, List[str]] = {
    "submitted": ["acknowledged", "under_review", "rejected"],
    "acknowledged": ["under_review", "assigned", "rejected"],
    "under_review": ["assigned", "awaiting_information", "in_progress", "rejected"],
    "assigned": ["in_progress", "awaiting_information", "escalated", "resolved"],
    "awaiting_information": ["in_progress", "under_review", "resolved"],
    "in_progress": ["awaiting_information", "escalated", "resolved"],
    "escalated": ["in_progress", "resolved"],
    "resolved": ["closed", "reopened"],
    "closed": ["reopened"],
    "reopened": ["in_progress", "under_review"],
    "rejected": [],
}


def calculate_due_date(priority: str) -> datetime.datetime:
    now = datetime.datetime.now(datetime.timezone.utc)
    if priority == "critical":
        hours = settings.SLA_CRITICAL_HOURS
    elif priority == "high":
        hours = settings.SLA_HIGH_HOURS
    elif priority == "low":
        hours = settings.SLA_LOW_HOURS
    else:
        hours = settings.SLA_MEDIUM_HOURS
    return now + datetime.timedelta(hours=hours)


class ComplaintService:
    @staticmethod
    def create_complaint(
        db: Session,
        citizen_id: str,
        title: str,
        description: str,
        language: str = "en",
        translated_description: Optional[str] = None,
        ai_summary: Optional[str] = None,
        category_id: Optional[str] = None,
        assigned_department_id: Optional[str] = None,
        ai_suggested_department_id: Optional[str] = None,
        ai_confidence: Optional[float] = None,
        ai_suggested_urgency: Optional[str] = None,
        priority: str = "medium",
        state: Optional[str] = None,
        district: Optional[str] = None,
        locality: Optional[str] = None,
        idempotency_key: Optional[str] = None,
    ) -> Complaint:
        # Check idempotency
        if idempotency_key:
            existing = db.query(Complaint).filter(Complaint.idempotency_key == idempotency_key).first()
            if existing:
                return existing

        # Ensure priority is valid
        if priority not in ["low", "medium", "high", "critical"]:
            priority = ai_suggested_urgency if ai_suggested_urgency in ["low", "medium", "high", "critical"] else "medium"

        # Determine department routing if not manually specified
        final_dept_id = assigned_department_id or ai_suggested_department_id
        if not final_dept_id and category_id:
            mapping = (
                db.query(CategoryDepartmentMapping)
                .filter(CategoryDepartmentMapping.category_id == category_id, CategoryDepartmentMapping.is_active == True)
                .order_by(CategoryDepartmentMapping.routing_rank.asc())
                .first()
            )
            if mapping:
                final_dept_id = mapping.department_id

        ticket_id = generate_ticket_id()
        # Verify ticket_id uniqueness
        while db.query(Complaint).filter(Complaint.ticket_id == ticket_id).first():
            ticket_id = generate_ticket_id()

        due_at = calculate_due_date(priority)

        complaint = Complaint(
            ticket_id=ticket_id,
            citizen_id=citizen_id,
            title=title.strip(),
            original_description=description.strip(),
            original_language=language,
            translated_description=translated_description,
            ai_summary=ai_summary,
            category_id=category_id,
            assigned_department_id=final_dept_id,
            ai_suggested_department_id=ai_suggested_department_id,
            ai_confidence=ai_confidence,
            ai_suggested_urgency=ai_suggested_urgency,
            priority=priority,
            status="submitted",
            state=state,
            district=district,
            locality=locality,
            due_at=due_at,
            idempotency_key=idempotency_key,
        )
        db.add(complaint)
        db.flush()

        # Initial status history record
        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            previous_status=None,
            new_status="submitted",
            changed_by=citizen_id,
            public_comment="Complaint registered in JanSahayak AI system.",
        )
        db.add(history)

        # Initial notification to citizen
        notif = Notification(
            recipient_id=citizen_id,
            complaint_id=complaint.id,
            channel="in_app",
            title=f"Complaint Registered: {complaint.ticket_id}",
            message=f"Your grievance '{complaint.title}' has been successfully submitted with Ticket ID {complaint.ticket_id}.",
            status="sent",
        )
        db.add(notif)

        # Audit log entry
        audit = AuditLog(
            actor_id=citizen_id,
            action="COMPLAINT_CREATED",
            entity_type="complaint",
            entity_id=complaint.id,
        )
        audit.set_metadata({"ticket_id": complaint.ticket_id, "priority": complaint.priority})
        db.add(audit)

        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def update_status(
        db: Session,
        complaint: Complaint,
        new_status: str,
        actor_id: str,
        public_comment: Optional[str] = None,
        internal_note: Optional[str] = None,
        resolution_summary: Optional[str] = None,
    ) -> Complaint:
        valid_targets = ALLOWED_TRANSITIONS.get(complaint.status, [])
        if new_status not in valid_targets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from '{complaint.status}' to '{new_status}'. Allowed: {valid_targets}",
            )

        prev_status = complaint.status
        complaint.status = new_status
        now = datetime.datetime.now(datetime.timezone.utc)
        complaint.updated_at = now

        if new_status == "resolved":
            complaint.resolved_at = now
            if resolution_summary:
                complaint.resolution_summary = resolution_summary
        elif new_status == "closed":
            complaint.closed_at = now

        # Add history record
        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            previous_status=prev_status,
            new_status=new_status,
            changed_by=actor_id,
            public_comment=public_comment or f"Status changed to {new_status.replace('_', ' ').capitalize()}.",
        )
        db.add(history)

        # Add internal note if provided
        if internal_note and internal_note.strip():
            comment = ComplaintComment(
                complaint_id=complaint.id,
                author_id=actor_id,
                body=internal_note.strip(),
                visibility="internal",
            )
            db.add(comment)

        # Citizen notification
        notif = Notification(
            recipient_id=complaint.citizen_id,
            complaint_id=complaint.id,
            channel="in_app",
            title=f"Status Update on {complaint.ticket_id}",
            message=f"Your complaint status has changed to '{new_status.replace('_', ' ').title()}'. {public_comment or ''}".strip(),
            status="sent",
        )
        db.add(notif)

        # Audit log
        audit = AuditLog(
            actor_id=actor_id,
            action="COMPLAINT_STATUS_UPDATED",
            entity_type="complaint",
            entity_id=complaint.id,
        )
        audit.set_metadata({"from": prev_status, "to": new_status, "ticket_id": complaint.ticket_id})
        db.add(audit)

        db.commit()
        db.refresh(complaint)
        return complaint

    @staticmethod
    def assign_complaint(
        db: Session,
        complaint: Complaint,
        assigned_by_id: str,
        department_id: Optional[str] = None,
        officer_id: Optional[str] = None,
        reason: Optional[str] = None,
    ) -> Complaint:
        if department_id:
            complaint.assigned_department_id = department_id
        if officer_id:
            complaint.assigned_officer_id = officer_id

        # Update assignment record
        assignment = ComplaintAssignment(
            complaint_id=complaint.id,
            department_id=complaint.assigned_department_id,
            assigned_to=officer_id,
            assigned_by=assigned_by_id,
            reason=reason,
        )
        db.add(assignment)

        # Status transition to 'assigned' if currently 'submitted', 'acknowledged', or 'under_review'
        if complaint.status in ["submitted", "acknowledged", "under_review"]:
            complaint.status = "assigned"
            history = ComplaintStatusHistory(
                complaint_id=complaint.id,
                previous_status="under_review",
                new_status="assigned",
                changed_by=assigned_by_id,
                public_comment="Grievance assigned to department officer for field investigation.",
            )
            db.add(history)

        # Notify assigned officer if specified
        if officer_id:
            db.add(
                Notification(
                    recipient_id=officer_id,
                    complaint_id=complaint.id,
                    channel="in_app",
                    title=f"New Case Assigned: {complaint.ticket_id}",
                    message=f"You have been assigned to handle complaint '{complaint.title}'.",
                    status="sent",
                )
            )

        db.commit()
        db.refresh(complaint)
        return complaint
