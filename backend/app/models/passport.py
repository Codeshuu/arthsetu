import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import String, DateTime, Date, JSON, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, GUID

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.user import User


class Passport(Base):
    """
    Generated Financial Visibility Passport.
    Maintains private, authenticated snapshot records and signed PDF hashes for a business.
    """
    __tablename__ = "passports"

    id: Mapped[str] = mapped_column(
        GUID(), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    business_id: Mapped[str] = mapped_column(
        GUID(), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    passport_token: Mapped[Optional[str]] = mapped_column(
        String(64), unique=True, nullable=True, index=True
    )
    generated_by: Mapped[Optional[str]] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    period_start: Mapped[date] = mapped_column(
        Date, nullable=False
    )
    period_end: Mapped[date] = mapped_column(
        Date, nullable=False
    )
    metrics_snapshot: Mapped[Dict[str, Any]] = mapped_column(
        JSON, nullable=False
    )
    evidence_breakdown: Mapped[Dict[str, Any]] = mapped_column(
        JSON, nullable=False
    )
    anomaly_summary: Mapped[Dict[str, Any]] = mapped_column(
        JSON, nullable=False
    )
    pdf_filepath: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    sha256_hash: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="ACTIVE"
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    business: Mapped["Business"] = relationship(
        "Business", back_populates="passports"
    )
    generator: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[generated_by], back_populates="generated_passports"
    )

    __table_args__ = (
        CheckConstraint(
            "period_start <= period_end",
            name="ck_passports_period_valid",
        ),
        Index("ix_passports_business_period", "business_id", "period_start", "period_end"),
    )

    def __init__(self, **kwargs):
        if "id" in kwargs and kwargs["id"] is not None:
            kwargs["id"] = str(kwargs["id"])
        if "business_id" in kwargs and kwargs["business_id"] is not None:
            kwargs["business_id"] = str(kwargs["business_id"])
        if "generated_by" in kwargs and kwargs["generated_by"] is not None:
            kwargs["generated_by"] = str(kwargs["generated_by"])
        if "period_start" in kwargs and isinstance(kwargs["period_start"], str):
            kwargs["period_start"] = date.fromisoformat(kwargs["period_start"])
        if "period_end" in kwargs and isinstance(kwargs["period_end"], str):
            kwargs["period_end"] = date.fromisoformat(kwargs["period_end"])
        super().__init__(**kwargs)
