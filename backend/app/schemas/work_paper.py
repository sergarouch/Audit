from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, List
from app.models.work_paper import WorkPaperStatus


class WorkPaperBase(BaseModel):
    title: str
    description: Optional[str] = None


class WorkPaperCreate(WorkPaperBase):
    form_data: Optional[dict[str, Any]] = None
    file_paths: Optional[List[str]] = None


class WorkPaperResponse(WorkPaperBase):
    id: int
    submitted_by: int
    submitted_at: datetime
    form_data: Optional[dict[str, Any]] = None
    file_paths: Optional[List[str]] = None
    status: WorkPaperStatus

    class Config:
        from_attributes = True
