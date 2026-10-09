from pydantic import BaseModel, ConfigDict, Field


class ComplaintCreate(BaseModel):
    title: str = Field(min_length=5, max_length=200)
    description: str = Field(min_length=10, max_length=5000)


class ComplaintResponse(BaseModel):
    id: int
    student_id: int
    title: str
    description: str
    category: str
    priority: str
    status: str

    model_config = ConfigDict(from_attributes=True)


from typing import Literal


class ComplaintStatusUpdate(BaseModel):
    status: Literal["SUBMITTED", "IN_PROGRESS", "RESOLVED"]
