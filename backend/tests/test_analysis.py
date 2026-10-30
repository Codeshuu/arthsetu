import os
import pytest
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.models.user import User
from app.models.business import Business
from app.models.transaction import Transaction
from app.models.passport import Passport
from app.services.metrics_service import MetricsService
from app.services.completeness_service import CompletenessService
from app.services.anomaly_service import AnomalyService
from app.services.evidence_service import EvidenceService
from app.services.passport_service import PassportService


@pytest.fixture
def db_session(tmp_path):
    db_file = tmp_path / "test_analysis.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    user = User(id="user-t4", email="owner@kirana-analytics.com", hashed_password="pwd", full_name="Owner")
    session.add(user)
    session.flush()

    business = Business(
        id="biz-t4",
        owner_user_id=user.id,
        legal_name="Gupta General Store",
        trade_name="Gupta Kirana",
        gstin="07AAAAA0000A1Z5",
        pan="AAAAA0000A",
        business_type="Retailer",
        category="Grocery"
    )
    session.add(business)
    session.commit()

    yield session
    session.close()


def test_metrics_calculation_standard():
    transactions = [
        {"transaction_date": "2026-01-01", "amount": 10000.0, "flow_type": "INFLOW", "category": "SALE", "payment_mode": "UPI"},
        {"transaction_date": "2026-01-02", "amount": 5000.0, "flow_type": "INFLOW", "category": "SALE", "payment_mode": "CASH"},
        {"transaction_date": "2026-01-03", "amount": 3000.0, "flow_type": "OUTFLOW", "category": "EXPENSE", "payment_mode": "NET_BANKING"},
    ]

    res = MetricsService.calculate_metrics_from_records(transactions)

    assert res["recorded_sales"] == 15000.0
    assert res["recorded_expenses"] == 3000.0
    assert res["net_recorded_cash_movement"] == 12000.0
    assert "profit" not in res  # Prohibited term check
    assert res["digital_recorded_sales"] == 10000.0
    assert res["cash_recorded_sales"] == 5000.0
    # 10000 / 15000 = 66.67%
    assert res["digital_sales_share"] == 66.67
    # 3000 / 15000 = 20.0%
    assert res["expense_to_sales_ratio"] == 20.0


def test_metrics_calculation_zero_division_guard():
    # Zero transactions
    res_empty = MetricsService.calculate_metrics_from_records([])
    assert res_empty["recorded_sales"] == 0.0
    assert res_empty["recorded_expenses"] == 0.0
    assert res_empty["net_recorded_cash_movement"] == 0.0
    assert res_empty["digital_sales_share"] == 0.0
    assert res_empty["expense_to_sales_ratio"] == 0.0

    # Only expenses, zero sales
    only_expenses = [
        {"transaction_date": "2026-01-01", "amount": 400.0, "flow_type": "OUTFLOW", "category": "EXPENSE"}
    ]
    res_exp = MetricsService.calculate_metrics_from_records(only_expenses)
    assert res_exp["recorded_sales"] == 0.0
    assert res_exp["recorded_expenses"] == 400.0
    assert res_exp["net_recorded_cash_movement"] == -400.0
    assert res_exp["digital_sales_share"] == 0.0
    assert res_exp["expense_to_sales_ratio"] == 0.0


def test_completeness_operating_day_coverage():
    # 3 operating days spanning 2026-01-01 to 2026-01-05 (5 calendar days)
    transactions = [
        {"transaction_date": "2026-01-01", "amount": 100},
        {"transaction_date": "2026-01-02", "amount": 200},
        {"transaction_date": "2026-01-02", "amount": 150},  # Same day, second transaction
        {"transaction_date": "2026-01-05", "amount": 300},
    ]

    res = CompletenessService.calculate_completeness(
        transactions,
        start_date=date(2026, 1, 1),
        end_date=date(2026, 1, 5)
    )

    assert res["total_calendar_days"] == 5
    assert res["operating_days_count"] == 3
    # 3 / 5 = 60.0%
    assert res["operating_day_coverage"] == 60.0
    assert "2026-01-03" in res["missing_dates"]
    assert "2026-01-04" in res["missing_dates"]
    assert res["longest_operating_streak_days"] == 2  # Jan 1 & Jan 2


def test_anomaly_insufficient_sample_size_guard():
    # Less than 30 transactions
    small_dataset = [
        {"id": f"txn-{i}", "transaction_date": "2026-01-01", "amount": 100.0 + i}
        for i in range(25)
    ]
    res = AnomalyService.detect_anomalies(small_dataset)
    assert res["insufficient_sample_size"] is True
    assert res["total_anomalies"] == 0


def test_anomaly_iqr_detection_and_labeling():
    # 35 transactions: 34 normal transactions (₹100 to ₹500) and 1 extreme outlier (₹50,000)
    txns = [
        {
            "id": f"txn-{i}",
            "transaction_date": "2026-01-01",
            "amount": 200.0 + (i * 5),
            "category": "SALE",
            "flow_type": "INFLOW"
        }
        for i in range(34)
    ]
    # Add outlier
    txns.append({
        "id": "txn-outlier",
        "transaction_date": "2026-01-20",
        "amount": 50000.0,
        "category": "SALE",
        "flow_type": "INFLOW"
    })

    res = AnomalyService.detect_anomalies(txns)
    assert res["insufficient_sample_size"] is False
    assert res["total_anomalies"] >= 1

    outlier_item = [a for a in res["anomalies"] if a["transaction_id"] == "txn-outlier"][0]
    assert outlier_item["label"] == "Unusual Activity Requiring Owner Verification"
    assert "fraud" not in outlier_item["label"].lower()
    assert "fraud" not in outlier_item["reason"].lower()


def test_evidence_quality_scoring():
    txns = [
        {
            "reference_number": "UTR123456",
            "counterparty_name": "Sharma Stores",
            "description": "Counter UPI payment",
            "verification_status": "STATEMENT_BACKED",
            "is_flagged": False,
            "source_type": "BANK_STATEMENT"
        },
        {
            "reference_number": "UPI9999",
            "counterparty_name": "Verma Mart",
            "description": "Milk purchase",
            "verification_status": "RECONCILED",
            "is_flagged": False,
            "source_type": "UPI_EXPORT"
        }
    ]

    ev = EvidenceService.calculate_evidence_quality(txns)
    assert 0.0 <= ev["overall_score"] <= 100.0
    assert len(ev["dimension_breakdown"]) == 5
    dims = [d["dimension"] for d in ev["dimension_breakdown"]]
    assert "Provenance" in dims
    assert "Source Status" in dims
    assert "Completeness" in dims
    assert "Consistency" in dims
    assert "Traceability" in dims


def test_passport_pdf_generation_end_to_end(db_session):
    # Seed 5 sample transactions for Gupta Kirana
    for i in range(5):
        txn = Transaction(
            id=f"txn-p-{i}",
            business_id="biz-t4",
            transaction_date=date(2026, 1, 10 + i),
            amount=1500.0 * (i + 1),
            flow_type="INFLOW",
            payment_mode="UPI",
            category="SALE",
            reference_number=f"UPIREF{i}",
            description=f"Wholesale sale {i}",
            verification_status="STATEMENT_BACKED",
        )
        db_session.add(txn)
    db_session.commit()

    passport = PassportService.create_and_freeze_passport(
        db=db_session,
        business_id="biz-t4",
        period_start=date(2026, 1, 1),
        period_end=date(2026, 1, 31),
    )

    assert passport.id is not None
    assert passport.passport_token.startswith("PASS-")
    assert os.path.exists(passport.pdf_filepath)
    assert os.path.getsize(passport.pdf_filepath) > 1000  # Multi-KB valid PDF
    assert len(passport.sha256_hash) == 64
    assert passport.metrics_snapshot["recorded_sales"] > 0
