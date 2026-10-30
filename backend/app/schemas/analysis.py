from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class SummaryMetricsResponse(BaseModel):
    recorded_sales: float = Field(..., description="Sum of eligible credit/inflow transactions marked as Sale/Revenue")
    recorded_expenses: float = Field(..., description="Sum of eligible debit/outflow transactions marked as Expense")
    net_recorded_cash_movement: float = Field(..., description="Recorded Inflows minus Recorded Outflows. Strictly never labeled as Profit")
    total_inflows: float
    total_outflows: float
    digital_recorded_sales: float
    cash_recorded_sales: float
    digital_sales_share: float = Field(..., ge=0.0, le=100.0, description="Percentage of sales received digitally")
    expense_to_sales_ratio: float = Field(..., ge=0.0, description="Ratio of recorded expenses to recorded sales in percent")
    total_transactions_count: int
    sales_transactions_count: int
    expense_transactions_count: int
    period_start: Optional[date] = None
    period_end: Optional[date] = None


class CompletenessMetricsResponse(BaseModel):
    total_calendar_days: int
    operating_days_count: int
    operating_day_coverage: float = Field(..., ge=0.0, le=100.0, description="Operating days divided by total calendar days")
    continuity_score: float = Field(..., ge=0.0, le=100.0)
    longest_operating_streak_days: int
    current_operating_streak_days: int
    missing_dates: List[str]
    period_start: Optional[date] = None
    period_end: Optional[date] = None


class AnomalyItem(BaseModel):
    transaction_id: str
    transaction_date: date
    amount: float
    category: str
    flow_type: str
    reason: str
    label: str = Field(default="Unusual Activity Requiring Owner Verification")
    severity: str = "MEDIUM"


class AnomalyMetricsResponse(BaseModel):
    insufficient_sample_size: bool
    sample_size: int
    threshold_q1: Optional[float] = None
    threshold_q3: Optional[float] = None
    threshold_iqr: Optional[float] = None
    upper_bound: Optional[float] = None
    lower_bound: Optional[float] = None
    anomalies: List[AnomalyItem]
    total_anomalies: int


class EvidenceDimensionScore(BaseModel):
    dimension: str
    score: float = Field(..., ge=0.0, le=100.0)
    description: str
    key_findings: List[str] = []


class EvidenceQualityResponse(BaseModel):
    overall_score: float = Field(..., ge=0.0, le=100.0)
    provenance_score: float
    source_status_score: float
    completeness_score: float
    consistency_score: float
    traceability_score: float
    dimension_breakdown: List[EvidenceDimensionScore]
    evaluation_notes: str
