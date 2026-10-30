import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.user import User
    from app.models.import_batch import ImportBatch
    from app.models.transaction import Transaction


class Source(Base):
    """
    Data source record (e.g., Cashbook, Bank statement, UPI export).
    Tracks evidence provenance; uploaded evidence is never labelled as independently verified.
    """
    __tablename__ = "sources"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    business_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    source_name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    original_filename: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    account_identifier: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    metadata_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )
    submitted_by: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    authenticity_status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="OWNER_DECLARED"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    business: Mapped["Business"] = relationship(
        "Business", back_populates="sources"
    )
    submitter: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[submitted_by], back_populates="submitted_sources"
    )
    import_batches: Mapped[List["ImportBatch"]] = relationship(
        "ImportBatch", back_populates="source"
    )
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", back_populates="source"
    )

    def __init__(self, **kwargs):
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        if "business_id" in kwargs and kwargs["business_id"] is not None:
            kwargs["business_id"] = str(kwargs["business_id"])
        if "submitted_by" in kwargs and kwargs["submitted_by"] is not None:
            kwargs["submitted_by"] = str(kwargs["submitted_by"])
        super().__init__(**kwargs)
