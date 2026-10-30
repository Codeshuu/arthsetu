import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class Passport(Base):
    __tablename__ = "passports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    passport_token = Column(String(64), unique=True, nullable=False, index=True)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    metrics_snapshot = Column(JSON, nullable=False)
    evidence_breakdown = Column(JSON, nullable=False)
    anomaly_summary = Column(JSON, nullable=False)
    pdf_filepath = Column(String(500), nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    business = relationship("Business", back_populates="passports")
