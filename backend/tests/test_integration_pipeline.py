import io
import uuid
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token, hash_password
from app.models.user import User

client = TestClient(app)


def test_full_platform_integration_pipeline(db):
    """
    PHASE 4 MASTER PIPELINE TEST
    Validates end-to-end integration across all 4 teammate modules:
    Auth -> Business -> CSV Ingestion -> Commits -> Reconciliation -> Analysis -> Passport -> Multi-Tenant Isolation
    """
    # ---------------------------------------------------------
    # 1. USER REGISTRATION & AUTHENTICATION (Teammate 2)
    # ---------------------------------------------------------
    owner_email = f"owner_{uuid.uuid4().hex[:8]}@kirana.store"
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": owner_email,
            "password": "SecurePassword#123",
            "full_name": "Ramesh Patel",
        },
    )
    assert reg_resp.status_code == status.HTTP_201_CREATED, reg_resp.text
    user_data = reg_resp.json()
    assert user_data["email"] == owner_email

    # Login to obtain JWT
    login_resp = client.post(
        "/api/v1/auth/login",
        json={
            "email": owner_email,
            "password": "SecurePassword#123",
        },
    )
    assert login_resp.status_code == status.HTTP_200_OK, login_resp.text
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify identity via /auth/me
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == status.HTTP_200_OK
    assert me_resp.json()["full_name"] == "Ramesh Patel"

    # ---------------------------------------------------------
    # 2. BUSINESS PROFILE CREATION (Teammate 2)
    # ---------------------------------------------------------
    biz_resp = client.post(
        "/api/v1/businesses",
        headers=headers,
        json={
            "trade_name": "Lakshmi Kirana",
            "category": "Kirana",
            "business_type": "Sole Proprietorship",
            "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
    )
    assert biz_resp.status_code == status.HTTP_201_CREATED, biz_resp.text
    business_id = str(biz_resp.json()["id"])
    assert business_id is not None

    # Verify business listing
    biz_list = client.get("/api/v1/businesses", headers=headers)
    assert biz_list.status_code == status.HTTP_200_OK
    assert len(biz_list.json()) >= 1

    # ---------------------------------------------------------
    # 3. CSV DATA INGESTION & BATCH PIPELINE (Teammate 3)
    # ---------------------------------------------------------
    csv_content = (
        "Date,Description,Amount,Type\n"
        "2026-10-01,Customer UPI Payment,1500.00,CREDIT\n"
        "2026-10-02,Milk Supplier Wholesale,800.00,DEBIT\n"
        "2026-10-03,Daily Cash Sales,2500.00,CREDIT\n"
        "2026-10-04,Electricity Utility Bill,450.00,DEBIT\n"
        "2026-10-05,Kirana FMCG Stock Delivery,1200.00,DEBIT\n"
        "2026-10-06,Customer PhonePe Payment,3500.00,CREDIT\n"
    )
    csv_file = io.BytesIO(csv_content.encode("utf-8"))

    # Upload CSV
    upload_resp = client.post(
        "/api/v1/imports/upload",
        headers=headers,
        data={"business_id": business_id, "source_type": "BANK_STATEMENT"},
        files={"file": ("transactions_oct.csv", csv_file, "text/csv")},
    )
    assert upload_resp.status_code == status.HTTP_200_OK, upload_resp.text
    upload_data = upload_resp.json()
    assert upload_data["success"] is True
    batch_id = upload_data["data"]["batch_id"]
    assert upload_data["data"]["total_rows_detected"] == 6

    # Column Mapping & Validation
    mapping_resp = client.post(
        f"/api/v1/imports/{batch_id}/map-columns?business_id={business_id}",
        headers=headers,
        json={
            "mapping": {
                "date": "Date",
                "description": "Description",
                "amount": "Amount",
                "flow_type": "Type",
            }
        },
    )
    assert mapping_resp.status_code == status.HTTP_200_OK, mapping_resp.text
    map_data = mapping_resp.json()["data"]
    assert map_data["valid_rows"] == 6

    # Batch Commit to Transactions
    commit_resp = client.post(
        f"/api/v1/imports/{batch_id}/commit?business_id={business_id}",
        headers=headers,
        json={"overwrite_duplicates": False},
    )
    assert commit_resp.status_code == status.HTTP_200_OK, commit_resp.text
    commit_data = commit_resp.json()["data"]
    assert commit_data["imported_records_count"] == 6
    assert commit_data["status"] == "COMMITTED"

    # Verify committed transactions via GET /transactions
    txns_resp = client.get(
        f"/api/v1/transactions?business_id={business_id}&page=1&page_size=20",
        headers=headers,
    )
    assert txns_resp.status_code == status.HTTP_200_OK
    txn_list = txns_resp.json()
    assert txn_list["total"] == 6

    # ---------------------------------------------------------
    # 4. DUPLICATE INGESTION DETECTION (Teammate 3)
    # ---------------------------------------------------------
    # Uploading the exact same file flags duplicate batch detection via SHA-256
    csv_file2 = io.BytesIO(csv_content.encode("utf-8"))
    upload_dupe = client.post(
        "/api/v1/imports/upload",
        headers=headers,
        data={"business_id": business_id, "source_type": "BANK_STATEMENT"},
        files={"file": ("transactions_oct_copy.csv", csv_file2, "text/csv")},
    )
    assert upload_dupe.status_code == status.HTTP_200_OK
    assert upload_dupe.json()["data"]["is_duplicate_batch"] is True

    # ---------------------------------------------------------
    # 5. RECONCILIATION MATCH & RESOLUTION (Teammate 3)
    # ---------------------------------------------------------
    # Add a complementary counter cash/UPI entry for 1500 on 2026-10-01 to trigger reconciliation
    manual_txn_resp = client.post(
        "/api/v1/transactions",
        headers=headers,
        json={
            "business_id": business_id,
            "transaction_date": "2026-10-01",
            "amount": 1500.00,
            "flow_type": "INFLOW",
            "payment_mode": "CASH",
            "category": "SALE",
            "description": "Counter Cash Register entry",
        },
    )
    assert manual_txn_resp.status_code == status.HTTP_201_CREATED

    recon_resp = client.get(
        f"/api/v1/reconciliation/candidates?business_id={business_id}",
        headers=headers,
    )
    assert recon_resp.status_code == status.HTTP_200_OK
    candidates = recon_resp.json()["data"]["candidates"]
    assert len(candidates) >= 1
    target_cand = candidates[0]

    # Resolve match: ACCEPT
    resolve_resp = client.post(
        f"/api/v1/reconciliation/resolve?business_id={business_id}",
        headers=headers,
        json={
            "primary_transaction_id": target_cand["primary_transaction"]["id"],
            "matched_transaction_id": target_cand["matched_transaction"]["id"],
            "action": "ACCEPT",
            "review_notes": "Verified against counter cash slip.",
        },
    )
    assert resolve_resp.status_code == status.HTTP_200_OK
    assert resolve_resp.json()["data"]["action"] == "ACCEPT"

    # ---------------------------------------------------------
    # 6. FINANCIAL ANALYTICS & EVIDENCE QUALITY (Teammate 4)
    # ---------------------------------------------------------
    # Summary Metrics
    summary_resp = client.get(
        f"/api/v1/analysis/summary?business_id={business_id}",
        headers=headers,
    )
    assert summary_resp.status_code == status.HTTP_200_OK
    summary = summary_resp.json()["data"]
    # Recorded Sales should be positive
    assert summary["recorded_sales"] > 0
    assert "net_recorded_cash_movement" in summary
    # Strict terminology validation: NEVER 'Profit' or 'Net Income'
    assert "profit" not in summary
    assert "net_income" not in summary

    # Data Completeness
    comp_resp = client.get(
        f"/api/v1/analysis/completeness?business_id={business_id}",
        headers=headers,
    )
    assert comp_resp.status_code == status.HTTP_200_OK
    comp = comp_resp.json()["data"]
    assert comp["total_calendar_days"] > 0
    assert comp["continuity_score"] >= 0

    # Anomalies
    anom_resp = client.get(
        f"/api/v1/analysis/anomalies?business_id={business_id}",
        headers=headers,
    )
    assert anom_resp.status_code == status.HTTP_200_OK
    assert "anomalies" in anom_resp.json()["data"]

    # 5-Dimension Evidence Quality Scoring
    evidence_resp = client.get(
        f"/api/v1/analysis/evidence-quality?business_id={business_id}",
        headers=headers,
    )
    assert evidence_resp.status_code == status.HTTP_200_OK
    evidence = evidence_resp.json()["data"]
    assert 0 <= evidence["overall_score"] <= 100
    assert len(evidence["dimension_breakdown"]) == 5

    # ---------------------------------------------------------
    # 7. FINANCIAL VISIBILITY PASSPORT PDF GENERATION (Teammate 4)
    # ---------------------------------------------------------
    passport_gen = client.post(
        "/api/v1/passports/generate",
        headers=headers,
        json={
            "business_id": business_id,
            "period_start": "2026-10-01",
            "period_end": "2026-10-31",
        },
    )
    assert passport_gen.status_code == status.HTTP_200_OK, passport_gen.text
    passport_data = passport_gen.json()["data"]
    passport_token = passport_data["passport_token"]
    assert len(passport_data["sha256_hash"]) == 64

    # Download Generated PDF
    download_resp = client.get(f"/api/v1/passports/{passport_token}/download")
    assert download_resp.status_code == status.HTTP_200_OK
    assert download_resp.headers["content-type"] == "application/pdf"
    assert download_resp.content.startswith(b"%PDF")

    # ---------------------------------------------------------
    # 8. TWO-TENANT SECURITY ISOLATION VERIFICATION (Teammate 2)
    # ---------------------------------------------------------
    attacker_user = User(
        email=f"attacker_{uuid.uuid4().hex[:8]}@rival.store",
        password_hash=hash_password("Pass#123"),
        full_name="Attacker User",
        is_active=True,
    )
    db.add(attacker_user)
    db.commit()
    db.refresh(attacker_user)

    other_token = create_access_token(subject=str(attacker_user.id))
    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Tenant B tries to access Tenant A's business -> 404
    unauth_biz = client.get(f"/api/v1/businesses/{business_id}", headers=other_headers)
    assert unauth_biz.status_code == status.HTTP_404_NOT_FOUND

    # Tenant B tries to list Tenant A's transactions -> 404
    unauth_txns = client.get(
        f"/api/v1/transactions?business_id={business_id}",
        headers=other_headers,
    )
    assert unauth_txns.status_code == status.HTTP_404_NOT_FOUND

    # Tenant B tries to access Tenant A's analytics -> 404 (Forbidden / Not Found)
    unauth_summary = client.get(
        f"/api/v1/analysis/summary?business_id={business_id}",
        headers=other_headers,
    )
    assert unauth_summary.status_code in [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND]
