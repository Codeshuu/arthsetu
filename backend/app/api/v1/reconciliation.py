from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.business import Business
from app.services.reconciliation_service import ReconciliationService
from app.schemas.reconciliation import (
    ReconciliationResolveRequest,
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


@router.get("/candidates")
def get_reconciliation_candidates(
    business_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Identifies potential match pairs across different sources (Cashbook vs UPI vs Bank Statement)
    within a +/- 2 calendar day window or matching UTR/reference numbers.
    """
    check_business_ownership(business_id, current_user, db)

    try:
        candidates = ReconciliationService.find_candidates(db=db, business_id=business_id)
        return {
            "success": True,
            "data": {
                "candidates": candidates,
                "total_candidates": len(candidates),
            },
            "message": f"Found {len(candidates)} reconciliation candidates"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "RECONCILIATION_ERROR", "message": str(e)}
        )


@router.post("/resolve")
def resolve_reconciliation(
    payload: ReconciliationResolveRequest,
    business_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accepts or rejects a reconciliation pair.
    Accepting upgrades transaction verification status to 'RECONCILED'.
    """
    check_business_ownership(business_id, current_user, db)

    try:
        result = ReconciliationService.resolve_match(
            db=db,
            business_id=business_id,
            action=payload.action,
            reconciliation_id=payload.reconciliation_id,
            primary_id=payload.primary_transaction_id,
            matched_id=payload.matched_transaction_id,
            review_notes=payload.review_notes,
        )
        return {
            "success": True,
            "data": result,
            "message": f"Reconciliation successfully marked as {result['status']}"
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "INVALID_RESOLVE_REQUEST", "message": str(ve)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "RESOLVE_FAILED", "message": str(e)}
        )
