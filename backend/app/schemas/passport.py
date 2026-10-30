from datetime import date, datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field


class PassportGenerateRequest(BaseModel):
    business_id: str
    period_start: Optional[date] = None
    period_end: Optional[date] = None


class PassportResponse(BaseModel):
    id: str
    business_id: str
    passport_token: str
    period_start: date
    period_end: date
    metrics_snapshot: Dict[str, Any]
    evidence_breakdown: Dict[str, Any]
    anomaly_summary: Dict[str, Any]
    sha256_hash: str
    download_url: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)
