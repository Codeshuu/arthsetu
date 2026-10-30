import uuid
import jwt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User
from app.models.business import Business

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


def get_current_user(
    token: str = Depends(reusable_oauth2),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency to extract and authenticate the current user from the Bearer JWT token.
    Enforces token validity, signature verification, expiration, user existence, and active account status.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = decode_access_token(token)
        user_id_str: str = payload.get("sub")
        if not user_id_str:
            raise credentials_exception
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id_str).first()
    if not user:
        try:
            user = db.get(User, uuid.UUID(user_id_str))
        except (ValueError, AttributeError):
            pass

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def verify_business_access(
    business_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Business:
    """
    Verifies that the requested business exists and is owned by the authenticated current_user.
    Prevents cross-tenant data access.
    """
    business = db.query(Business).filter(Business.id == business_id).first()
    if not business:
        try:
            business = db.get(Business, uuid.UUID(str(business_id)))
        except (ValueError, AttributeError):
            pass

    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "BUSINESS_NOT_FOUND", "message": "Business entity not found"},
        )

    if str(business.owner_user_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "RESOURCE_FORBIDDEN", "message": "You do not own this business entity"},
        )

    return business
