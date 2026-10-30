import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, Date, Time, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True)
    import_batch_id = Column(String(36), ForeignKey("import_batches.id", ondelete="SET NULL"), nullable=True, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    transaction_time = Column(Time, nullable=True)
    amount = Column(Numeric(14, 2), nullable=False)
    flow_type = Column(String(20), nullable=False)  # INFLOW | OUTFLOW
    payment_mode = Column(String(50), default="OTHER", nullable=False)  # CASH | UPI | NET_BANKING | CHEQUE | OTHER
    category = Column(String(50), default="SALE", nullable=False)  # SALE | EXPENSE | TRANSFER | LOAN | OWNER_DRAW
    counterparty_name = Column(String(255), nullable=True)
    counterparty_identifier = Column(String(100), nullable=True)
    reference_number = Column(String(100), nullable=True, index=True)
    description = Column(Text, nullable=True)
    verification_status = Column(String(50), default="SELF_DECLARED", nullable=False)  # SELF_DECLARED | STATEMENT_BACKED | RECONCILED
    is_flagged = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    business = relationship("Business", back_populates="transactions")
    source = relationship("Source", back_populates="transactions")
    import_batch = relationship("ImportBatch", back_populates="transactions")
    primary_reconciliations = relationship(
        "Reconciliation",
        foreign_keys="[Reconciliation.primary_transaction_id]",
        back_populates="primary_transaction",
        cascade="all, delete-orphan",
    )
    matched_reconciliations = relationship(
        "Reconciliation",
        foreign_keys="[Reconciliation.matched_transaction_id]",
        back_populates="matched_transaction",
        cascade="all, delete-orphan",
    )
