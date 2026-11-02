def test_register_citizen_success(client):
    payload = {
        "email": "newcitizen@test.com",
        "password": "StrongPassword123!",
        "full_name": "Priya Sharma",
        "preferred_language": "hi",
        "phone_number": "9876543210"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newcitizen@test.com"
    assert data["user"]["roles"][0]["role"] == "citizen"


def test_register_duplicate_email(client):
    payload = {
        "email": "citizen@jansahayak.gov.in",
        "password": "Password123!",
        "full_name": "Duplicate User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success(client):
    payload = {
        "email": "citizen@jansahayak.gov.in",
        "password": "CitizenPassword@2026"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "citizen@jansahayak.gov.in"


def test_login_invalid_password(client):
    payload = {
        "email": "citizen@jansahayak.gov.in",
        "password": "WrongPassword!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 401


def test_get_me(client, citizen_token):
    headers = {"Authorization": f"Bearer {citizen_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "citizen@jansahayak.gov.in"
