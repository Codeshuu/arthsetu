import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from app.models.business import Business
from app.models.reconciliation import Reconciliation
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from app.services import business_service


class TransactionConflictError(Exception):
    """Raised when an operation would violate referential integrity or financial reconciliation safety."""
    pass


def create_transaction(
    db: Session, txn_in: TransactionCreate, owner_id: uuid.UUID
) -> Optional[Transaction]:
    """
    Creates a new transaction after strictly verifying that the target business
    belongs to the authenticated user.
    Returns None if the business does not exist or belongs to another user.
    """
    business = business_service.get_business_by_id_and_owner(
        db, business_id=txn_in.business_id, owner_id=owner_id
    )
    if not business:
        return None

    transaction = Transaction(
        business_id=txn_in.business_id,
        transaction_date=txn_in.transaction_date,
        transaction_time=txn_in.transaction_time,
        amount=txn_in.amount,
        flow_type=txn_in.flow_type,
        payment_mode=txn_in.payment_mode,
        category=txn_in.category,
        counterparty_name=txn_in.counterparty_name.strip() if txn_in.counterparty_name else None,
        counterparty_identifier=txn_in.counterparty_identifier.strip() if txn_in.counterparty_identifier else None,
        reference_number=txn_in.reference_number.strip() if txn_in.reference_number else None,
        description=txn_in.description.strip() if txn_in.description else None,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


def list_transactions_for_owner(
    db: Session,
    owner_id: uuid.UUID,
    business_id: Optional[uuid.UUID] = None,
    page: int = 1,
    page_size: int = 20,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    flow_type: Optional[str] = None,
    payment_mode: Optional[str] = None,
    category: Optional[str] = None,
) -> Tuple[List[Transaction], int]:
    """
    Lists transactions scoped strictly to businesses owned by owner_id with pagination and SQL-level filters.
    Returns (items, total_count).
    """
    base_conditions = [Business.owner_user_id == owner_id]

    if business_id:
        base_conditions.append(Transaction.business_id == business_id)
    if start_date:
        base_conditions.append(Transaction.transaction_date >= start_date)
    if end_date:
        base_conditions.append(Transaction.transaction_date <= end_date)
    if flow_type:
        base_conditions.append(Transaction.flow_type == flow_type.strip().upper())
    if payment_mode:
        base_conditions.append(Transaction.payment_mode == payment_mode.strip().upper())
    if category:
        base_conditions.append(Transaction.category == category.strip().upper())

    # Count query
    count_stmt = (
        select(func.count(Transaction.id))
        .join(Business, Transaction.business_id == Business.id)
        .where(*base_conditions)
    )
    total = db.execute(count_stmt).scalar_one()

    # Data query with deterministic order and limit/offset
    data_stmt = (
        select(Transaction)
        .join(Business, Transaction.business_id == Business.id)
        .where(*base_conditions)
        .order_by(Transaction.transaction_date.desc(), Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    items = list(db.execute(data_stmt).scalars().all())

    return items, total


def get_transaction_by_id_and_owner(
    db: Session, transaction_id: uuid.UUID, owner_id: uuid.UUID
) -> Optional[Transaction]:
    """
    Fetches a single transaction joining with Business to verify owner_id.
    Returns None if the transaction does not exist or belongs to another tenant.
    """
    stmt = (
        select(Transaction)
        .join(Business, Transaction.business_id == Business.id)
        .where(
            Transaction.id == transaction_id,
            Business.owner_user_id == owner_id,
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def update_transaction_for_owner(
    db: Session,
    transaction_id: uuid.UUID,
    owner_id: uuid.UUID,
    update_data: TransactionUpdate,
) -> Optional[Transaction]:
    """
    Partially updates an existing transaction after verifying owner identity.
    Only allows modifying permitted fields (immutability for id, business_id, import references, flags).
    """
    transaction = get_transaction_by_id_and_owner(db, transaction_id=transaction_id, owner_id=owner_id)
    if not transaction:
        return None

    allowed_fields = {
        "transaction_date",
        "transaction_time",
        "amount",
        "flow_type",
        "payment_mode",
        "category",
        "counterparty_name",
        "counterparty_identifier",
        "reference_number",
        "description",
    }
    updates = update_data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        if field in allowed_fields:
            if isinstance(value, str):
                value = value.strip()
            setattr(transaction, field, value)

    transaction.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(transaction)
    return transaction


def delete_transaction_for_owner(
    db: Session, transaction_id: uuid.UUID, owner_id: uuid.UUID
) -> Optional[bool]:
    """
    Safely deletes a transaction after checking tenant ownership and verifying that
    it is not referenced in active reconciliation records.
    Returns None if not found/not owned.
    Raises TransactionConflictError if referenced by reconciliation pairs.
    """
    transaction = get_transaction_by_id_and_owner(db, transaction_id=transaction_id, owner_id=owner_id)
    if not transaction:
        return None

    # Check for references in reconciliations
    reconciliation_stmt = select(func.count(Reconciliation.id)).where(
        or_(
            Reconciliation.primary_transaction_id == transaction_id,
            Reconciliation.matched_transaction_id == transaction_id,
        )
    )
    rec_count = db.execute(reconciliation_stmt).scalar_one()
    if rec_count > 0:
        raise TransactionConflictError(
            "Cannot delete transaction because it is referenced in financial reconciliation records."
        )

    db.delete(transaction)
    db.commit()
    return True
