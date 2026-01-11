from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Conclusion(Base):
    __tablename__ = "conclusions"

    id = Column(Integer, primary_key=True, index=True)
    work_paper_id = Column(Integer, ForeignKey("work_papers.id"), unique=True, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    overall_score = Column(Float, nullable=False)  # Percentage 0-100
    compliance_summary = Column(JSON, nullable=True)
    findings = Column(JSON, nullable=False)  # Array of findings
    cpa_conclusion_text = Column(String, nullable=False)

    # Relationships
    work_paper = relationship("WorkPaper", back_populates="conclusion")


