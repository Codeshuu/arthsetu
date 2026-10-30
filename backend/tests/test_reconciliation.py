import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.user import User
from app.models.business import Business
from app.models.source import Source
from app.models.transaction import Transaction
from app.models.reconciliation import Reconciliation
from app.services.reconciliation_service import ReconciliationService


@pytest.fixture
def db_session(tmp_path):
    db_file = tmp_path / "test_reconciliation.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = User(id="user-1", email="owner@kirana.com", hashed_password="pwd", full_name="Owner")
    session.add(user)
    session.flush()

    business = Business(id="biz-1", owner_user_id=user.id, legal_name="Kirana Store")
    session.add(business)
    session.flush()

    # Sources
    s_upi = Source(id="src-upi", business_id="biz-1", source_type="UPI_EXPORT", source_name="PhonePe QR")
    s_bank = Source(id="src-bank", business_id="biz-1", source_type="BANK_STATEMENT", source_name="HDFC Current A/c")
    session.add_all([s_upi, s_bank])
    session.commit()

    yield session
    session.close()


def test_reconciliation_utr_match(db_session):
    # Transaction 1: Recorded in UPI export
    t1 = Transaction(
        id="txn-1",
        business_id="biz-1",
        source_id="src-upi",
        transaction_date=date(2026, 3, 10),
        amount=2500.00,
        flow_type="INFLOW",
        payment_mode="UPI",
        reference_number="UTR987654321",
        verification_status="SELF_DECLARED"
    )
    # Transaction 2: Recorded in Bank Statement
    t2 = Transaction(
        id="txn-2",
        business_id="biz-1",
        source_id="src-bank",
        transaction_date=date(2026, 3, 11),  # Next day settlement
        amount=2500.00,
        flow_type="INFLOW",
        payment_mode="NET_BANKING",
        reference_number="UTR987654321",
        verification_status="STATEMENT_BACKED"
    )
    db_session.add_all([t1, t2])
    db_session.commit()

    candidates = ReconciliationService.find_candidates(db_session, "biz-1")
    assert len(candidates) == 1
    assert candidates[0]["confidence_score"] == 0.99
    assert candidates[0]["match_rule"] == "UTR_MATCH"


def test_reconciliation_same_date_match(db_session):
    t1 = Transaction(
        id="txn-3",
        business_id="biz-1",
        source_id="src-upi",
        transaction_date=date(2026, 3, 15),
        amount=1200.00,
        flow_type="INFLOW",
        payment_mode="UPI",
        description="Customer payment at counter",
        verification_status="SELF_DECLARED"
    )
    t2 = Transaction(
        id="txn-4",
        business_id="biz-1",
        source_id="src-bank",
        transaction_date=date(2026, 3, 15),
        amount=1200.00,
        flow_type="INFLOW",
        payment_mode="NET_BANKING",
        description="CMS inward credit",
        verification_status="STATEMENT_BACKED"
    )
    db_session.add_all([t1, t2])
    db_session.commit()

    candidates = ReconciliationService.find_candidates(db_session, "biz-1")
    assert len(candidates) == 1
    assert candidates[0]["confidence_score"] == 0.90
    assert candidates[0]["match_rule"] == "EXACT_AMOUNT_DATE"


def test_resolve_accept_updates_verification_status(db_session):
    t1 = Transaction(
        id="txn-5",
        business_id="biz-1",
        transaction_date=date(2026, 3, 20),
        amount=800.00,
        flow_type="INFLOW",
        reference_number="REF555",
        verification_status="SELF_DECLARED"
    )
    t2 = Transaction(
        id="txn-6",
        business_id="biz-1",
        transaction_date=date(2026, 3, 20),
        amount=800.00,
        flow_type="INFLOW",
        reference_number="REF555",
        verification_status="STATEMENT_BACKED"
    )
    db_session.add_all([t1, t2])
    db_session.commit()

    candidates = ReconciliationService.find_candidates(db_session, "biz-1")
    recon_id = candidates[0]["id"]

    # Resolve with ACCEPT
    res = ReconciliationService.resolve_match(
        db=db_session,
        business_id="biz-1",
        action="ACCEPT",
        reconciliation_id=recon_id,
        review_notes="Verified via PhonePe merchant QR receipt"
    )

    assert res["status"] == "ACCEPTED"

    # Transactions should now be upgraded to RECONCILED
    db_session.refresh(t1)
    db_session.refresh(t2)
    assert t1.verification_status == "RECONCILED"
    assert t2.verification_status == "RECONCILED"


def test_resolve_reject_preserves_unreconciled_status(db_session):
    t1 = Transaction(
        id="txn-7",
        business_id="biz-1",
        transaction_date=date(2026, 3, 22),
        amount=3000.00,
        flow_type="INFLOW",
        verification_status="SELF_DECLARED"
    )
    t2 = Transaction(
        id="txn-8",
        business_id="biz-1",
        transaction_date=date(2026, 3, 24),  # 2 days later
        amount=3000.00,
        flow_type="INFLOW",
        verification_status="STATEMENT_BACKED"
    )
    db_session.add_all([t1, t2])
    db_session.commit()

    candidates = ReconciliationService.find_candidates(db_session, "biz-1")
    recon_id = candidates[0]["id"]

    res = ReconciliationService.resolve_match(
        db=db_session,
        business_id="biz-1",
        action="REJECT",
        reconciliation_id=recon_id,
        review_notes="Different transactions coincidentally matching amount"
    )
    assert res["status"] == "REJECTED"

    db_session.refresh(t1)
    db_session.refresh(t2)
    assert t1.verification_status == "SELF_DECLARED"
    assert t2.verification_status == "STATEMENT_BACKED"

    # Future candidate search should not return rejected pair
    candidates_after = ReconciliationService.find_candidates(db_session, "biz-1")
    assert len(candidates_after) == 0
