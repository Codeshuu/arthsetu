import uuid
from datetime import datetime, date, time
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Date, Time, Numeric, ForeignKey, Index, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.source import Source
    from app.models.import_batch import ImportBatch
    from app.models.import_row import ImportRow
    from app.models.reconciliation import Reconciliation


class Transaction(Base):
    """
    Core financial transaction record.
    Amounts are stored strictly as positive fixed-point decimals, with flow_type designating INFLOW vs OUTFLOW.
    """
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    business_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_id: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True
    )
    import_batch_id: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("import_batches.id", ondelete="SET NULL"), nullable=True, index=True
    )
    import_row_id: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("import_rows.id", ondelete="SET NULL"), nullable=True, index=True
    )
    transaction_date: Mapped[date] = mapped_column(
        Date, nullable=False, index=True
    )
    transaction_time: Mapped[Optional[time]] = mapped_column(
        Time, nullable=True
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False
    )
    flow_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )
    payment_mode: Mapped[str] = mapped_column(
        String(50), default="OTHER", nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(50), default="SALE", nullable=False
    )
    counterparty_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    counterparty_identifier: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    reference_number: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    verification_status: Mapped[str] = mapped_column(
        String(50), default="SELF_DECLARED", nullable=False
    )
    dedup_hash: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True
    )
    is_flagged: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    flag_reason: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationships
    business: Mapped["Business"] = relationship(
        "Business", back_populates="transactions"
    )
    source: Mapped[Optional["Source"]] = relationship(
        "Source", back_populates="transactions"
    )
    import_batch: Mapped[Optional["ImportBatch"]] = relationship(
        "ImportBatch", back_populates="transactions"
    )
    import_row: Mapped[Optional["ImportRow"]] = relationship(
        "ImportRow", foreign_keys=[import_row_id]
    )
    primary_reconciliations: Mapped[List["Reconciliation"]] = relationship(
        "Reconciliation",
        foreign_keys="Reconciliation.primary_transaction_id",
        back_populates="primary_transaction",
        cascade="all, delete-orphan",
    )
    matched_reconciliations: Mapped[List["Reconciliation"]] = relationship(
        "Reconciliation",
        foreign_keys="Reconciliation.matched_transaction_id",
        back_populates="matched_transaction",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("amount > 0", name="ck_transactions_amount_positive"),
        Index("ix_transactions_business_date", "business_id", "transaction_date"),
        Index("ix_transactions_business_dedup", "business_id", "dedup_hash"),
    )

    def __init__(self, **kwargs):
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        if "business_id" in kwargs and kwargs["business_id"] is not None:
            kwargs["business_id"] = str(kwargs["business_id"])
        if "source_id" in kwargs and kwargs["source_id"] is not None:
            kwargs["source_id"] = str(kwargs["source_id"])
        if "import_batch_id" in kwargs and kwargs["import_batch_id"] is not None:
            kwargs["import_batch_id"] = str(kwargs["import_batch_id"])
        if "import_row_id" in kwargs and kwargs["import_row_id"] is not None:
            kwargs["import_row_id"] = str(kwargs["import_row_id"])
        if "transaction_date" in kwargs and isinstance(kwargs["transaction_date"], str):
            kwargs["transaction_date"] = date.fromisoformat(kwargs["transaction_date"])
        if "transaction_time" in kwargs and isinstance(kwargs["transaction_time"], str):
            kwargs["transaction_time"] = time.fromisoformat(kwargs["transaction_time"])
        if "amount" in kwargs and isinstance(kwargs["amount"], (int, float)):
            kwargs["amount"] = Decimal(str(kwargs["amount"]))
        if "payment_mode" not in kwargs or not kwargs["payment_mode"]:
            kwargs["payment_mode"] = "OTHER"
        if "category" not in kwargs or not kwargs["category"]:
            kwargs["category"] = "SALE"
        if "verification_status" not in kwargs or not kwargs["verification_status"]:
            kwargs["verification_status"] = "SELF_DECLARED"
        super().__init__(**kwargs)
