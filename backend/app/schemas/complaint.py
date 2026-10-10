from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class SimilarComplaintSchema(BaseModel):
    id: int
    description: str
    similarity_score: float


class EvidenceResponse(BaseModel):
    id: int
    complaint_id: Optional[int] = None
    support_id: Optional[int] = None
    resolution_id: Optional[int] = None
    file_name: str
    file_path: str
    file_type: str
    uploaded_at: datetime


class SupportResponse(BaseModel):
    id: int
    complaint_id: int
    student_id: int
    comment: Optional[str] = None
    created_at: datetime
    student_email: Optional[str] = None
    evidence: List[EvidenceResponse] = []


class ProgressUpdateResponse(BaseModel):
    id: int
    complaint_id: int
    admin_id: int
    message: str
    created_at: datetime
    admin_email: Optional[str] = None


class ResolutionResponse(BaseModel):
    id: int
    complaint_id: int
    admin_id: int
    resolution_text: str
    resolved_at: datetime
    admin_email: Optional[str] = None
    evidence: List[EvidenceResponse] = []


class ComplaintResponse(BaseModel):
    id: int
    student_id: int
    description: str
    category: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    support_count: int = 0
    student_email: Optional[str] = None
    ai_category: Optional[str] = None
    ai_priority: Optional[str] = None
    similarity_matches: Optional[List[SimilarComplaintSchema]] = None


class ComplaintDetailResponse(ComplaintResponse):
    progress_updates: List[ProgressUpdateResponse] = []
    resolution: Optional[ResolutionResponse] = None
    supports: List[SupportResponse] = []


class PaginatedComplaintResponse(BaseModel):
    items: List[ComplaintResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class StatusUpdateRequest(BaseModel):
    status: str


class ProgressUpdateRequest(BaseModel):
    message: str
