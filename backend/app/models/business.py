import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base


class Business(Base):
    __tablename__ = "businesses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    legal_name = Column(String(255), nullable=False)
    trade_name = Column(String(255), nullable=True)
    gstin = Column(String(20), nullable=True, index=True)
    pan = Column(String(20), nullable=True, index=True)
    business_type = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    incorporation_date = Column(Date, nullable=True)
    address_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner = relationship("User", back_populates="businesses")
    sources = relationship("Source", back_populates="business", cascade="all, delete-orphan")
    import_batches = relationship("ImportBatch", back_populates="business", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="business", cascade="all, delete-orphan")
    reconciliations = relationship("Reconciliation", back_populates="business", cascade="all, delete-orphan")
    passports = relationship("Passport", back_populates="business", cascade="all, delete-orphan")
