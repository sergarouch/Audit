from pydantic import BaseModel
from datetime import datetime
from typing import List, Any, Optional


class Finding(BaseModel):
    attribute_id: int
    attribute_name: str
    status: str  # pass, fail, warning
    details: Optional[str] = None
    recommendation: Optional[str] = None


class ConclusionBase(BaseModel):
    work_paper_id: int
    overall_score: float
    compliance_summary: Optional[dict[str, Any]] = None
    findings: List[dict[str, Any]]  # List of Finding dicts (stored as JSON in DB)
    cpa_conclusion_text: str


class ConclusionResponse(ConclusionBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True
