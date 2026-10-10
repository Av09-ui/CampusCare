from datetime import datetime, timezone
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.complaint import Complaint, Support, ProgressUpdate, Resolution, Evidence
from app.auth.security import hash_password
from app.services.ai import analyze_complaint_text


def seed_database():
    # Create all tables in the database
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check / Create Student 1
        student = db.query(User).filter(User.email == "student@college.edu").first()
        if not student:
            student = User(
                email="student@college.edu",
                password_hash=hash_password("password123"),
                role="STUDENT",
                is_active=True,
            )
            db.add(student)
            print("Created student: student@college.edu / password123")
        else:
            print("Student already exists")

        # Check / Create Student 2
        student2 = db.query(User).filter(User.email == "sarah@college.edu").first()
        if not student2:
            student2 = User(
                email="sarah@college.edu",
                password_hash=hash_password("password123"),
                role="STUDENT",
                is_active=True,
            )
            db.add(student2)
            print("Created student: sarah@college.edu / password123")

        # Check / Create Admin
        admin = db.query(User).filter(User.email == "admin@college.edu").first()
        if not admin:
            admin = User(
                email="admin@college.edu",
                password_hash=hash_password("admin1234"),
                role="ADMIN",
                is_active=True,
            )
            db.add(admin)
            print("Created admin: admin@college.edu / admin1234")
        else:
            print("Admin already exists")

        db.commit()
        db.refresh(student)
        db.refresh(admin)

        # Seed sample complaints if table is empty
        existing_complaint_count = db.query(Complaint).count()
        if existing_complaint_count == 0:
            sample_complaints = [
                {
                    "description": "Library 2nd floor air conditioning unit has been leaking water onto study desks and making loud noises.",
                    "student_id": student.id,
                    "status": "IN_PROGRESS",
                    "updates": [
                        "Facilities team inspected the drainage line on Friday.",
                        "Replacement valve ordered, technician scheduled for Monday morning."
                    ],
                    "supports": [
                        {"student_id": student2.id, "comment": "Can confirm, two desks are unusable because of water puddles."}
                    ]
                },
                {
                    "description": "Campus Wi-Fi is continuously disconnecting in Block B lecture halls during programming labs.",
                    "student_id": student.id,
                    "status": "ASSIGNED",
                    "updates": [
                        "IT department assigned ticket #4092 to network infrastructure engineers."
                    ],
                    "supports": [
                        {"student_id": student2.id, "comment": "Affects all of CSE 3rd year classes every afternoon."}
                    ]
                },
                {
                    "description": "Hostel cafeteria served undercooked food and drinking water dispenser has an unusual odor.",
                    "student_id": student2.id,
                    "status": "PENDING",
                    "updates": [],
                    "supports": [
                        {"student_id": student.id, "comment": "Water filters definitely need immediate servicing."}
                    ]
                },
                {
                    "description": "Projector in Room 304 has broken HDMI connection and flickering lamp.",
                    "student_id": student.id,
                    "status": "RESOLVED",
                    "updates": [
                        "Audio/Visual technician tested projector.",
                        "Cable replaced and new lamp fitted."
                    ],
                    "resolution": "Replaced the damaged HDMI cable and fitted a brand new 4000-lumen lamp unit. System verified operational."
                }
            ]

            for sc in sample_complaints:
                cat, pri = analyze_complaint_text(sc["description"])
                comp = Complaint(
                    student_id=sc["student_id"],
                    description=sc["description"],
                    category=cat,
                    priority=pri,
                    status=sc["status"],
                )
                db.add(comp)
                db.commit()
                db.refresh(comp)

                for u_text in sc.get("updates", []):
                    upd = ProgressUpdate(
                        complaint_id=comp.id,
                        admin_id=admin.id,
                        message=u_text,
                    )
                    db.add(upd)

                for sup in sc.get("supports", []):
                    support_obj = Support(
                        complaint_id=comp.id,
                        student_id=sup["student_id"],
                        comment=sup.get("comment"),
                    )
                    db.add(support_obj)

                if "resolution" in sc:
                    res_obj = Resolution(
                        complaint_id=comp.id,
                        admin_id=admin.id,
                        resolution_text=sc["resolution"],
                    )
                    db.add(res_obj)

                db.commit()

            print(f"Seeded {len(sample_complaints)} sample complaints with updates and supports.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
