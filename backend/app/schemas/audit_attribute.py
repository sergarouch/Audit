from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
from app.models.audit_attribute import AttributeType, RuleType


class AuditAttributeBase(BaseModel):
    name: str
    description: Optional[str] = None
    attribute_type: AttributeType


class ValidationRuleCreate(BaseModel):
    rule_type: RuleType
    rule_parameters: dict[str, Any]  # e.g., {"field": "balance", "operator": ">", "value": 0}


class ChecklistCriteriaCreate(BaseModel):
    criteria_text: str
    is_required: bool = True


class AuditAttributeCreate(AuditAttributeBase):
    rule_type: Optional[RuleType] = None
    rule_parameters: Optional[dict[str, Any]] = None
    criteria_text: Optional[str] = None
    is_required: Optional[bool] = True


class AuditAttributeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    attribute_type: Optional[AttributeType] = None
    rule_type: Optional[RuleType] = None
    rule_parameters: Optional[dict[str, Any]] = None
    criteria_text: Optional[str] = None
    is_required: Optional[bool] = None


class AuditAttributeResponse(AuditAttributeBase):
    id: int
    rule_type: Optional[RuleType] = None
    rule_parameters: Optional[dict[str, Any]] = None
    criteria_text: Optional[str] = None
    is_required: Optional[bool] = None
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True
