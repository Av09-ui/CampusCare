from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.authorization import require_admin
from app.auth.dependencies import get_db
from app.models import Complaint, ComplaintStatusHistory, User
from app.schemas.complaint import ComplaintResponse, ComplaintStatusUpdate

router = APIRouter(
    prefix="/admin/complaints",
    tags=["Admin Complaints"],
)


@router.get("", response_model=list[ComplaintResponse])
def list_all_complaints(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    statement = select(Complaint).order_by(Complaint.created_at.desc())
    return list(db.scalars(statement).all())


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    request: ComplaintStatusUpdate,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    complaint = db.get(Complaint, complaint_id)

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found",
        )

    previous_status = complaint.status

    if previous_status == request.status:
        return complaint

    complaint.status = request.status

    history_entry = ComplaintStatusHistory(
        complaint_id=complaint.id,
        changed_by_admin_id=current_admin.id,
        previous_status=previous_status,
        new_status=request.status,
    )

    db.add(history_entry)
    db.commit()
    db.refresh(complaint)

    return complaint
