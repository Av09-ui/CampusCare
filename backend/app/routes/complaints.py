from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.authorization import require_student
from app.auth.dependencies import get_db
from app.models import Complaint, User
from app.schemas.complaint import ComplaintCreate, ComplaintResponse

router = APIRouter(prefix="/complaints", tags=["Complaints"])


@router.post("", response_model=ComplaintResponse, status_code=201)
def create_complaint(
    request: ComplaintCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    complaint = Complaint(
        student_id=current_user.id,
        title=request.title.strip(),
        description=request.description.strip(),
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return complaint


@router.get("", response_model=list[ComplaintResponse])
def list_my_complaints(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    statement = (
        select(Complaint)
        .where(Complaint.student_id == current_user.id)
        .order_by(Complaint.created_at.desc())
    )

    return list(db.scalars(statement).all())
