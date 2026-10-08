from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}@college.edu"


def test_student_registration():
    email = unique_email("newstudent")

    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 201
    data = response.json()

    assert data["email"] == email
    assert data["role"] == "STUDENT"
    assert "password" not in data
    assert "password_hash" not in data


def test_duplicate_student_registration():
    email = unique_email("duplicate")

    first_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "TestPassword123",
        },
    )

    assert first_response.status_code == 201

    second_response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": "TestPassword123",
        },
    )

    assert second_response.status_code == 409
    assert second_response.json()["detail"] == "Email is already registered"


def test_student_login_success():
    email = unique_email("login-test")
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

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == email
    assert data["user"]["role"] == "STUDENT"


def test_student_login_wrong_password():
    email = unique_email("wrong-password")
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
            "password": "WrongPassword123",
        },
    )

    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Invalid email or password"
