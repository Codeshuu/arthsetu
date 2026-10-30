import os
import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.user import User
from app.models.business import Business
from app.models.import_batch import ImportBatch
from app.models.import_row import ImportRow
from app.models.transaction import Transaction
from app.services.import_service import ImportService
from app.services.duplicate_service import DuplicateService


@pytest.fixture
def db_session(tmp_path):
    """Creates an isolated in-memory/temp SQLite database session for testing."""
    db_file = tmp_path / "test_imports.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Seed test user and business
    user = User(id="user-1", email="test@kirana.com", hashed_password="dummy_hash", full_name="Kirana Owner")
    session.add(user)
    session.flush()

    business = Business(
        id="biz-1",
        owner_user_id=user.id,
        legal_name="Kirana Store",
        trade_name="Kirana Supermart",
        gstin="27ABCDE1234F1Z5"
    )
    session.add(business)
    session.commit()

    yield session
    session.close()


def test_duplicate_service_fingerprints():
    fp1 = DuplicateService.generate_fingerprint(
        transaction_date="2026-01-05",
        amount=500.0,
        reference_number="UPI12345",
        counterparty_name="Customer A"
    )
    fp2 = DuplicateService.generate_fingerprint(
        transaction_date="2026-01-05",
        amount=500.0,
        reference_number="UPI12345",
        counterparty_name="Customer B"
    )
    # Matching date, amount, reference number produces identical fingerprint
    assert fp1 == fp2

    fp3 = DuplicateService.generate_fingerprint(
        transaction_date="2026-01-06",
        amount=500.0,
        reference_number="UPI12345"
    )
    assert fp1 != fp3


def test_in_batch_duplicates():
    records = [
        {"transaction_date": "2026-01-05", "amount": 250.0, "reference_number": "REF001"},
        {"transaction_date": "2026-01-05", "amount": 350.0, "reference_number": "REF002"},
        {"transaction_date": "2026-01-05", "amount": 250.0, "reference_number": "REF001"},  # Duplicate of record 0
    ]
    results = DuplicateService.check_in_batch_duplicates(records)
    assert results[0][1] is False
    assert results[1][1] is False
    assert results[2][1] is True  # In-batch duplicate


def test_save_and_initiate_batch(db_session):
    csv_content = b"""Date,Amount,Type,Ref,Narration
2026-01-01,1000,CR,UPI001,Sale payment
2026-01-02,500,DR,UPI002,Grocery purchase
"""
    batch, meta, is_dup = ImportService.save_and_initiate_batch(
        file_bytes=csv_content,
        filename="test_upload.csv",
        business_id="biz-1",
        db=db_session
    )
    assert batch.id is not None
    assert meta["total_rows_detected"] == 2
    assert is_dup is False
    assert len(meta["sample_rows"]) == 2

    # Uploading identical file for same business flags duplicate batch
    batch2, meta2, is_dup2 = ImportService.save_and_initiate_batch(
        file_bytes=csv_content,
        filename="test_upload_again.csv",
        business_id="biz-1",
        db=db_session
    )
    assert is_dup2 is True


def test_full_import_and_commit_pipeline(db_session):
    csv_content = b"""Date,Amount,Type,Ref,Narration,Party
2026-01-05,45000.00,CREDIT,TXN001,Client Payment,Alpha Enterprises
2026-01-08,15000.00,DEBIT,TXN002,Office Rent,Metro Properties
2026-01-12,3200.00,DEBIT,TXN003,Cloud Hosting,AWS Cloud
2026-01-05,45000.00,CREDIT,TXN001,Client Payment,Alpha Enterprises
"""
    batch, meta, _ = ImportService.save_and_initiate_batch(
        file_bytes=csv_content,
        filename="pipeline_test.csv",
        business_id="biz-1",
        db=db_session
    )

    mapping = {
        "date": "Date",
        "amount": "Amount",
        "flow_type": "Type",
        "reference_number": "Ref",
        "description": "Narration",
        "counterparty_name": "Party",
    }

    # Map columns and validate
    validation_res = ImportService.map_columns_and_validate(
        batch_id=batch.id,
        business_id="biz-1",
        mapping=mapping,
        default_payment_mode="UPI",
        default_flow_type=None,
        db=db_session
    )

    assert validation_res["total_rows"] == 4
    assert validation_res["valid_rows"] == 3
    assert validation_res["duplicate_rows"] == 1  # Fourth row is duplicate of first

    # Commit batch
    commit_res = ImportService.commit_batch_to_transactions(
        batch_id=batch.id,
        business_id="biz-1",
        overwrite_duplicates=False,
        db=db_session
    )

    assert commit_res["imported_records_count"] == 3
    assert commit_res["status"] == "COMMITTED"

    # Verify transactions in database
    txns = db_session.query(Transaction).filter(Transaction.business_id == "biz-1").all()
    assert len(txns) == 3

    amounts = [float(t.amount) for t in txns]
    assert 45000.0 in amounts
    assert 15000.0 in amounts
    assert 3200.0 in amounts


def test_cross_batch_duplicate_prevention(db_session):
    # First batch
    csv1 = b"""Date,Amount,Type,Ref
2026-02-01,750.00,CR,UPI888
"""
    batch1, _, _ = ImportService.save_and_initiate_batch(csv1, "b1.csv", "biz-1", db_session)
    ImportService.map_columns_and_validate(batch1.id, "biz-1", {"date": "Date", "amount": "Amount", "flow_type": "Type", "reference_number": "Ref"}, "UPI", None, db_session)
    res1 = ImportService.commit_batch_to_transactions(batch1.id, "biz-1", False, db_session)
    assert res1["imported_records_count"] == 1

    # Second batch with same transaction
    csv2 = b"""Date,Amount,Type,Ref
2026-02-01,750.00,CR,UPI888
2026-02-02,950.00,CR,UPI999
"""
    batch2, _, _ = ImportService.save_and_initiate_batch(csv2, "b2.csv", "biz-1", db_session)
    ImportService.map_columns_and_validate(batch2.id, "biz-1", {"date": "Date", "amount": "Amount", "flow_type": "Type", "reference_number": "Ref"}, "UPI", None, db_session)
    res2 = ImportService.commit_batch_to_transactions(batch2.id, "biz-1", False, db_session)

    # 1 skipped because UPI888 already committed from batch1, 1 new imported (UPI999)
    assert res2["skipped_duplicates_count"] == 1
    assert res2["imported_records_count"] == 1
