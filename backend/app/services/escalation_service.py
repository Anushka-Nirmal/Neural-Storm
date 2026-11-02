import datetime
import logging
from typing import List
from sqlalchemy.orm import Session
from app.models.complaint import Complaint, ComplaintStatusHistory
from app.models.notification import Notification
from app.models.user import UserRole
from app.models.audit import AuditLog

logger = logging.getLogger(__name__)


class EscalationService:
    @staticmethod
    def run_escalation_check(db: Session) -> List[str]:
        """
        Idempotent background escalation engine.
        Finds overdue complaints that are still active and elevates them to 'escalated'.
        Returns list of escalated ticket IDs.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        active_statuses = ["submitted", "acknowledged", "under_review", "assigned", "awaiting_information", "in_progress"]

        overdue_complaints = (
            db.query(Complaint)
            .filter(
                Complaint.status.in_(active_statuses),
                Complaint.due_at <= now,
            )
            .all()
        )

        escalated_tickets = []
        for complaint in overdue_complaints:
            # Verify idempotency: ensure complaint hasn't already been escalated at this stage
            prev_status = complaint.status
            complaint.status = "escalated"
            complaint.priority = "critical"
            complaint.updated_at = now

            # Append status history
            history = ComplaintStatusHistory(
                complaint_id=complaint.id,
                previous_status=prev_status,
                new_status="escalated",
                changed_by=None,  # System automated action
                public_comment=f"Automated Escalation: Resolution deadline elapsed without closure. Escalated to Department Head.",
            )
            db.add(history)

            # Notify Citizen
            db.add(
                Notification(
                    recipient_id=complaint.citizen_id,
                    complaint_id=complaint.id,
                    channel="in_app",
                    title=f"Complaint Escalated: {complaint.ticket_id}",
                    message=f"Your complaint '{complaint.title}' has been automatically escalated to senior department supervision due to elapsed SLA deadline.",
                    status="sent",
                )
            )

            # Notify Department Head(s)
            if complaint.assigned_department_id:
                heads = (
                    db.query(UserRole)
                    .filter(
                        UserRole.department_id == complaint.assigned_department_id,
                        UserRole.role == "department_head",
                    )
                    .all()
                )
                for head in heads:
                    db.add(
                        Notification(
                            recipient_id=head.user_id,
                            complaint_id=complaint.id,
                            channel="in_app",
                            title=f"URGENT: Escalated Complaint {complaint.ticket_id}",
                            message=f"Complaint '{complaint.title}' has breached SLA deadline and requires immediate supervisory intervention.",
                            status="sent",
                        )
                    )

            # Audit log
            audit = AuditLog(
                actor_id=None,
                action="COMPLAINT_ESCALATED_SLA_BREACH",
                entity_type="complaint",
                entity_id=complaint.id,
            )
            audit.set_metadata({"ticket_id": complaint.ticket_id, "prev_status": prev_status})
            db.add(audit)

            escalated_tickets.append(complaint.ticket_id)

        if escalated_tickets:
            db.commit()
            logger.info("Escalation check completed. Escalated tickets: %s", escalated_tickets)

        return escalated_tickets
