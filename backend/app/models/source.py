import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    source_type = Column(String(50), nullable=False)  # CASHBOOK | BANK_STATEMENT | UPI_EXPORT | ERP
    source_name = Column(String(255), nullable=False)
    account_identifier = Column(String(100), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    business = relationship("Business", back_populates="sources")
    transactions = relationship("Transaction", back_populates="source")
    import_batches = relationship("ImportBatch", back_populates="source")
