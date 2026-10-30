import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.business import BusinessCreate, BusinessResponse, BusinessUpdate
from app.services import business_service

router = APIRouter()


@router.post(
    "",
    response_model=BusinessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new business profile",
)
def create_business_endpoint(
    business_in: BusinessCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """
    Creates a new micro-enterprise business profile.
    Automatically assigns ownership to the authenticated user.
    """
    return business_service.create_business(
        db=db,
        business_in=business_in,
        owner_id=current_user.id,
    )


@router.get(
    "",
    response_model=List[BusinessResponse],
    status_code=status.HTTP_200_OK,
    summary="List all businesses owned by the authenticated user",
)
def list_businesses_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[BusinessResponse]:
    """
    Retrieves all business profiles belonging to the current user.
    Returns an empty list if the user has no business profiles.
    """
    return business_service.list_businesses_for_owner(
        db=db,
        owner_id=current_user.id,
    )


@router.get(
    "/{business_id}",
    response_model=BusinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Fetch business profile by ID",
)
def get_business_endpoint(
    business_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """
    Fetches a single business profile by ID.
    Enforces strict multi-tenant ownership verification.
    Returns HTTP 404 if the business does not exist or belongs to another user.
    """
    business = business_service.get_business_by_id_and_owner(
        db=db,
        business_id=business_id,
        owner_id=current_user.id,
    )
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )
    return business


@router.patch(
    "/{business_id}",
    response_model=BusinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Partially update a business profile",
)
@router.put(
    "/{business_id}",
    response_model=BusinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a business profile",
)
def update_business_endpoint(
    business_id: uuid.UUID,
    business_in: BusinessUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BusinessResponse:
    """
    Updates profile fields for a business owned by the authenticated user.
    Returns HTTP 404 if the business does not exist or belongs to another user.
    """
    business = business_service.update_business_for_owner(
        db=db,
        business_id=business_id,
        owner_id=current_user.id,
        update_data=business_in,
    )
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )
    return business
