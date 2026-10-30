import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Reconciliation(Base):
    __tablename__ = "reconciliations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    primary_transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    matched_transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    confidence_score = Column(Float, nullable=False)
    match_rule = Column(String(100), nullable=False)  # EXACT_AMOUNT_DATE | UTR_MATCH | WINDOW_APPROXIMATE
    status = Column(String(50), default="PENDING_REVIEW", nullable=False)  # PENDING_REVIEW | ACCEPTED | REJECTED
    review_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    business = relationship("Business", back_populates="reconciliations")
    primary_transaction = relationship("Transaction", foreign_keys=[primary_transaction_id], back_populates="primary_reconciliations")
    matched_transaction = relationship("Transaction", foreign_keys=[matched_transaction_id], back_populates="matched_reconciliations")
