import uuid
from datetime import datetime, date
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, Date, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.source import Source
    from app.models.import_batch import ImportBatch
    from app.models.transaction import Transaction
    from app.models.reconciliation import Reconciliation
    from app.models.passport import Passport


class Business(Base):
    """
    Micro-enterprise business profile owned by a user.
    Stores operational trade details while supporting legal identity fields.
    """
    __tablename__ = "businesses"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    owner_user_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    trade_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    legal_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, default="General"
    )
    business_type: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, default="Retail"
    )
    operating_days: Mapped[Optional[Any]] = mapped_column(
        JSON, nullable=True
    )
    gstin: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, index=True
    )
    pan: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, index=True
    )
    incorporation_date: Mapped[Optional[date]] = mapped_column(
        Date, nullable=True
    )
    address_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    owner: Mapped["User"] = relationship(
        "User", back_populates="businesses"
    )
    sources: Mapped[List["Source"]] = relationship(
        "Source", back_populates="business", cascade="all, delete-orphan"
    )
    import_batches: Mapped[List["ImportBatch"]] = relationship(
        "ImportBatch", back_populates="business", cascade="all, delete-orphan"
    )
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="business", cascade="all, delete-orphan"
    )
    reconciliations: Mapped[List["Reconciliation"]] = relationship(
        "Reconciliation", back_populates="business", cascade="all, delete-orphan"
    )
    passports: Mapped[List["Passport"]] = relationship(
        "Passport", back_populates="business", cascade="all, delete-orphan"
    )

    def __init__(self, **kwargs):
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        if "owner_user_id" in kwargs and kwargs["owner_user_id"] is not None:
            kwargs["owner_user_id"] = str(kwargs["owner_user_id"])
        if "legal_name" in kwargs and "trade_name" not in kwargs:
            kwargs["trade_name"] = kwargs["legal_name"]
        elif "trade_name" in kwargs and "legal_name" not in kwargs:
            kwargs["legal_name"] = kwargs["trade_name"]
        if "operating_days" not in kwargs or kwargs["operating_days"] is None:
            kwargs["operating_days"] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        if "category" not in kwargs or not kwargs["category"]:
            kwargs["category"] = "General"
        if "business_type" not in kwargs or not kwargs["business_type"]:
            kwargs["business_type"] = "Retail"
        super().__init__(**kwargs)
