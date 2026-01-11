from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_manager
from app.models.user import User
from app.models.audit_attribute import AuditAttribute
from app.schemas.audit_attribute import AuditAttributeCreate, AuditAttributeUpdate, AuditAttributeResponse

router = APIRouter()


@router.get("/", response_model=List[AuditAttributeResponse])
def get_attributes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attributes = db.query(AuditAttribute).offset(skip).limit(limit).all()
    return attributes


@router.get("/{attribute_id}", response_model=AuditAttributeResponse)
def get_attribute(
    attribute_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attribute = db.query(AuditAttribute).filter(AuditAttribute.id == attribute_id).first()
    if not attribute:
        raise HTTPException(status_code=404, detail="Attribute not found")
    return attribute


@router.post("/", response_model=AuditAttributeResponse, status_code=status.HTTP_201_CREATED)
def create_attribute(
    attribute: AuditAttributeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    db_attribute = AuditAttribute(
        name=attribute.name,
        description=attribute.description,
        attribute_type=attribute.attribute_type,
        rule_type=attribute.rule_type,
        rule_parameters=attribute.rule_parameters,
        criteria_text=attribute.criteria_text,
        is_required=attribute.is_required,
        created_by=current_user.id
    )
    db.add(db_attribute)
    db.commit()
    db.refresh(db_attribute)
    return db_attribute


@router.put("/{attribute_id}", response_model=AuditAttributeResponse)
def update_attribute(
    attribute_id: int,
    attribute: AuditAttributeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    db_attribute = db.query(AuditAttribute).filter(AuditAttribute.id == attribute_id).first()
    if not db_attribute:
        raise HTTPException(status_code=404, detail="Attribute not found")
    
    update_data = attribute.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_attribute, field, value)
    
    db.commit()
    db.refresh(db_attribute)
    return db_attribute


@router.delete("/{attribute_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attribute(
    attribute_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_manager)
):
    db_attribute = db.query(AuditAttribute).filter(AuditAttribute.id == attribute_id).first()
    if not db_attribute:
        raise HTTPException(status_code=404, detail="Attribute not found")
    db.delete(db_attribute)
    db.commit()
    return None
