from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, default="Untitled complaint")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="UNCATEGORIZED")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="SUBMITTED")
    assigned_admin_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    student = relationship("User", foreign_keys=[student_id])
    supports = relationship("Support", back_populates="complaint", cascade="all, delete-orphan", order_by="Support.created_at.desc()")
    progress_updates = relationship("ProgressUpdate", back_populates="complaint", cascade="all, delete-orphan", order_by="ProgressUpdate.created_at.desc()")
    resolution = relationship("Resolution", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    evidence = relationship("Evidence", back_populates="complaint", cascade="all, delete-orphan")


class Support(Base):
    __tablename__ = "supports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    student = relationship("User", foreign_keys=[student_id])
    complaint = relationship("Complaint", back_populates="supports")
    evidence = relationship("Evidence", back_populates="support", cascade="all, delete-orphan")


class ProgressUpdate(Base):
    __tablename__ = "progress_updates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"), nullable=False)
    admin_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    admin = relationship("User", foreign_keys=[admin_id])
    complaint = relationship("Complaint", back_populates="progress_updates")


class Resolution(Base):
    __tablename__ = "resolutions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    complaint_id: Mapped[int] = mapped_column(ForeignKey("complaints.id"), unique=True, nullable=False)
    admin_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    resolution_text: Mapped[str] = mapped_column(Text, nullable=False)
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    admin = relationship("User", foreign_keys=[admin_id])
    complaint = relationship("Complaint", back_populates="resolution")
    evidence = relationship("Evidence", back_populates="resolution", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    complaint_id: Mapped[Optional[int]] = mapped_column(ForeignKey("complaints.id"), nullable=True)
    support_id: Mapped[Optional[int]] = mapped_column(ForeignKey("supports.id"), nullable=True)
    resolution_id: Mapped[Optional[int]] = mapped_column(ForeignKey("resolutions.id"), nullable=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    complaint = relationship("Complaint", back_populates="evidence")
    support = relationship("Support", back_populates="evidence")
    resolution = relationship("Resolution", back_populates="evidence")
