from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class WorkPaperStatus(str, enum.Enum):
    PENDING = "pending"
    AUDITED = "audited"


class WorkPaper(Base):
    __tablename__ = "work_papers"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    submitted_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    form_data = Column(JSON, nullable=True)  # Structured form fields
    file_paths = Column(JSON, nullable=True)  # Array of file paths
    status = Column(SQLEnum(WorkPaperStatus), default=WorkPaperStatus.PENDING)

    # Relationships
    submitter = relationship("User", back_populates="submitted_work_papers")
    conclusion = relationship("Conclusion", back_populates="work_paper", uselist=False)
