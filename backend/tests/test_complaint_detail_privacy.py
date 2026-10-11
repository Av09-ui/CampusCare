from uuid import uuid4

from fastapi.testclient import TestClient

from app.auth.security import create_access_token, hash_password
from app.database import SessionLocal
from app.main import app
from app.models import User


client = TestClient(app)


def register_student(prefix: str) -> tuple[str, dict]:
    email = f"{prefix}-{uuid4().hex}@college.edu"
    response = client.post(
        "/api/auth/register",
        json={"email": email, "password": "TestPassword123"},
    )
    assert response.status_code == 201
    data = response.json()
    return data["access_token"], data["user"]


def create_complaint_with_evidence(token: str) -> dict:
    response = client.post(
        "/api/complaints",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "title": "Broken corridor lights",
            "description": "The corridor lights near the library are not working.",
        },
        files={"evidence_files": ("lights.jpg", b"campus-photo", "image/jpeg")},
    )
    assert response.status_code == 201
    return response.json()


def create_admin() -> tuple[str, User]:
    db = SessionLocal()
    try:
        admin = User(
            email=f"admin-{uuid4().hex}@college.edu",
            password_hash=hash_password("AdminPassword123"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return create_access_token(admin.id, admin.role), admin
    finally:
        db.close()


def test_detail_requires_authentication_and_hides_student_identity():
    owner_token, owner = register_student("owner")
    complaint = create_complaint_with_evidence(owner_token)
    complaint_id = complaint["id"]

    assert client.get(f"/api/complaints/{complaint_id}").status_code == 401

    owner_detail = client.get(
        f"/api/complaints/{complaint_id}",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert owner_detail.status_code == 200
    owner_data = owner_detail.json()
    assert owner_data["is_owner"] is True
    assert owner_data["student_id"] == owner["id"]
    assert owner_data["student_email"] is None

    other_token, _ = register_student("other")
    other_detail = client.get(
        f"/api/complaints/{complaint_id}",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert other_detail.status_code == 200
    other_data = other_detail.json()
    assert other_data["is_owner"] is False
    assert other_data["student_id"] is None
    assert other_data["student_email"] is None
    assert other_data["supports"] == []
    assert other_data["evidence"][0]["file_path"] == f"/api/complaints/evidence/{complaint['evidence'][0]['id']}"


def test_evidence_access_obeys_complaint_and_support_privacy():
    owner_token, _ = register_student("owner")
    complaint = create_complaint_with_evidence(owner_token)
    complaint_id = complaint["id"]
    public_evidence_id = complaint["evidence"][0]["id"]

    supporter_token, _ = register_student("supporter")
    support_response = client.post(
        f"/api/complaints/{complaint_id}/support",
        headers={"Authorization": f"Bearer {supporter_token}"},
        data={"comment": "I have the same issue."},
        files={"evidence_files": ("support.jpg", b"private-support-photo", "image/jpeg")},
    )
    assert support_response.status_code == 201

    admin_token, _ = create_admin()
    admin_detail = client.get(
        f"/api/complaints/{complaint_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_detail.status_code == 200
    admin_data = admin_detail.json()
    assert len(admin_data["supports"]) == 1
    assert admin_data["supports"][0]["student_email"] is not None
    support_evidence_id = admin_data["supports"][0]["evidence"][0]["id"]

    viewer_token, _ = register_student("viewer")
    assert client.get(f"/api/complaints/evidence/{public_evidence_id}").status_code == 401
    assert client.get("/uploads/anything.jpg").status_code == 404
    assert client.get(
        f"/api/complaints/evidence/{public_evidence_id}",
        headers={"Authorization": f"Bearer {viewer_token}"},
    ).status_code == 200
    assert client.get(
        f"/api/complaints/evidence/{support_evidence_id}",
        headers={"Authorization": f"Bearer {viewer_token}"},
    ).status_code == 403
    assert client.get(
        f"/api/complaints/evidence/{support_evidence_id}",
        headers={"Authorization": f"Bearer {supporter_token}"},
    ).status_code == 200
    assert client.get(
        f"/api/complaints/evidence/{support_evidence_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    ).status_code == 200
