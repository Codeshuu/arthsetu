import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class UserRegisterRequest(BaseModel):
    """
    Schema for user account registration.
    Privileged fields like is_active are omitted to prevent unauthorized privilege escalation.
    """
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72, description="Password between 6 and 72 characters")
    full_name: Optional[str] = Field(None, max_length=255)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class UserLoginRequest(BaseModel):
    """
    Schema for JSON-based user login.
    """
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=72)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class TokenResponse(BaseModel):
    """
    Schema for returning issued JWT access token.
    """
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """
    Safe public schema for user profile representation.
    Guarantees password_hash is never exposed in API responses.
    """
    id: uuid.UUID
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
