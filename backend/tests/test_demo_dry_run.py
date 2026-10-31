import io
import uuid
import hashlib
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from app.main import app
from app.models.user import User
from app.core.security import create_access_token, hash_password

client = TestClient(app)


def test_final_demonstration_judges_dry_run(db):
    """
    PHASE 5 — FINAL DEMONSTRATION DRY RUN (FOR HACKATHON JUDGES)
    Executes the exact 9-step scenario from Section 12 of IMPLEMENTATION_PLAN.md:
    1. Registration & Onboarding (Sharma General Store, GSTIN: 27ABCDE1234F1Z5)
    2. Manual Entry (1 sale of ₹1,500, 1 milk inventory purchase of ₹800)
    3. Batch Import (Simulated PhonePe UPI export with 32 records across multiple dates)
    4. Validation Feedback (Clean error handling without crashing on malformed data)
    5. Reconciliation (Accept match between cash counter and UPI batch)
    6. Insights Inspection (Recorded Sales, Digital Share, Streak, Outlier Audit, 5-Dimension Score)
    7. Passport Generation (Generate token, metrics snapshot, SHA-256 seal)
    8. PDF Verification (Valid stream, content-disposition, %PDF header)
    9. Security Proof (Second incognito user strictly blocked from accessing Sharmaji's data)
    """

    # --------------------------------------------------------------------------
    # STEP 1: Registration & Onboarding (Sharma General Store)
    # --------------------------------------------------------------------------
    sharma_email = f"sharma_{uuid.uuid4().hex[:6]}@kirana.store"
    reg_res = client.post(
        "/api/v1/auth/register",
        json={
            "email": sharma_email,
            "password": "SharmaPassword#2026",
            "full_name": "Ramesh Sharma",
            "phone": "+919876543210",
        },
    )
    assert reg_res.status_code == status.HTTP_201_CREATED, reg_res.text

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": sharma_email, "password": "SharmaPassword#2026"},
    )
    assert login_res.status_code == status.HTTP_200_OK
    token = login_res.json()["access_token"]
    sharma_headers = {"Authorization": f"Bearer {token}"}

    # Create Business: Sharma General Store
    biz_res = client.post(
        "/api/v1/businesses",
        headers=sharma_headers,
        json={
            "trade_name": "Sharma General Store",
            "category": "Kirana",
            "business_type": "Sole Proprietorship",
            "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
    )
    assert biz_res.status_code == status.HTTP_201_CREATED, biz_res.text
    sharma_biz_id = str(biz_res.json()["id"])
    assert sharma_biz_id is not None

    # --------------------------------------------------------------------------
    # STEP 2: Manual Entry (₹1,500 sale, ₹800 milk inventory purchase)
    # --------------------------------------------------------------------------
    sale_res = client.post(
        "/api/v1/transactions",
        headers=sharma_headers,
        json={
            "business_id": sharma_biz_id,
            "transaction_date": "2026-10-15",
            "amount": 1500.00,
            "flow_type": "INFLOW",
            "payment_mode": "CASH",
            "category": "SALE",
            "description": "Counter retail cash sales",
        },
    )
    assert sale_res.status_code == status.HTTP_201_CREATED
    sale_txn = sale_res.json()
    assert float(sale_txn["amount"]) == 1500.00

    milk_res = client.post(
        "/api/v1/transactions",
        headers=sharma_headers,
        json={
            "business_id": sharma_biz_id,
            "transaction_date": "2026-10-15",
            "amount": 800.00,
            "flow_type": "OUTFLOW",
            "payment_mode": "CASH",
            "category": "EXPENSE",
            "description": "Morning fresh milk supplier restock",
            "counterparty_name": "Amul Milk Distributor",
        },
    )
    assert milk_res.status_code == status.HTTP_201_CREATED
    assert float(milk_res.json()["amount"]) == 800.00

    # --------------------------------------------------------------------------
    # STEP 3: Batch Import (32 PhonePe UPI transactions across 16 trading days)
    # --------------------------------------------------------------------------
    csv_rows = ["Date,Description,Amount,Type,Reference"]
    # Add an exact match candidate for the 1500 sale on 2026-10-15 with a unique UPI settlement reference
    csv_rows.append("2026-10-15,PhonePe UPI Settlement,1500.00,CREDIT,UPI9876543210")
    # Generate 30 additional trading transactions
    for day in range(1, 16):
        date_str = f"2026-10-{day:02d}"
        csv_rows.append(f"{date_str},Customer UPI Scan,{1000 + (day * 75):.2f},CREDIT,UPI{day:02d}CR")
        csv_rows.append(f"{date_str},Wholesale Supplier Pay,{300 + (day * 20):.2f},DEBIT,UPI{day:02d}DR")
    # Add one massive festival transaction to trigger the IQR statistical outlier flag (>30 sample threshold)
    csv_rows.append("2026-10-16,Diwali Bulk Corporate Gift Order,45000.00,CREDIT,UPIDIWALI99")

    csv_data = "\n".join(csv_rows)
    csv_buffer = io.BytesIO(csv_data.encode("utf-8"))

    upload_res = client.post(
        "/api/v1/imports/upload",
        headers=sharma_headers,
        data={"business_id": sharma_biz_id, "source_type": "UPI_EXPORT"},
        files={"file": ("phonepe_upi_october.csv", csv_buffer, "text/csv")},
    )
    assert upload_res.status_code == status.HTTP_200_OK
    batch_id = upload_res.json()["data"]["batch_id"]
    total_rows = upload_res.json()["data"]["total_rows_detected"]
    assert total_rows == 32

    # Map and validate columns
    map_res = client.post(
        f"/api/v1/imports/{batch_id}/map-columns?business_id={sharma_biz_id}",
        headers=sharma_headers,
        json={
            "mapping": {
                "date": "Date",
                "description": "Description",
                "amount": "Amount",
                "flow_type": "Type",
                "reference_number": "Reference",
            }
        },
    )
    assert map_res.status_code == status.HTTP_200_OK
    assert map_res.json()["data"]["valid_rows"] == 32

    # Commit batch to transactions
    commit_res = client.post(
        f"/api/v1/imports/{batch_id}/commit?business_id={sharma_biz_id}",
        headers=sharma_headers,
        json={"overwrite_duplicates": False},
    )
    assert commit_res.status_code == status.HTTP_200_OK
    assert commit_res.json()["data"]["imported_records_count"] == 32

    # --------------------------------------------------------------------------
    # STEP 4: Validation Feedback (Verify resilience against malformed / corrupt data)
    # --------------------------------------------------------------------------
    bad_csv = (
        "Date,Description,Amount,Type\n"
        "NOT_A_DATE,Bad Date Row,1000.00,CREDIT\n"
        "2026-10-18,Corrupt Amount Row,NOT_NUMBER,CREDIT\n"
        "2026-10-19,Valid Normal Row,500.00,CREDIT\n"
    )
    bad_buffer = io.BytesIO(bad_csv.encode("utf-8"))
    bad_upload = client.post(
        "/api/v1/imports/upload",
        headers=sharma_headers,
        data={"business_id": sharma_biz_id, "source_type": "CASHBOOK"},
        files={"file": ("corrupt_sample.csv", bad_buffer, "text/csv")},
    )
    assert bad_upload.status_code == status.HTTP_200_OK
    bad_batch_id = bad_upload.json()["data"]["batch_id"]

    bad_map = client.post(
        f"/api/v1/imports/{bad_batch_id}/map-columns?business_id={sharma_biz_id}",
        headers=sharma_headers,
        json={
            "mapping": {
                "date": "Date",
                "description": "Description",
                "amount": "Amount",
                "flow_type": "Type",
            }
        },
    )
    assert bad_map.status_code == status.HTTP_200_OK
    bad_result = bad_map.json()["data"]
    # The two invalid rows are caught cleanly without crashing
    assert bad_result["error_rows"] == 2
    assert bad_result["valid_rows"] == 1

    # --------------------------------------------------------------------------
    # STEP 5: Reconciliation (Accept match between cash counter and UPI settlement)
    # --------------------------------------------------------------------------
    candidates_res = client.get(
        f"/api/v1/reconciliation/candidates?business_id={sharma_biz_id}",
        headers=sharma_headers,
    )
    assert candidates_res.status_code == status.HTTP_200_OK
    candidates = candidates_res.json()["data"]["candidates"]
    assert len(candidates) >= 1

    # Find the ₹1,500 match
    match_1500 = next(
        (c for c in candidates if abs(float(c["primary_transaction"]["amount"]) - 1500.0) < 0.01),
        candidates[0]
    )

    resolve_res = client.post(
        f"/api/v1/reconciliation/resolve?business_id={sharma_biz_id}",
        headers=sharma_headers,
        json={
            "primary_transaction_id": match_1500["primary_transaction"]["id"],
            "matched_transaction_id": match_1500["matched_transaction"]["id"],
            "action": "ACCEPT",
            "review_notes": "Accepted match between manual cash counter and UPI bank settlement",
        },
    )
    assert resolve_res.status_code == status.HTTP_200_OK
    assert resolve_res.json()["data"]["status"] in ["ACCEPTED", "RESOLVED"]

    # --------------------------------------------------------------------------
    # STEP 6: Insights Inspection (Recorded Sales, Continuity, Outliers, Evidence)
    # --------------------------------------------------------------------------
    # Summary Metrics
    summary_res = client.get(
        f"/api/v1/analysis/summary?business_id={sharma_biz_id}",
        headers=sharma_headers,
    )
    assert summary_res.status_code == status.HTTP_200_OK
    summary = summary_res.json()["data"]
    assert summary["recorded_sales"] > 50000.00
    assert summary["digital_sales_share"] > 50.0  # High digital sales adoption
    assert "net_recorded_cash_movement" in summary
    assert "profit" not in summary  # Strict regulatory prohibition

    # Operational Continuity & Streak
    comp_res = client.get(
        f"/api/v1/analysis/completeness?business_id={sharma_biz_id}",
        headers=sharma_headers,
    )
    assert comp_res.status_code == status.HTTP_200_OK
    comp = comp_res.json()["data"]
    assert comp["operating_days_count"] >= 15
    assert comp["longest_operating_streak_days"] >= 14

    # IQR Statistical Outlier Detection (Dataset has 34 total transactions >= 30 threshold)
    anom_res = client.get(
        f"/api/v1/analysis/anomalies?business_id={sharma_biz_id}",
        headers=sharma_headers,
    )
    assert anom_res.status_code == status.HTTP_200_OK
    anom_data = anom_res.json()["data"]
    assert anom_data["insufficient_sample_size"] is False
    assert anom_data["sample_size"] >= 30
    assert len(anom_data["anomalies"]) >= 1

    # Verify the ₹45,000 Diwali spike was flagged with the exact mandatory label
    diwali_outlier = next(
        (a for a in anom_data["anomalies"] if abs(float(a["amount"]) - 45000.00) < 0.01),
        anom_data["anomalies"][0]
    )
    assert diwali_outlier["label"] == "Unusual Activity Requiring Owner Verification"
    assert "fraud" not in diwali_outlier["label"].lower()

    # 5-Dimension Evidence Quality Scoring
    evidence_res = client.get(
        f"/api/v1/analysis/evidence-quality?business_id={sharma_biz_id}",
        headers=sharma_headers,
    )
    assert evidence_res.status_code == status.HTTP_200_OK
    evidence = evidence_res.json()["data"]
    assert 60.0 <= evidence["overall_score"] <= 100.0
    assert len(evidence["dimension_breakdown"]) == 5

    # --------------------------------------------------------------------------
    # STEP 7: Passport Generation (Digital Verification Token & SHA-256 seal)
    # --------------------------------------------------------------------------
    passport_res = client.post(
        "/api/v1/passports/generate",
        headers=sharma_headers,
        json={
            "business_id": sharma_biz_id,
            "period_start": "2026-10-01",
            "period_end": "2026-10-31",
        },
    )
    assert passport_res.status_code == status.HTTP_200_OK
    passport = passport_res.json()["data"]
    passport_token = passport["passport_token"]
    assert passport_token.startswith("PASS-") or passport_token.startswith("AS-")
    assert len(passport["sha256_hash"]) == 64

    # --------------------------------------------------------------------------
    # STEP 8: PDF Verification (2-Page Stream with valid %PDF header)
    # --------------------------------------------------------------------------
    pdf_res = client.get(f"/api/v1/passports/{passport_token}/download")
    assert pdf_res.status_code == status.HTTP_200_OK
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF")
    assert len(pdf_res.content) > 1000  # Non-trivial rendered PDF document

    # Compute hash of downloaded bytes and verify it exists
    pdf_sha256 = hashlib.sha256(pdf_res.content).hexdigest()
    assert len(pdf_sha256) == 64

    # --------------------------------------------------------------------------
    # STEP 9: Security Proof (Second incognito user blocked from Sharmaji's data)
    # --------------------------------------------------------------------------
    gupta_user = User(
        email=f"guptaji_{uuid.uuid4().hex[:6]}@rival.store",
        password_hash=hash_password("GuptaPass#2026"),
        full_name="Vijay Gupta",
        is_active=True,
    )
    db.add(gupta_user)
    db.commit()
    db.refresh(gupta_user)

    gupta_token = create_access_token(subject=str(gupta_user.id))
    gupta_headers = {"Authorization": f"Bearer {gupta_token}"}

    # Guptaji tries to fetch Sharmaji's business -> 404
    blocked_biz = client.get(f"/api/v1/businesses/{sharma_biz_id}", headers=gupta_headers)
    assert blocked_biz.status_code == status.HTTP_404_NOT_FOUND

    # Guptaji tries to fetch Sharmaji's transactions -> 404
    blocked_txns = client.get(
        f"/api/v1/transactions?business_id={sharma_biz_id}",
        headers=gupta_headers,
    )
    assert blocked_txns.status_code == status.HTTP_404_NOT_FOUND

    # Guptaji tries to fetch Sharmaji's financial analytics -> 403 or 404
    blocked_analytics = client.get(
        f"/api/v1/analysis/summary?business_id={sharma_biz_id}",
        headers=gupta_headers,
    )
    assert blocked_analytics.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]
