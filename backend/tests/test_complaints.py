from uuid import uuid4

from fastapi.testclient import TestClient

from app.auth.security import create_access_token, hash_password
from app.database import SessionLocal
from app.main import app
from app.models import Complaint, ComplaintStatusHistory, User

client = TestClient(app)


def unique_email(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}@college.edu"


def register_and_login_student() -> tuple[str, dict]:
    email = unique_email("complaint-student")
    password = "TestPassword123"

    register_response = client.post(
        "/api/auth/register",
        json={"email": email, "password": password},
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200

    data = login_response.json()
    return data["access_token"], data["user"]


def test_student_can_create_complaint():
    token, user = register_and_login_student()

    response = client.post(
        "/api/complaints",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Broken classroom fan",
            "description": "The ceiling fan in classroom 204 is not working.",
        },
    )

    assert response.status_code == 201
    data = response.json()

    assert data["student_id"] == user["id"]
    assert data["title"] == "Broken classroom fan"
    assert data["category"] == "UNCATEGORIZED"
    assert data["priority"] == "MEDIUM"
    assert data["status"] == "SUBMITTED"

    db = SessionLocal()
    try:
        saved = db.get(Complaint, data["id"])
        assert saved is not None
        assert saved.student_id == user["id"]
    finally:
        if "data" in locals() and "id" in data:
            saved = db.get(Complaint, data["id"])
            if saved is not None:
                db.delete(saved)
                db.commit()
        db.close()


def test_complaint_creation_requires_authentication():
    response = client.post(
        "/api/complaints",
        json={
            "title": "Broken classroom fan",
            "description": "The ceiling fan in classroom 204 is not working.",
        },
    )

    assert response.status_code == 401


def test_admin_cannot_create_student_complaint():
    db = SessionLocal()
    admin = None

    try:
        admin = User(
            email=unique_email("complaint-admin"),
            password_hash=hash_password("AdminTestPassword123"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        token = create_access_token(
            user_id=admin.id,
            role=admin.role,
        )

        response = client.post(
            "/api/complaints",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "title": "Broken classroom fan",
                "description": "The ceiling fan in classroom 204 is not working.",
            },
        )

        assert response.status_code == 403

    finally:
        if admin is not None:
            db.rollback()
            saved_admin = db.get(User, admin.id)
            if saved_admin is not None:
                db.delete(saved_admin)
                db.commit()
        db.close()



def test_student_can_list_only_their_own_complaints():
    student_one_token, student_one = register_and_login_student()
    student_two_token, student_two = register_and_login_student()

    complaint_title = f"My classroom issue {uuid4().hex[:8]}"

    create_response = client.post(
        "/api/complaints",
        headers={"Authorization": f"Bearer {student_one_token}"},
        json={
            "title": complaint_title,
            "description": "The classroom projector is not working.",
        },
    )

    assert create_response.status_code == 201

    response_one = client.get(
        "/api/complaints",
        headers={"Authorization": f"Bearer {student_one_token}"},
    )

    assert response_one.status_code == 200
    assert any(
        item["title"] == complaint_title
        for item in response_one.json()
    )
    assert all(
        item["student_id"] == student_one["id"]
        for item in response_one.json()
    )

    response_two = client.get(
        "/api/complaints",
        headers={"Authorization": f"Bearer {student_two_token}"},
    )

    assert response_two.status_code == 200
    assert all(
        item["student_id"] == student_two["id"]
        for item in response_two.json()
    )
    assert all(
        item["title"] != complaint_title
        for item in response_two.json()
    )


def test_complaint_listing_requires_authentication():
    response = client.get("/api/complaints")

    assert response.status_code == 401


def test_admin_can_list_all_complaints():
    email = unique_email("admin-list")
    db = SessionLocal()

    try:
        admin = User(
            email=email,
            password_hash=hash_password("AdminPassword123"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)

        admin_id = admin.id
        token = create_access_token(admin_id, "ADMIN")
    finally:
        db.close()

    response = client.get(
        "/api/admin/complaints",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)

    db = SessionLocal()
    try:
        saved_admin = db.get(User, admin_id)
        if saved_admin is not None:
            db.delete(saved_admin)
            db.commit()
    finally:
        db.close()


def test_student_cannot_access_admin_complaints():
    token, _ = register_and_login_student()

    response = client.get(
        "/api/admin/complaints",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403


def test_admin_can_update_complaint_status():
    student_token, student = register_and_login_student()

    created = client.post(
        "/api/complaints",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "title": "Broken classroom projector",
            "description": "The projector in classroom 204 is not working.",
        },
    )
    assert created.status_code == 201
    complaint_id = created.json()["id"]

    db = SessionLocal()
    try:
        admin = User(
            email=unique_email("status-admin"),
            password_hash=hash_password("AdminPassword123"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        admin_id = admin.id
        admin_token = create_access_token(admin_id, "ADMIN")
    finally:
        db.close()

    try:
        response = client.patch(
            f"/api/admin/complaints/{complaint_id}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "IN_PROGRESS"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "IN_PROGRESS"
        assert response.json()["student_id"] == student["id"]
    finally:
        db = SessionLocal()
        try:
            from sqlalchemy import delete
            from app.models import ComplaintStatusHistory

            db.execute(
                delete(ComplaintStatusHistory).where(
                    ComplaintStatusHistory.changed_by_admin_id == admin_id
                )
            )

            admin = db.get(User, admin_id)
            if admin is not None:
                db.delete(admin)
            db.commit()
        finally:
            db.close()


def test_student_cannot_update_complaint_status():
    token, _ = register_and_login_student()

    response = client.patch(
        "/api/admin/complaints/999999/status",
        headers={"Authorization": f"Bearer {token}"},
        json={"status": "RESOLVED"},
    )
    assert response.status_code == 403


def test_admin_status_update_records_history():
    student_token, _ = register_and_login_student()

    created = client.post(
        "/api/complaints",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "title": "History verification complaint",
            "description": "Checking that status changes are recorded.",
        },
    )
    assert created.status_code == 201
    complaint_id = created.json()["id"]

    db = SessionLocal()
    admin_id = None

    try:
        admin = User(
            email=unique_email("history-admin"),
            password_hash=hash_password("AdminPassword123"),
            role="ADMIN",
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        admin_id = admin.id
        admin_token = create_access_token(admin.id, "ADMIN")

        response = client.patch(
            f"/api/admin/complaints/{complaint_id}/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "IN_PROGRESS"},
        )
        assert response.status_code == 200

        history = db.query(ComplaintStatusHistory).filter_by(
            complaint_id=complaint_id,
            changed_by_admin_id=admin_id,
        ).one()

        assert history.previous_status == "SUBMITTED"
        assert history.new_status == "IN_PROGRESS"
        assert history.changed_at is not None
    finally:
        try:
            if admin_id is not None:
                db.query(ComplaintStatusHistory).filter_by(
                    changed_by_admin_id=admin_id
                ).delete(synchronize_session=False)

                admin = db.get(User, admin_id)
                if admin is not None:
                    db.delete(admin)

                db.commit()
        finally:
            db.close()

