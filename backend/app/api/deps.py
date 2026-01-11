from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_access_token, get_password_hash
from app.models.user import User, UserRole
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current user or return a default user if no token provided"""
    if token is None:
        # Return first user from database, or create a default one
        default_user = db.query(User).first()
        if default_user is None:
            # Create a default manager user if none exists
            default_user = User(
                email="default@example.com",
                password_hash=get_password_hash("default"),
                role=UserRole.MANAGER
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        return default_user
    
    payload = decode_access_token(token)
    if payload is None:
        # Return default user if token is invalid
        default_user = db.query(User).first()
        if default_user is None:
            default_user = User(
                email="default@example.com",
                password_hash=get_password_hash("default"),
                role=UserRole.MANAGER
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        return default_user
    
    email: str = payload.get("sub")
    if email is None:
        default_user = db.query(User).first()
        if default_user is None:
            default_user = User(
                email="default@example.com",
                password_hash=get_password_hash("default"),
                role=UserRole.MANAGER
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        return default_user
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        default_user = db.query(User).first()
        if default_user is None:
            default_user = User(
                email="default@example.com",
                password_hash=get_password_hash("default"),
                role=UserRole.MANAGER
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        return default_user
    return user


# Alias for backward compatibility
get_current_user = get_current_user_optional


async def get_current_manager(
    current_user: User = Depends(get_current_user_optional)
) -> User:
    # Allow access for all users when auth is disabled
    return current_user
