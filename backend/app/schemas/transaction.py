import uuid
from datetime import date, datetime, time
from decimal import Decimal
from typing import List, Literal, Optional, Union
from pydantic import BaseModel, ConfigDict, Field, field_validator


class TransactionBase(BaseModel):
    """Base fields for financial transaction."""
    transaction_date: date = Field(..., description="Date of transaction")
    transaction_time: Optional[time] = Field(None, description="Time of transaction if available")
    amount: Decimal = Field(
        ...,
        gt=Decimal("0.00"),
        decimal_places=2,
        max_digits=14,
        description="Transaction monetary amount (strictly positive fixed-point decimal)",
    )
    flow_type: Literal["INFLOW", "OUTFLOW"] = Field(
        ..., description="Direction of funds movement (INFLOW or OUTFLOW)"
    )
    payment_mode: str = Field(
        default="OTHER", min_length=1, max_length=50, description="Payment channel (e.g. CASH, UPI, NET_BANKING, CHEQUE, OTHER)"
    )
    category: str = Field(
        default="SALE", min_length=1, max_length=50, description="Category (e.g. SALE, EXPENSE, TRANSFER, LOAN, OWNER_DRAW)"
    )
    counterparty_name: Optional[str] = Field(None, max_length=255)
    counterparty_identifier: Optional[str] = Field(None, max_length=255)
    reference_number: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)

    @field_validator("amount", mode="before")
    @classmethod
    def normalize_amount(cls, v):
        if isinstance(v, (int, float, str)):
            return Decimal(str(v))
        return v

    @field_validator("flow_type", mode="before")
    @classmethod
    def normalize_flow_type(cls, v: str) -> str:
        if isinstance(v, str):
            v_upper = v.strip().upper()
            if v_upper in {"INFLOW", "OUTFLOW"}:
                return v_upper
        return v

    @field_validator("payment_mode", "category", mode="before")
    @classmethod
    def normalize_strings(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().upper()
        return v


class TransactionCreate(TransactionBase):
    """
    Schema for manual creation of a transaction.
    Requires business_id; strictly forbids setting internal ingestion flags or ownership attributes.
    """
    business_id: Union[uuid.UUID, str] = Field(..., description="Target business owned by caller")
    source_id: Optional[Union[uuid.UUID, str]] = Field(None, description="Optional source identifier")
    import_batch_id: Optional[Union[uuid.UUID, str]] = Field(None, description="Optional import batch identifier")

    model_config = ConfigDict(extra="ignore")


class TransactionUpdate(BaseModel):
    """
    Schema for partial update of editable transaction fields.
    Immutability enforced for id, business_id, import references, and system flags.
    """
    transaction_date: Optional[date] = None
    transaction_time: Optional[time] = None
    amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"), decimal_places=2, max_digits=14)
    flow_type: Optional[Literal["INFLOW", "OUTFLOW"]] = None
    payment_mode: Optional[str] = Field(None, min_length=1, max_length=50)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    counterparty_name: Optional[str] = Field(None, max_length=255)
    counterparty_identifier: Optional[str] = Field(None, max_length=255)
    reference_number: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=500)

    @field_validator("amount", mode="before")
    @classmethod
    def normalize_amount(cls, v):
        if v is not None and isinstance(v, (int, float, str)):
            return Decimal(str(v))
        return v

    @field_validator("flow_type", mode="before")
    @classmethod
    def normalize_flow_type(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v_upper = v.strip().upper()
            if v_upper in {"INFLOW", "OUTFLOW"}:
                return v_upper
        return v

    @field_validator("payment_mode", "category", mode="before")
    @classmethod
    def normalize_strings(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            return v.strip().upper()
        return v

    model_config = ConfigDict(extra="ignore")


class TransactionResponse(BaseModel):
    """
    Public representation of a Transaction.
    Never exposes internal duplicate hashes or system secrets.
    """
    id: Union[uuid.UUID, str]
    business_id: Union[uuid.UUID, str]
    source_id: Optional[Union[uuid.UUID, str]] = None
    import_batch_id: Optional[Union[uuid.UUID, str]] = None
    import_row_id: Optional[Union[uuid.UUID, str]] = None
    transaction_date: date
    transaction_time: Optional[time] = None
    amount: Decimal
    flow_type: str
    payment_mode: str
    category: str
    counterparty_name: Optional[str] = None
    counterparty_identifier: Optional[str] = None
    reference_number: Optional[str] = None
    description: Optional[str] = None
    verification_status: str = Field(default="SELF_DECLARED", description="SELF_DECLARED | STATEMENT_BACKED | RECONCILED")
    is_flagged: bool = False
    flag_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionListResponse(BaseModel):
    """
    Paginated envelope for transaction queries.
    """
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
