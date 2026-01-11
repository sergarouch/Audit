from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.core.database import Base


class AttributeType(str, enum.Enum):
    VALIDATION_RULE = "validation_rule"
    CHECKLIST_CRITERIA = "checklist_criteria"


class RuleType(str, enum.Enum):
    THRESHOLD = "threshold"
    DATE_RANGE = "date_range"
    REQUIRED_FIELD = "required_field"
    FORMAT_VALIDATION = "format_validation"


class AuditAttribute(Base):
    __tablename__ = "audit_attributes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    attribute_type = Column(SQLEnum(AttributeType), nullable=False)
    
    # For validation rules
    rule_type = Column(SQLEnum(RuleType), nullable=True)
    rule_parameters = Column(JSON, nullable=True)  # e.g., {"field": "balance", "operator": ">", "value": 0}
    
    # For checklist criteria
    criteria_text = Column(String, nullable=True)
    is_required = Column(Boolean, default=True)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="created_attributes", foreign_keys=[created_by])
