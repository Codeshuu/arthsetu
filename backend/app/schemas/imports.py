from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ColumnMappingRequest(BaseModel):
    mapping: Dict[str, str] = Field(
        ...,
        description="Dictionary mapping standard canonical field names to CSV column names. Required keys: 'date', 'amount'. Optional keys: 'flow_type', 'payment_mode', 'category', 'reference_number', 'description', 'counterparty_name'."
    )
    default_payment_mode: Optional[str] = "UPI"
    default_flow_type: Optional[str] = None  # "INFLOW" or "OUTFLOW" if not determinable from rows


class ParsedRowPreview(BaseModel):
    row_index: int
    raw_data: Dict[str, Any]
    parsed_data: Optional[Dict[str, Any]] = None
    validation_status: str  # VALID | INVALID | DUPLICATE
    validation_error: Optional[str] = None


class ImportUploadResponse(BaseModel):
    batch_id: str
    original_filename: str
    file_hash_sha256: str
    total_rows_detected: int
    raw_columns: List[str]
    suggested_mapping: Dict[str, Optional[str]]
    sample_rows: List[Dict[str, Any]]
    is_duplicate_batch: bool = False
    message: str


class ColumnMappingResponse(BaseModel):
    batch_id: str
    total_rows: int
    valid_rows: int
    error_rows: int
    duplicate_rows: int
    preview: List[ParsedRowPreview]


class BatchCommitRequest(BaseModel):
    overwrite_duplicates: bool = False


class BatchCommitResponse(BaseModel):
    batch_id: str
    status: str
    imported_records_count: int
    skipped_duplicates_count: int
    failed_records_count: int


class ImportBatchResponse(BaseModel):
    id: str
    business_id: str
    source_id: Optional[str] = None
    original_filename: str
    file_hash_sha256: str
    total_rows: int
    valid_rows: int
    error_rows: int
    duplicate_rows: int
    status: str
    column_mapping: Optional[Dict[str, Any]] = None
    error_summary: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
