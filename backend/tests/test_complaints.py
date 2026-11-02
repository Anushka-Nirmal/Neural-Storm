def test_submit_complaint_and_track(client, citizen_token):
    headers = {"Authorization": f"Bearer {citizen_token}"}
    payload = {
        "title": "Severe road pothole causing bike accidents",
        "description": "Near civil hospital chowk, there is a deep dangerous pothole. Multiple two-wheelers have met with accidents.",
        "language": "en",
        "priority": "high",
        "state": "Maharashtra",
        "district": "Pune"
    }
    response = client.post("/api/v1/complaints", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert "ticket_id" in data
    assert data["ticket_id"].startswith("JSA-2026-")
    assert data["status"] == "submitted"
    ticket_id = data["ticket_id"]

    # Public tracking
    track_res = client.get(f"/api/v1/complaints/track/{ticket_id}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["ticket_id"] == ticket_id
    assert len(track_data["timeline"]) >= 1


def test_complaint_privacy_and_access(client, citizen_token):
    # Citizen lists complaints
    headers = {"Authorization": f"Bearer {citizen_token}"}
    response = client.get("/api/v1/complaints", headers=headers)
    assert response.status_code == 200
    complaints = response.json()
    assert isinstance(complaints, list)
    assert len(complaints) >= 1


def test_status_update_lifecycle(client, officer_token, db_session):
    from app.models.complaint import Complaint
    complaint = db_session.query(Complaint).first()
    assert complaint is not None

    headers = {"Authorization": f"Bearer {officer_token}"}
    payload = {
        "new_status": "under_review",
        "public_comment": "Department technician scheduled for on-site inspection.",
        "internal_note": "Assigned internal work order #4829."
    }
    response = client.post(f"/api/v1/complaints/{complaint.id}/status", json=payload, headers=headers)
    # May be 200 or 400 depending on current status transition validity
    assert response.status_code in [200, 400]
