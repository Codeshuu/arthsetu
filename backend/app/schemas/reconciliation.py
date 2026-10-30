from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class ReconciliationTransactionView(BaseModel):
    id: str
    transaction_date: date
    amount: float
    flow_type: str
    payment_mode: str
    category: str
    counterparty_name: Optional[str] = None
    reference_number: Optional[str] = None
    description: Optional[str] = None
    verification_status: str
    source_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ReconciliationCandidateView(BaseModel):
    id: Optional[str] = None
    primary_transaction: ReconciliationTransactionView
    matched_transaction: ReconciliationTransactionView
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    match_rule: str  # EXACT_AMOUNT_DATE | UTR_MATCH | WINDOW_APPROXIMATE
    status: str = "PENDING_REVIEW"
    review_notes: Optional[str] = None


class ReconciliationCandidatesResponse(BaseModel):
    candidates: List[ReconciliationCandidateView]
    total_candidates: int


class ReconciliationResolveRequest(BaseModel):
    reconciliation_id: Optional[str] = None
    primary_transaction_id: Optional[str] = None
    matched_transaction_id: Optional[str] = None
    action: str = Field(..., description="'ACCEPT' or 'REJECT'")
    review_notes: Optional[str] = None


class ReconciliationResolveResponse(BaseModel):
    reconciliation_id: str
    status: str
    action: str
    resolved_at: datetime
