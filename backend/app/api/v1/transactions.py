import math
import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.transaction import (
    TransactionCreate,
    TransactionListResponse,
    TransactionResponse,
    TransactionUpdate,
)
from app.services import business_service, transaction_service
from app.services.transaction_service import TransactionConflictError

router = APIRouter()


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new transaction",
)
def create_transaction_endpoint(
    txn_in: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionResponse:
    """
    Creates a new manual financial transaction for a business owned by the user.
    Returns HTTP 404 if the target business does not exist or belongs to another tenant.
    """
    txn = transaction_service.create_transaction(
        db=db, txn_in=txn_in, owner_id=current_user.id
    )
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )
    return txn


@router.get(
    "",
    response_model=TransactionListResponse,
    status_code=status.HTTP_200_OK,
    summary="List transactions with filtering and pagination",
)
def list_transactions_endpoint(
    business_id: Optional[uuid.UUID] = Query(None, description="Filter by business ID"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Records per page (max 100)"),
    start_date: Optional[date] = Query(None, description="Filter transactions on or after this date"),
    end_date: Optional[date] = Query(None, description="Filter transactions on or before this date"),
    flow_type: Optional[str] = Query(None, description="Filter by flow (INFLOW, OUTFLOW)"),
    payment_mode: Optional[str] = Query(None, description="Filter by payment mode (CASH, UPI, etc.)"),
    category: Optional[str] = Query(None, description="Filter by category (SALE, EXPENSE, etc.)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionListResponse:
    """
    Retrieves transactions strictly scoped to businesses owned by the authenticated user.
    Applies SQL-level filtering and pagination.
    """
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date cannot be later than end_date",
        )

    if business_id:
        biz = business_service.get_business_by_id_and_owner(
            db, business_id=business_id, owner_id=current_user.id
        )
        if not biz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Business not found",
            )

    items, total = transaction_service.list_transactions_for_owner(
        db=db,
        owner_id=current_user.id,
        business_id=business_id,
        page=page,
        page_size=page_size,
        start_date=start_date,
        end_date=end_date,
        flow_type=flow_type,
        payment_mode=payment_mode,
        category=category,
    )

    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return TransactionListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch transaction by ID",
)
def get_transaction_endpoint(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionResponse:
    """
    Fetches a single transaction joining with Business to verify owner ownership.
    Returns HTTP 404 if the transaction does not exist or belongs to another user.
    """
    txn = transaction_service.get_transaction_by_id_and_owner(
        db=db, transaction_id=transaction_id, owner_id=current_user.id
    )
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    return txn


@router.patch(
    "/{transaction_id}",
    response_model=TransactionResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially update an existing transaction",
)
@router.put(
    "/{transaction_id}",
    response_model=TransactionResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing transaction",
)
def update_transaction_endpoint(
    transaction_id: uuid.UUID,
    txn_in: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TransactionResponse:
    """
    Updates editable fields of a transaction owned by the authenticated user.
    Returns HTTP 404 if the transaction does not exist or belongs to another user.
    """
    txn = transaction_service.update_transaction_for_owner(
        db=db,
        transaction_id=transaction_id,
        owner_id=current_user.id,
        update_data=txn_in,
    )
    if not txn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )
    return txn


@router.delete(
    "/{transaction_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a transaction",
)
def delete_transaction_endpoint(
    transaction_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    """
    Deletes a transaction if owned by the user and safe to remove.
    Returns HTTP 404 if nonexistent or belongs to another user.
    Returns HTTP 409 Conflict if referenced in financial reconciliation pairs.
    """
    try:
        deleted = transaction_service.delete_transaction_for_owner(
            db=db, transaction_id=transaction_id, owner_id=current_user.id
        )
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction not found",
            )
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except TransactionConflictError as err:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(err),
        )
