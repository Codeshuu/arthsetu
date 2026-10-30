import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.business import Business
from app.schemas.business import BusinessCreate, BusinessUpdate


def create_business(
    db: Session, business_in: BusinessCreate, owner_id: uuid.UUID
) -> Business:
    """
    Creates a new business profile owned by the authenticated user.
    The owner_user_id is strictly derived from the authenticated session.
    """
    business = Business(
        owner_user_id=owner_id,
        trade_name=business_in.trade_name.strip(),
        category=business_in.category.strip(),
        business_type=business_in.business_type.strip(),
        operating_days=business_in.operating_days,
    )
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


def list_businesses_for_owner(
    db: Session, owner_id: uuid.UUID
) -> List[Business]:
    """
    Returns all businesses owned strictly by the specified owner_id.
    Never exposes businesses owned by another tenant.
    """
    stmt = (
        select(Business)
        .where(Business.owner_user_id == owner_id)
        .order_by(Business.created_at.desc())
    )
    return list(db.execute(stmt).scalars().all())


def get_business_by_id_and_owner(
    db: Session, business_id: uuid.UUID, owner_id: uuid.UUID
) -> Optional[Business]:
    """
    Fetches a specific business only if it belongs to the authenticated owner.
    Returns None if the business does not exist OR belongs to another user.
    """
    stmt = select(Business).where(
        Business.id == business_id,
        Business.owner_user_id == owner_id,
    )
    return db.execute(stmt).scalar_one_or_none()


def update_business_for_owner(
    db: Session,
    business_id: uuid.UUID,
    owner_id: uuid.UUID,
    update_data: BusinessUpdate,
) -> Optional[Business]:
    """
    Partially updates an existing business after strictly validating owner identity.
    Only allows modifying permitted profile fields (trade_name, category, business_type, operating_days).
    Returns None if the business does not exist or belongs to another user.
    """
    business = get_business_by_id_and_owner(db, business_id=business_id, owner_id=owner_id)
    if not business:
        return None

    allowed_fields = {"trade_name", "category", "business_type", "operating_days"}
    updates = update_data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        if field in allowed_fields:
            if isinstance(value, str):
                value = value.strip()
            setattr(business, field, value)

    business.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(business)
    return business
