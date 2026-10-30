import os
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.business import Business
from app.models.passport import Passport
from app.services.passport_service import PassportService
from app.schemas.passport import PassportGenerateRequest

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


@router.post("/generate")
def generate_financial_passport(
    payload: PassportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Synthesizes and freezes financial metrics, evidence quality scores, and operational continuity
    into a tamper-evident 2-page ReportLab PDF, storing snapshot in database.
    """
    check_business_ownership(payload.business_id, current_user, db)

    try:
        passport = PassportService.create_and_freeze_passport(
            db=db,
            business_id=payload.business_id,
            period_start=payload.period_start,
            period_end=payload.period_end,
        )
        return {
            "success": True,
            "data": {
                "id": passport.id,
                "business_id": passport.business_id,
                "passport_token": passport.passport_token,
                "period_start": passport.period_start,
                "period_end": passport.period_end,
                "metrics_snapshot": passport.metrics_snapshot,
                "evidence_breakdown": passport.evidence_breakdown,
                "anomaly_summary": passport.anomaly_summary,
                "sha256_hash": passport.sha256_hash,
                "download_url": f"/api/v1/passports/{passport.passport_token}/download",
                "generated_at": passport.generated_at,
            },
            "message": "Financial Visibility Passport generated and snapshot frozen successfully"
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": str(ve)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "PASSPORT_GENERATION_FAILED", "message": str(e)}
        )


@router.get("/{token}/download")
def download_passport_pdf(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Secure stream of the signed 2-page Financial Visibility Passport PDF.
    Accessible via tamper-evident passport token.
    """
    passport = db.query(Passport).filter(Passport.passport_token == token).first()
    if not passport or not os.path.exists(passport.pdf_filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PASSPORT_NOT_FOUND", "message": "Financial passport document not found"}
        )

    return FileResponse(
        path=passport.pdf_filepath,
        media_type="application/pdf",
        filename=f"ArthSetu_Passport_{token}.pdf",
        headers={
            "X-Passport-Token": passport.passport_token,
            "X-SHA256-Checksum": passport.sha256_hash,
        }
    )


@router.get("/{token}")
def get_passport_metadata(
    token: str,
    db: Session = Depends(get_db),
):
    """
    Retrieves the public verification details and snapshot for a passport token.
    """
    passport = db.query(Passport).filter(Passport.passport_token == token).first()
    if not passport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "PASSPORT_NOT_FOUND", "message": "Passport token not found"}
        )

    return {
        "success": True,
        "data": {
            "passport_token": passport.passport_token,
            "business_id": passport.business_id,
            "period_start": passport.period_start,
            "period_end": passport.period_end,
            "metrics_snapshot": passport.metrics_snapshot,
            "evidence_breakdown": passport.evidence_breakdown,
            "anomaly_summary": passport.anomaly_summary,
            "sha256_hash": passport.sha256_hash,
            "generated_at": passport.generated_at,
        },
        "message": "Passport verification record found"
    }
