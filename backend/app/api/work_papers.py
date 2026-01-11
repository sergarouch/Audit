from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import uuid
from datetime import datetime
from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.work_paper import WorkPaper, WorkPaperStatus
from app.schemas.work_paper import WorkPaperCreate, WorkPaperResponse

router = APIRouter()


def save_uploaded_file(file: UploadFile, work_paper_id: int) -> str:
    """Save uploaded file and return relative path"""
    file_ext = os.path.splitext(file.filename)[1]
    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {file_ext} not allowed")
    
    # Create directory for work paper
    work_paper_dir = os.path.join(settings.UPLOAD_DIR, str(work_paper_id))
    os.makedirs(work_paper_dir, exist_ok=True)
    
    # Generate unique filename
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(work_paper_dir, filename)
    
    # Save file
    with open(file_path, "wb") as f:
        content = file.file.read()
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")
        f.write(content)
    
    return os.path.join(str(work_paper_id), filename).replace("\\", "/")


@router.post("/", response_model=WorkPaperResponse, status_code=status.HTTP_201_CREATED)
async def create_work_paper(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    form_data: Optional[str] = Form(None),  # JSON string
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Parse form_data if provided
    parsed_form_data = None
    if form_data:
        try:
            parsed_form_data = json.loads(form_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid form_data JSON")
    
    # Create work paper first to get ID
    db_work_paper = WorkPaper(
        title=title,
        description=description,
        form_data=parsed_form_data,
        submitted_by=current_user.id,
        status=WorkPaperStatus.PENDING
    )
    db.add(db_work_paper)
    db.commit()
    db.refresh(db_work_paper)
    
    # Save uploaded files
    file_paths = []
    for file in files:
        if file.filename:
            file_path = save_uploaded_file(file, db_work_paper.id)
            file_paths.append(file_path)
    
    # Update work paper with file paths
    if file_paths:
        db_work_paper.file_paths = file_paths
        db.commit()
        db.refresh(db_work_paper)
    
    return db_work_paper


@router.get("/", response_model=List[WorkPaperResponse])
def get_work_papers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work_papers = db.query(WorkPaper).offset(skip).limit(limit).all()
    return work_papers


@router.get("/{work_paper_id}", response_model=WorkPaperResponse)
def get_work_paper(
    work_paper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work_paper = db.query(WorkPaper).filter(WorkPaper.id == work_paper_id).first()
    if not work_paper:
        raise HTTPException(status_code=404, detail="Work paper not found")
    return work_paper


@router.post("/{work_paper_id}/audit", response_model=WorkPaperResponse)
def trigger_audit(
    work_paper_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger audit for a work paper - generates conclusion"""
    from app.models.conclusion import Conclusion
    from app.services.audit_engine import AuditEngine
    from app.services.conclusion_generator import ConclusionGenerator
    
    # Get work paper
    work_paper = db.query(WorkPaper).filter(WorkPaper.id == work_paper_id).first()
    if not work_paper:
        raise HTTPException(status_code=404, detail="Work paper not found")
    
    # Check if conclusion already exists
    existing_conclusion = db.query(Conclusion).filter(Conclusion.work_paper_id == work_paper_id).first()
    if existing_conclusion:
        # Update existing conclusion
        db.delete(existing_conclusion)
        db.commit()
    
    # Run audit
    audit_engine = AuditEngine(db)
    audit_results = audit_engine.audit_work_paper(work_paper_id)
    
    # Generate conclusion
    conclusion_generator = ConclusionGenerator(db)
    conclusion_data = conclusion_generator.generate_conclusion(work_paper_id, audit_results)
    
    # Create conclusion record
    db_conclusion = Conclusion(
        work_paper_id=work_paper_id,
        overall_score=conclusion_data["overall_score"],
        compliance_summary=conclusion_data["compliance_summary"],
        findings=conclusion_data["findings"],
        cpa_conclusion_text=conclusion_data["cpa_conclusion_text"]
    )
    db.add(db_conclusion)
    
    # Update work paper status
    work_paper.status = WorkPaperStatus.AUDITED
    db.commit()
    db.refresh(work_paper)
    
    return work_paper
