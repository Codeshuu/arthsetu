import uuid
from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.source import Source
    from app.models.reconciliation import Reconciliation
    from app.models.passport import Passport


class User(Base):
    """
    User model for authentication and access control.
    """
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    full_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Synonym for backwards-compatibility with Phase 3 services
    hashed_password = synonym("password_hash")

    # Relationships
    businesses: Mapped[List["Business"]] = relationship(
        "Business", back_populates="owner", cascade="all, delete-orphan"
    )
    submitted_sources: Mapped[List["Source"]] = relationship(
        "Source", foreign_keys="Source.submitted_by", back_populates="submitter"
    )
    resolved_reconciliations: Mapped[List["Reconciliation"]] = relationship(
        "Reconciliation", foreign_keys="Reconciliation.resolved_by_user_id", back_populates="resolved_by"
    )
    generated_passports: Mapped[List["Passport"]] = relationship(
        "Passport", foreign_keys="Passport.generated_by", back_populates="generator"
    )

    def __init__(self, **kwargs):
        if "hashed_password" in kwargs and "password_hash" not in kwargs:
            kwargs["password_hash"] = kwargs.pop("hashed_password")
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        super().__init__(**kwargs)
