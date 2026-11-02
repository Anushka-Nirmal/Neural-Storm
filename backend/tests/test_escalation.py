import datetime
from app.models.complaint import Complaint
from app.services.escalation_service import EscalationService


def test_escalation_engine_idempotent(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    # Create an overdue complaint
    c = Complaint(
        ticket_id="JSA-2026-TEST99",
        citizen_id="demo-citizen-id",
        title="Delayed water leak repair",
        original_description="Overdue grievance requiring resolution.",
        priority="medium",
        status="in_progress",
        due_at=now - datetime.timedelta(hours=5),  # 5 hours overdue
    )
    db_session.add(c)
    db_session.commit()

    # Run sweep
    escalated_first = EscalationService.run_escalation_check(db_session)
    assert c.ticket_id in escalated_first
    assert c.status == "escalated"

    # Run sweep again to verify idempotency (must not re-escalate)
    escalated_second = EscalationService.run_escalation_check(db_session)
    assert c.ticket_id not in escalated_second
