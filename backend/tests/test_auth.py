from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_student_login_success():
    email = "login-test@college.edu"
    password = "TestPassword123"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert login_response.status_code == 200

    data = login_response.json()

    assert data["email"] == email
    assert data["role"] == "STUDENT"
    assert "password" not in data
    assert "password_hash" not in data


def test_student_login_wrong_password():
    email = "wrong-password@college.edu"
    password = "TestPassword123"

    register_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
        },
    )

    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": "WrongPassword",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid email or password"


def test_student_login_unknown_email():
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "does-not-exist@college.edu",
            "password": "TestPassword123",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid email or password"
