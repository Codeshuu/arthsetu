from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.business import Business
from app.models.import_batch import ImportBatch
from app.services.import_service import ImportService
from app.schemas.imports import (
    ColumnMappingRequest,
    BatchCommitRequest,
)

router = APIRouter()


def check_business_ownership(business_id: str, user: User, db: Session) -> Business:
    biz = db.query(Business).filter(Business.id == business_id).first()
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "BUSINESS_NOT_FOUND", "message": "Business entity not found"}
        )
    if biz.owner_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "RESOURCE_FORBIDDEN", "message": "You do not own this business entity"}
        )
    return biz


@router.post("/upload")
async def upload_import_file(
    file: UploadFile = File(...),
    business_id: str = Form(...),
    source_type: Optional[str] = Form("UPI_EXPORT"),
    source_id: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Uploads a raw CSV or Excel file, computes SHA-256 hash, autodetects column headers,
    and returns suggested column mappings with a 5-row sample preview.
    """
    check_business_ownership(business_id, current_user, db)

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "EMPTY_FILE", "message": "The uploaded file is empty"}
        )

    try:
        batch, upload_meta, is_dup = ImportService.save_and_initiate_batch(
            file_bytes=file_bytes,
            filename=file.filename or "uploaded_file.csv",
            business_id=business_id,
            db=db,
            source_id=source_id,
        )
        return {
            "success": True,
            "data": upload_meta,
            "message": upload_meta["message"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "PARSE_ERROR", "message": f"Could not read upload file: {str(e)}"}
        )


@router.post("/{batch_id}/map-columns")
def map_columns_and_preview(
    batch_id: str,
    payload: ColumnMappingRequest,
    business_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submits user-confirmed column mappings, normalizes raw rows into standard transaction schemas,
    runs row validation and in-batch duplicate checks, and returns a preview with error counts.
    """
    check_business_ownership(business_id, current_user, db)

    try:
        result = ImportService.map_columns_and_validate(
            batch_id=batch_id,
            business_id=business_id,
            mapping=payload.mapping,
            default_payment_mode=payload.default_payment_mode or "UPI",
            default_flow_type=payload.default_flow_type,
            db=db,
        )
        return {
            "success": True,
            "data": result,
            "message": "Column mapping applied and rows successfully validated"
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": str(ve)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "VALIDATION_FAILED", "message": str(e)}
        )


@router.post("/{batch_id}/commit")
def commit_batch(
    batch_id: str,
    payload: BatchCommitRequest,
    business_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Atomically writes validated rows to the active transactions table,
    detecting and skipping duplicates already present in the database.
    """
    check_business_ownership(business_id, current_user, db)

    try:
        result = ImportService.commit_batch_to_transactions(
            batch_id=batch_id,
            business_id=business_id,
            overwrite_duplicates=payload.overwrite_duplicates,
            db=db,
        )
        return {
            "success": True,
            "data": result,
            "message": f"Committed {result['imported_records_count']} transactions successfully"
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": str(ve)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "COMMIT_FAILED", "message": str(e)}
        )


@router.get("/{batch_id}")
def get_batch_status(
    batch_id: str,
    business_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Fetches the processing and commit status of a specific import batch.
    """
    check_business_ownership(business_id, current_user, db)

    batch = db.query(ImportBatch).filter(
        ImportBatch.id == batch_id,
        ImportBatch.business_id == business_id
    ).first()

    if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "BATCH_NOT_FOUND", "message": "Import batch not found"}
        )

    return {
        "success": True,
        "data": {
            "id": batch.id,
            "business_id": batch.business_id,
            "source_id": batch.source_id,
            "original_filename": batch.original_filename,
            "file_hash_sha256": batch.file_hash_sha256,
            "total_rows": batch.total_rows,
            "valid_rows": batch.valid_rows,
            "error_rows": batch.error_rows,
            "duplicate_rows": batch.duplicate_rows,
            "status": batch.status,
            "column_mapping": batch.column_mapping,
            "created_at": batch.created_at,
            "updated_at": batch.updated_at,
        },
        "message": "Batch status retrieved successfully"
    }
