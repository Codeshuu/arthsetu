import uuid
from datetime import datetime
from typing import Optional, Any, TYPE_CHECKING
from sqlalchemy import Integer, Boolean, String, DateTime, JSON, ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.import_batch import ImportBatch
    from app.models.transaction import Transaction


class ImportRow(Base):
    """
    Individual parsed row from an imported batch with row-level validation status.
    """
    __tablename__ = "import_rows"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    batch_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("import_batches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    row_number: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    raw_data: Mapped[Any] = mapped_column(
        JSON, nullable=False
    )
    parsed_data: Mapped[Optional[Any]] = mapped_column(
        JSON, nullable=True
    )
    validation_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="PENDING"
    )
    validation_errors: Mapped[Optional[Any]] = mapped_column(
        JSON, nullable=True
    )
    duplicate_of_transaction_id: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    is_committed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Synonyms for backwards compatibility with Phase 3 code
    row_index = synonym("row_number")
    validation_error = synonym("validation_errors")

    # Relationships
    batch: Mapped["ImportBatch"] = relationship(
        "ImportBatch", back_populates="rows"
    )
    duplicate_of_transaction: Mapped[Optional["Transaction"]] = relationship(
        "Transaction", foreign_keys=[duplicate_of_transaction_id]
    )

    __table_args__ = (
        Index("ix_import_rows_batch_validation", "batch_id", "validation_status"),
    )

    def __init__(self, **kwargs):
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        if "batch_id" in kwargs and kwargs["batch_id"] is not None:
            kwargs["batch_id"] = str(kwargs["batch_id"])
        if "row_index" in kwargs and "row_number" not in kwargs:
            kwargs["row_number"] = kwargs.pop("row_index")
        if "validation_error" in kwargs and "validation_errors" not in kwargs:
            kwargs["validation_errors"] = kwargs.pop("validation_error")
        if "duplicate_of_transaction_id" in kwargs and kwargs["duplicate_of_transaction_id"] is not None:
            kwargs["duplicate_of_transaction_id"] = str(kwargs["duplicate_of_transaction_id"])
        super().__init__(**kwargs)
