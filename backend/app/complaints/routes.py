import os
import shutil
from math import ceil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy import select, func, or_, desc
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database import SessionLocal
from app.models import User, Complaint, Support, ProgressUpdate, Resolution, Evidence
from app.schemas.complaint import (
    ComplaintResponse,
    ComplaintDetailResponse,
    PaginatedComplaintResponse,
    SupportResponse,
    ProgressUpdateResponse,
    ResolutionResponse,
    EvidenceResponse,
    StatusUpdateRequest,
    ProgressUpdateRequest,
    SimilarComplaintSchema,
)
from app.services.ai import analyze_complaint_text, find_similar_complaints

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

complaints_router = APIRouter(prefix="/complaints", tags=["Complaints"])
admin_router = APIRouter(prefix="/admin/complaints", tags=["Admin Complaints"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_upload_file(upload_file: UploadFile, subfolder: str = "") -> str:
    target_dir = os.path.join(UPLOAD_DIR, subfolder) if subfolder else UPLOAD_DIR
    os.makedirs(target_dir, exist_ok=True)
    filename = f"{os.urandom(8).hex()}_{upload_file.filename}"
    file_path = os.path.join(target_dir, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    # Return relative URL path for client access
    return f"/uploads/{filename}"


def map_complaint_to_response(complaint: Complaint, all_complaints_for_sim: List[Complaint] = None) -> dict:
    support_count = len(complaint.supports) if complaint.supports else 0
    similar = []
    if all_complaints_for_sim:
        sim_data = find_similar_complaints(complaint.description, all_complaints_for_sim, current_id=complaint.id)
        similar = [SimilarComplaintSchema(**s) for s in sim_data]

    return {
        "id": complaint.id,
        "student_id": complaint.student_id,
        "description": complaint.description,
        "category": complaint.category,
        "priority": complaint.priority,
        "status": complaint.status,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
        "support_count": support_count,
        "student_email": complaint.student.email if complaint.student else None,
        "ai_category": complaint.category,
        "ai_priority": complaint.priority,
        "similarity_matches": similar,
    }


# ==========================================
# Student & Public Complaints Endpoints
# ==========================================

@complaints_router.get("", response_model=PaginatedComplaintResponse)
def list_complaints(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = select(Complaint)

    if category:
        query = query.where(Complaint.category == category)
    if priority:
        query = query.where(Complaint.priority == priority)
    if status:
        query = query.where(Complaint.status == status)
    if search:
        query = query.where(Complaint.description.ilike(f"%{search}%"))

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0

    # Paginate
    offset = (page - 1) * limit
    complaints = db.scalars(
        query.order_by(desc(Complaint.created_at)).offset(offset).limit(limit)
    ).all()

    # Get sample for similarity
    all_complaints = db.scalars(select(Complaint).limit(50)).all()

    items = [map_complaint_to_response(c, all_complaints) for c in complaints]
    total_pages = ceil(total / limit) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


@complaints_router.get("/{complaint_id}", response_model=ComplaintDetailResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.scalar(select(Complaint).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Complaint not found"},
        )

    all_complaints = db.scalars(select(Complaint).limit(50)).all()
    base_data = map_complaint_to_response(complaint, all_complaints)

    # Build supports
    supports = []
    for s in complaint.supports:
        ev_list = [
            EvidenceResponse(
                id=e.id,
                complaint_id=e.complaint_id,
                support_id=e.support_id,
                resolution_id=e.resolution_id,
                file_name=e.file_name,
                file_path=e.file_path,
                file_type=e.file_type,
                uploaded_at=e.uploaded_at,
            )
            for e in s.evidence
        ]
        supports.append(
            SupportResponse(
                id=s.id,
                complaint_id=s.complaint_id,
                student_id=s.student_id,
                comment=s.comment,
                created_at=s.created_at,
                student_email=s.student.email if s.student else None,
                evidence=ev_list,
            )
        )

    # Build progress updates
    progress_updates = [
        ProgressUpdateResponse(
            id=p.id,
            complaint_id=p.complaint_id,
            admin_id=p.admin_id,
            message=p.message,
            created_at=p.created_at,
            admin_email=p.admin.email if p.admin else None,
        )
        for p in complaint.progress_updates
    ]

    # Build resolution
    resolution = None
    if complaint.resolution:
        res_ev = [
            EvidenceResponse(
                id=e.id,
                complaint_id=e.complaint_id,
                support_id=e.support_id,
                resolution_id=e.resolution_id,
                file_name=e.file_name,
                file_path=e.file_path,
                file_type=e.file_type,
                uploaded_at=e.uploaded_at,
            )
            for e in complaint.resolution.evidence
        ]
        resolution = ResolutionResponse(
            id=complaint.resolution.id,
            complaint_id=complaint.resolution.complaint_id,
            admin_id=complaint.resolution.admin_id,
            resolution_text=complaint.resolution.resolution_text,
            resolved_at=complaint.resolution.resolved_at,
            admin_email=complaint.resolution.admin.email if complaint.resolution.admin else None,
            evidence=res_ev,
        )

    return {
        **base_data,
        "supports": supports,
        "progress_updates": progress_updates,
        "resolution": resolution,
    }


@complaints_router.post("", status_code=201)
def create_complaint(
    description: str = Form(...),
    evidence_files: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not description.strip():
        raise HTTPException(
            status_code=400,
            detail={"code": "BAD_REQUEST", "message": "Description cannot be empty"},
        )

    # AI auto-classification
    category, priority = analyze_complaint_text(description)

    complaint = Complaint(
        student_id=current_user.id,
        description=description.strip(),
        category=category,
        priority=priority,
        status="PENDING",
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Process evidence files if any
    if evidence_files:
        for f in evidence_files:
            if f and f.filename:
                rel_path = save_upload_file(f)
                evidence = Evidence(
                    complaint_id=complaint.id,
                    file_name=f.filename,
                    file_path=rel_path,
                    file_type=f.content_type or "application/octet-stream",
                )
                db.add(evidence)
        db.commit()
        db.refresh(complaint)

    return map_complaint_to_response(complaint)


@complaints_router.post("/{complaint_id}/support", status_code=201)
def support_complaint(
    complaint_id: int,
    comment: Optional[str] = Form(None),
    evidence_files: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    complaint = db.scalar(select(Complaint).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Complaint not found"},
        )

    # Check if student already supported
    existing_support = db.scalar(
        select(Support).where(
            Support.complaint_id == complaint_id,
            Support.student_id == current_user.id,
        )
    )
    if existing_support:
        raise HTTPException(
            status_code=400,
            detail={"code": "ALREADY_SUPPORTED", "message": "You have already supported this complaint"},
        )

    support = Support(
        complaint_id=complaint_id,
        student_id=current_user.id,
        comment=comment.strip() if comment else None,
    )
    db.add(support)
    db.commit()
    db.refresh(support)

    if evidence_files:
        for f in evidence_files:
            if f and f.filename:
                rel_path = save_upload_file(f)
                evidence = Evidence(
                    support_id=support.id,
                    file_name=f.filename,
                    file_path=rel_path,
                    file_type=f.content_type or "application/octet-stream",
                )
                db.add(evidence)
        db.commit()

    return {"status": "success", "message": "Support added successfully"}


# ==========================================
# Admin Complaints Endpoints
# ==========================================

def verify_admin(current_user: User):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "FORBIDDEN", "message": "Admin privileges required"},
        )


@admin_router.post("/{complaint_id}/assign")
def assign_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_admin(current_user)
    complaint = db.scalar(select(Complaint).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Complaint not found"},
        )

    complaint.status = "ASSIGNED"
    db.commit()
    db.refresh(complaint)
    return map_complaint_to_response(complaint)


@admin_router.patch("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    request: StatusUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_admin(current_user)
    valid_statuses = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]
    new_status = request.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail={"code": "INVALID_STATUS", "message": f"Status must be one of {valid_statuses}"},
        )

    complaint = db.scalar(select(Complaint).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Complaint not found"},
        )

    complaint.status = new_status
    db.commit()
    db.refresh(complaint)
    return map_complaint_to_response(complaint)


@admin_router.post("/{complaint_id}/progress")
def add_progress_update(
    complaint_id: int,
    request: ProgressUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_admin(current_user)
    complaint = db.scalar(select(Complaint).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Complaint not found"},
        )

    update = ProgressUpdate(
        complaint_id=complaint_id,
        admin_id=current_user.id,
        message=request.message.strip(),
    )
    db.add(update)
    db.commit()
    db.refresh(update)
    return {
        "id": update.id,
        "complaint_id": update.complaint_id,
        "admin_id": update.admin_id,
        "message": update.message,
        "created_at": update.created_at,
        "admin_email": current_user.email,
    }


@admin_router.post("/{complaint_id}/resolve")
def resolve_complaint(
    complaint_id: int,
    resolution_text: str = Form(...),
    evidence_files: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_admin(current_user)
    complaint = db.scalar(select(Complaint).where(Complaint.id == complaint_id))
    if not complaint:
        raise HTTPException(
            status_code=404,
            detail={"code": "NOT_FOUND", "message": "Complaint not found"},
        )

    complaint.status = "RESOLVED"

    resolution = db.scalar(select(Resolution).where(Resolution.complaint_id == complaint_id))
    if not resolution:
        resolution = Resolution(
            complaint_id=complaint_id,
            admin_id=current_user.id,
            resolution_text=resolution_text.strip(),
        )
        db.add(resolution)
    else:
        resolution.admin_id = current_user.id
        resolution.resolution_text = resolution_text.strip()

    db.commit()
    db.refresh(resolution)

    if evidence_files:
        for f in evidence_files:
            if f and f.filename:
                rel_path = save_upload_file(f)
                evidence = Evidence(
                    resolution_id=resolution.id,
                    file_name=f.filename,
                    file_path=rel_path,
                    file_type=f.content_type or "application/octet-stream",
                )
                db.add(evidence)
        db.commit()

    return map_complaint_to_response(complaint)
