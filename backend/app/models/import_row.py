import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class ImportRow(Base):
    __tablename__ = "import_rows"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_id = Column(String(36), ForeignKey("import_batches.id", ondelete="CASCADE"), nullable=False, index=True)
    row_index = Column(Integer, nullable=False)
    raw_data = Column(JSON, nullable=False)
    parsed_data = Column(JSON, nullable=True)
    validation_status = Column(String(50), default="VALID", nullable=False)  # VALID | INVALID | DUPLICATE
    validation_error = Column(Text, nullable=True)
    is_committed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    batch = relationship("ImportBatch", back_populates="rows")
