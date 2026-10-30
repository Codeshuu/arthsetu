from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.business import Business
from app.services.metrics_service import MetricsService
from app.services.completeness_service import CompletenessService
from app.services.anomaly_service import AnomalyService
from app.services.evidence_service import EvidenceService

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


@router.get("/summary")
def get_financial_summary(
    business_id: str = Query(...),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes overall recorded financial metrics: Recorded Sales, Recorded Expenses,
    Net Recorded Cash Movement, and Digital Sales Share. (Strictly never uses 'Profit').
    """
    check_business_ownership(business_id, current_user, db)

    try:
        metrics = MetricsService.get_summary_metrics(
            db=db,
            business_id=business_id,
            start_date=start_date,
            end_date=end_date,
        )
        return {
            "success": True,
            "data": metrics,
            "message": "Financial summary metrics calculated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "ANALYSIS_ERROR", "message": str(e)}
        )


@router.get("/completeness")
def get_data_completeness(
    business_id: str = Query(...),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes data continuity, operating-day coverage percentage, and date streaks.
    """
    check_business_ownership(business_id, current_user, db)

    try:
        completeness = CompletenessService.get_completeness_metrics(
            db=db,
            business_id=business_id,
            start_date=start_date,
            end_date=end_date,
        )
        return {
            "success": True,
            "data": completeness,
            "message": "Data completeness and operating rhythm evaluated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "COMPLETENESS_ERROR", "message": str(e)}
        )


@router.get("/anomalies")
def get_outliers_and_anomalies(
    business_id: str = Query(...),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Applies IQR statistical outlier detection (>= 30 sample threshold)
    and flags unusual activity requiring owner verification (never 'fraud').
    """
    check_business_ownership(business_id, current_user, db)

    try:
        anomalies = AnomalyService.get_anomalies(
            db=db,
            business_id=business_id,
            start_date=start_date,
            end_date=end_date,
        )
        return {
            "success": True,
            "data": anomalies,
            "message": "Outlier detection executed successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "ANOMALY_ERROR", "message": str(e)}
        )


@router.get("/evidence-quality")
def get_evidence_quality_score(
    business_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes 5-dimension objective evidence quality score (Provenance, Source Status,
    Completeness, Consistency, Traceability) on a 0-100 scale.
    """
    check_business_ownership(business_id, current_user, db)

    try:
        evidence = EvidenceService.get_evidence_quality(
            db=db,
            business_id=business_id,
        )
        return {
            "success": True,
            "data": evidence,
            "message": "Evidence quality scoring calculated successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "EVIDENCE_ERROR", "message": str(e)}
        )
