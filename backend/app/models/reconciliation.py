import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Numeric, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.transaction import Transaction
    from app.models.user import User


class Reconciliation(Base):
    """
    Candidate and resolved cross-source transaction reconciliation pairs.
    Maintains link to both transactions with check constraint preventing self-matching.
    """
    __tablename__ = "reconciliations"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    business_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    primary_transaction_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    matched_transaction_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    confidence_score: Mapped[Decimal] = mapped_column(
        Numeric(5, 4), nullable=False
    )
    match_rule: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="PENDING_REVIEW"
    )
    review_notes: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    resolved_by_user_id: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Explicit relationships for multiple foreign keys to the same table
    business: Mapped["Business"] = relationship(
        "Business", back_populates="reconciliations"
    )
    primary_transaction: Mapped["Transaction"] = relationship(
        "Transaction",
        foreign_keys=[primary_transaction_id],
        back_populates="primary_reconciliations",
    )
    matched_transaction: Mapped["Transaction"] = relationship(
        "Transaction",
        foreign_keys=[matched_transaction_id],
        back_populates="matched_reconciliations",
    )
    resolved_by: Mapped[Optional["User"]] = relationship(
        "User",
        foreign_keys=[resolved_by_user_id],
        back_populates="resolved_reconciliations",
    )

    __table_args__ = (
        CheckConstraint(
            "primary_transaction_id != matched_transaction_id",
            name="ck_reconciliation_distinct_txns",
        ),
        CheckConstraint(
            "confidence_score >= 0 AND confidence_score <= 1",
            name="ck_reconciliation_confidence_range",
        ),
    )

    def __init__(self, **kwargs):
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        if "business_id" in kwargs and kwargs["business_id"] is not None:
            kwargs["business_id"] = str(kwargs["business_id"])
        if "primary_transaction_id" in kwargs and kwargs["primary_transaction_id"] is not None:
            kwargs["primary_transaction_id"] = str(kwargs["primary_transaction_id"])
        if "matched_transaction_id" in kwargs and kwargs["matched_transaction_id"] is not None:
            kwargs["matched_transaction_id"] = str(kwargs["matched_transaction_id"])
        if "resolved_by_user_id" in kwargs and kwargs["resolved_by_user_id"] is not None:
            kwargs["resolved_by_user_id"] = str(kwargs["resolved_by_user_id"])
        if "confidence_score" in kwargs and isinstance(kwargs["confidence_score"], (int, float)):
            kwargs["confidence_score"] = Decimal(str(round(kwargs["confidence_score"], 4)))
        super().__init__(**kwargs)
