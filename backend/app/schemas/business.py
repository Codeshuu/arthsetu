import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, Field


class BusinessBase(BaseModel):
    """Base fields for business profile."""
    trade_name: str = Field(..., min_length=1, max_length=255, description="Operating trade name of the business")
    category: str = Field(..., min_length=1, max_length=100, description="Business category (e.g. Kirana, Retail, Food, Services)")
    business_type: str = Field(..., min_length=1, max_length=100, description="Entity type (e.g. Sole Proprietorship, Partnership)")
    operating_days: Union[List[str], Dict[str, Any]] = Field(
        default_factory=list,
        description="Weekly operating schedule or business days list",
    )


class BusinessCreate(BusinessBase):
    """
    Schema for creating a business profile.
    Explicitly forbids client injection of ownership or database-generated attributes.
    """
    model_config = ConfigDict(extra="ignore")


class BusinessUpdate(BaseModel):
    """
    Schema for partial updates to a business profile.
    Only allows modifying editable profile fields.
    """
    trade_name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    business_type: Optional[str] = Field(None, min_length=1, max_length=100)
    operating_days: Optional[Union[List[str], Dict[str, Any]]] = None

    model_config = ConfigDict(extra="ignore")


class BusinessResponse(BaseModel):
    """
    Public response schema for business profile.
    Serializes from SQLAlchemy Business model.
    """
    id: uuid.UUID
    owner_user_id: uuid.UUID
    trade_name: str
    category: str
    business_type: str
    operating_days: Any
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
