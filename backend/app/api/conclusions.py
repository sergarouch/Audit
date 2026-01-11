from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.conclusion import Conclusion
from app.schemas.conclusion import ConclusionResponse

router = APIRouter()


@router.get("/{conclusion_id}", response_model=ConclusionResponse)
def get_conclusion(
    conclusion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conclusion = db.query(Conclusion).filter(Conclusion.id == conclusion_id).first()
    if not conclusion:
        raise HTTPException(status_code=404, detail="Conclusion not found")
    return conclusion


@router.get("/work-papers/{work_paper_id}/conclusion", response_model=ConclusionResponse)
def get_conclusion_by_work_paper(
    work_paper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conclusion = db.query(Conclusion).filter(Conclusion.work_paper_id == work_paper_id).first()
    if not conclusion:
        raise HTTPException(status_code=404, detail="Conclusion not found for this work paper")
    return conclusion
