import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class ImportBatch(Base):
    __tablename__ = "import_batches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id = Column(String(36), ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="SET NULL"), nullable=True, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filepath = Column(String(500), nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False, index=True)
    total_rows = Column(Integer, default=0, nullable=False)
    valid_rows = Column(Integer, default=0, nullable=False)
    error_rows = Column(Integer, default=0, nullable=False)
    duplicate_rows = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING | PARSED | VALIDATED | COMMITTED | FAILED
    column_mapping = Column(JSON, nullable=True)
    error_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    business = relationship("Business", back_populates="import_batches")
    source = relationship("Source", back_populates="import_batches")
    rows = relationship("ImportRow", back_populates="batch", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="import_batch")
