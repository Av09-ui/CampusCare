from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.database import SessionLocal
from app.models import User
from app.schemas.auth import LoginRequest, StudentRegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register", status_code=201)
def register_student(
    request: StudentRegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.scalar(
        select(User).where(User.email == request.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email is already registered",
        )

    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        role="STUDENT",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }


@router.post("/login")
def login_student(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(User.email == request.email)
    )

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
    }
