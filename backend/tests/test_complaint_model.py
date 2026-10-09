from uuid import uuid4

from sqlalchemy import select

from app.auth.security import hash_password
from app.database import SessionLocal
from app.models import Complaint, User


def test_complaint_creation_and_retrieval():
    db = SessionLocal()
    student = None
    complaint = None

    try:
        student = User(
            email=f"complaint-test-{uuid4().hex}@college.edu",
            password_hash=hash_password("TestPassword123"),
            role="STUDENT",
        )
        db.add(student)
        db.flush()

        complaint = Complaint(
            student_id=student.id,
            title="Broken classroom fan",
            description="The fan in classroom 204 is not working.",
        )
        db.add(complaint)
        db.commit()

        complaint_id = complaint.id
        student_id = student.id

        saved_complaint = db.scalar(
            select(Complaint).where(Complaint.id == complaint_id)
        )

        assert saved_complaint is not None
        assert saved_complaint.student_id == student_id
        assert saved_complaint.title == "Broken classroom fan"
        assert saved_complaint.category == "UNCATEGORIZED"
        assert saved_complaint.priority == "MEDIUM"
        assert saved_complaint.status == "SUBMITTED"
        assert saved_complaint.created_at is not None
        assert saved_complaint.updated_at is not None

    finally:
        try:
            db.rollback()

            if complaint is not None and complaint.id is not None:
                saved_complaint = db.get(Complaint, complaint.id)
                if saved_complaint is not None:
                    db.delete(saved_complaint)
                    db.flush()

            if student is not None and student.id is not None:
                saved_student = db.get(User, student.id)
                if saved_student is not None:
                    db.delete(saved_student)

            db.commit()
        finally:
            db.close()
