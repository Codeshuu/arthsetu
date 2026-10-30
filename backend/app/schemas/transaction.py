from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TransactionBase(BaseModel):
    transaction_date: date
    transaction_time: Optional[time] = None
    amount: float = Field(..., gt=0, description="Absolute transaction amount")
    flow_type: str = Field(..., description="INFLOW | OUTFLOW")
    payment_mode: str = Field(default="OTHER", description="CASH | UPI | NET_BANKING | CHEQUE | OTHER")
    category: str = Field(default="SALE", description="SALE | EXPENSE | TRANSFER | LOAN | OWNER_DRAW")
    counterparty_name: Optional[str] = None
    counterparty_identifier: Optional[str] = None
    reference_number: Optional[str] = None
    description: Optional[str] = None
    verification_status: str = Field(default="SELF_DECLARED", description="SELF_DECLARED | STATEMENT_BACKED | RECONCILED")
    is_flagged: bool = False


class TransactionCreate(TransactionBase):
    business_id: Optional[str] = None
    source_id: Optional[str] = None
    import_batch_id: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: str
    business_id: str
    source_id: Optional[str] = None
    import_batch_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
