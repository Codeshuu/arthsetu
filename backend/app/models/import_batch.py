import uuid
from datetime import datetime, date
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, Integer, DateTime, Date, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.source import Source
    from app.models.import_row import ImportRow
    from app.models.transaction import Transaction


class ImportBatch(Base):
    """
    Ingestion batch tracking uploaded raw CSV/data files and validation statistics.
    """
    __tablename__ = "import_batches"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    business_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_id: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True
    )
    original_filename: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    stored_filepath: Mapped[str] = mapped_column(
        String(500), nullable=False
    )
    file_hash_sha256: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True
    )
    total_rows: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    valid_rows: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    error_rows: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    duplicate_rows: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="PENDING"
    )
    column_mapping: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )
    error_summary: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )
    date_range_start: Mapped[Optional[date]] = mapped_column(
        Date, nullable=True
    )
    date_range_end: Mapped[Optional[date]] = mapped_column(
        Date, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    business: Mapped["Business"] = relationship(
        "Business", back_populates="import_batches"
    )
    source: Mapped[Optional["Source"]] = relationship(
        "Source", back_populates="import_batches"
    )
    rows: Mapped[List["ImportRow"]] = relationship(
        "ImportRow", back_populates="batch", cascade="all, delete-orphan"
    )
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="import_batch"
    )

    def __init__(self, **kwargs):
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        if "business_id" in kwargs and kwargs["business_id"] is not None:
            kwargs["business_id"] = str(kwargs["business_id"])
        if "source_id" in kwargs and kwargs["source_id"] is not None:
            kwargs["source_id"] = str(kwargs["source_id"])
        super().__init__(**kwargs)
