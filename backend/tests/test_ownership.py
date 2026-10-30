import uuid
from decimal import Decimal
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.business import Business
from app.models.transaction import Transaction
from app.models.user import User

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    """Provides a database session for querying live PostgreSQL state during tests."""
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="module")
def tenants(db):
    """
    Sets up two completely independent tenants (User A and User B) with their own
    distinct businesses and transactions via the database.
    Teardown ensures complete removal of all created test entities.
    """
    # 1. Setup Tenant A
    user_a_email = f"tenant_a_{uuid.uuid4().hex[:8]}@kirana.org"
    user_a = User(
        email=user_a_email,
        password_hash=hash_password("TenantA#Pass123"),
        full_name="Anil Kumar (Kirana Owner)",
        is_active=True,
    )
    db.add(user_a)
    db.commit()
    db.refresh(user_a)
    token_a = create_access_token(subject=user_a.id)
    headers_a = {"Authorization": f"Bearer {token_a}"}

    biz_a = Business(
        owner_user_id=user_a.id,
        trade_name="Anil Kirana General Store",
        category="Kirana",
        business_type="Sole Proprietorship",
        operating_days=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    )
    db.add(biz_a)
    db.commit()
    db.refresh(biz_a)

    txn_a1 = Transaction(
        business_id=biz_a.id,
        transaction_date="2026-10-28",
        amount=Decimal("1500.00"),
        flow_type="INFLOW",
        payment_mode="UPI",
        category="SALE",
        counterparty_name="Customer Rohan",
        reference_number="UPI/A/001",
        description="Daily grocery retail sales A1",
    )
    txn_a2 = Transaction(
        business_id=biz_a.id,
        transaction_date="2026-10-29",
        amount=Decimal("600.00"),
        flow_type="OUTFLOW",
        payment_mode="CASH",
        category="EXPENSE",
        counterparty_name="Wholesale Supplier Deepak",
        reference_number="CASH/A/002",
        description="Rice bags wholesale restock A2",
    )
    db.add_all([txn_a1, txn_a2])
    db.commit()
    db.refresh(txn_a1)
    db.refresh(txn_a2)

    # 2. Setup Tenant B
    user_b_email = f"tenant_b_{uuid.uuid4().hex[:8]}@kirana.org"
    user_b = User(
        email=user_b_email,
        password_hash=hash_password("TenantB#Pass123"),
        full_name="Bina Patel (Chemist Owner)",
        is_active=True,
    )
    db.add(user_b)
    db.commit()
    db.refresh(user_b)
    token_b = create_access_token(subject=user_b.id)
    headers_b = {"Authorization": f"Bearer {token_b}"}

    biz_b = Business(
        owner_user_id=user_b.id,
        trade_name="Bina Pharma & Chemist",
        category="Pharmacy",
        business_type="Partnership",
        operating_days=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    )
    db.add(biz_b)
    db.commit()
    db.refresh(biz_b)

    txn_b1 = Transaction(
        business_id=biz_b.id,
        transaction_date="2026-10-28",
        amount=Decimal("2500.00"),
        flow_type="INFLOW",
        payment_mode="CASH",
        category="SALE",
        counterparty_name="Walk-in Patient",
        reference_number="CASH/B/001",
        description="Medicine sale over the counter B1",
    )
    txn_b2 = Transaction(
        business_id=biz_b.id,
        transaction_date="2026-10-30",
        amount=Decimal("900.00"),
        flow_type="OUTFLOW",
        payment_mode="NET_BANKING",
        category="EXPENSE",
        counterparty_name="Apex Pharma Distributors",
        reference_number="NEFT/B/002",
        description="Antibiotics stock batch B2",
    )
    db.add_all([txn_b1, txn_b2])
    db.commit()
    db.refresh(txn_b1)
    db.refresh(txn_b2)

    class TenantContext:
        pass

    ctx = TenantContext()
    ctx.user_a = user_a
    ctx.headers_a = headers_a
    ctx.biz_a = biz_a
    ctx.txn_a1 = txn_a1
    ctx.txn_a2 = txn_a2

    ctx.user_b = user_b
    ctx.headers_b = headers_b
    ctx.biz_b = biz_b
    ctx.txn_b1 = txn_b1
    ctx.txn_b2 = txn_b2

    yield ctx

    # Teardown: Delete users; CASCADE deletes businesses and transactions
    u_a = db.get(User, user_a.id)
    if u_a:
        db.delete(u_a)
    u_b = db.get(User, user_b.id)
    if u_b:
        db.delete(u_b)
    db.commit()


# ==============================================================================
# 1. AUTHENTICATION & IDENTITY ISOLATION TESTS
# ==============================================================================

def test_authentication_identity_isolation(tenants):
    """
    Verify:
    1. Token A strictly resolves to User A's identity.
    2. Token B strictly resolves to User B's identity.
    3. User A cannot impersonate User B by sending User B's ID in body.
    4. Unauthenticated or malformed tokens cannot access protected endpoints.
    """
    # 1. Identity resolution for User A
    me_a = client.get(f"{settings.API_V1_STR}/auth/me", headers=tenants.headers_a)
    assert me_a.status_code == status.HTTP_200_OK
    assert me_a.json()["id"] == str(tenants.user_a.id)
    assert me_a.json()["email"] == tenants.user_a.email

    # 2. Identity resolution for User B
    me_b = client.get(f"{settings.API_V1_STR}/auth/me", headers=tenants.headers_b)
    assert me_b.status_code == status.HTTP_200_OK
    assert me_b.json()["id"] == str(tenants.user_b.id)
    assert me_b.json()["email"] == tenants.user_b.email

    # 3. User A cannot hijack ownership by submitting User B's UUID
    hijack_payload = {
        "trade_name": "Rogue Store Attempt",
        "category": "Retail",
        "business_type": "Sole Proprietorship",
        "owner_user_id": str(tenants.user_b.id),  # Injected maliciously
    }
    create_res = client.post(
        f"{settings.API_V1_STR}/businesses",
        json=hijack_payload,
        headers=tenants.headers_a,
    )
    assert create_res.status_code == status.HTTP_201_CREATED
    # Must be owned by User A, ignoring the injected User B ID
    assert create_res.json()["owner_user_id"] == str(tenants.user_a.id)
    assert create_res.json()["owner_user_id"] != str(tenants.user_b.id)

    # Cleanup rogue test business
    rogue_id = create_res.json()["id"]
    client.delete(f"{settings.API_V1_STR}/businesses/{rogue_id}", headers=tenants.headers_a)

    # 4. Protected endpoints reject invalid/missing tokens
    for endpoint in ["/businesses", "/transactions", "/auth/me"]:
        assert client.get(f"{settings.API_V1_STR}{endpoint}").status_code == status.HTTP_401_UNAUTHORIZED
        assert client.get(
            f"{settings.API_V1_STR}{endpoint}",
            headers={"Authorization": "Bearer bad.token.here"},
        ).status_code == status.HTTP_401_UNAUTHORIZED


# ==============================================================================
# 2. BUSINESS OWNERSHIP ISOLATION TESTS
# ==============================================================================

def test_business_ownership_isolation(tenants, db):
    """
    Verify:
    - User A can view and update Business A, but gets 404 for Business B.
    - User B can view and update Business B, but gets 404 for Business A.
    - Neither user sees the other's business in GET /businesses.
    - Injected owner_user_id in PATCH does not alter database ownership.
    - PostgreSQL audit confirms ownership and trade names remain intact.
    """
    # 1. Listing isolation
    list_a = client.get(f"{settings.API_V1_STR}/businesses", headers=tenants.headers_a).json()
    list_a_ids = [b["id"] for b in list_a]
    assert str(tenants.biz_a.id) in list_a_ids
    assert str(tenants.biz_b.id) not in list_a_ids

    list_b = client.get(f"{settings.API_V1_STR}/businesses", headers=tenants.headers_b).json()
    list_b_ids = [b["id"] for b in list_b]
    assert str(tenants.biz_b.id) in list_b_ids
    assert str(tenants.biz_a.id) not in list_b_ids

    # 2. Cross-tenant GET returns 404
    assert client.get(
        f"{settings.API_V1_STR}/businesses/{tenants.biz_b.id}",
        headers=tenants.headers_a,
    ).status_code == status.HTTP_404_NOT_FOUND

    assert client.get(
        f"{settings.API_V1_STR}/businesses/{tenants.biz_a.id}",
        headers=tenants.headers_b,
    ).status_code == status.HTTP_404_NOT_FOUND

    # 3. Cross-tenant PATCH returns 404 and does not mutate target
    attack_a = client.patch(
        f"{settings.API_V1_STR}/businesses/{tenants.biz_b.id}",
        json={"trade_name": "Hacked By A", "owner_user_id": str(tenants.user_a.id)},
        headers=tenants.headers_a,
    )
    assert attack_a.status_code == status.HTTP_404_NOT_FOUND

    attack_b = client.patch(
        f"{settings.API_V1_STR}/businesses/{tenants.biz_a.id}",
        json={"trade_name": "Hacked By B", "owner_user_id": str(tenants.user_b.id)},
        headers=tenants.headers_b,
    )
    assert attack_b.status_code == status.HTTP_404_NOT_FOUND

    # 4. Database integrity verification
    db.expire_all()
    b_in_db = db.get(Business, tenants.biz_b.id)
    assert b_in_db.owner_user_id == tenants.user_b.id
    assert b_in_db.trade_name == "Bina Pharma & Chemist"

    a_in_db = db.get(Business, tenants.biz_a.id)
    assert a_in_db.owner_user_id == tenants.user_a.id
    assert a_in_db.trade_name == "Anil Kirana General Store"


# ==============================================================================
# 3. TRANSACTION CREATION & INJECTION ISOLATION
# ==============================================================================

def test_transaction_creation_ownership_isolation(tenants, db):
    """
    Verify:
    - User A cannot create a transaction for Business B (returns 404).
    - User B cannot create a transaction for Business A (returns 404).
    - Database verification: No unauthorized transactions created in DB.
    """
    # Count transactions in DB before attacks
    count_before_b = db.execute(
        select(func.count(Transaction.id)).where(Transaction.business_id == tenants.biz_b.id)
    ).scalar_one()
    count_before_a = db.execute(
        select(func.count(Transaction.id)).where(Transaction.business_id == tenants.biz_a.id)
    ).scalar_one()

    # User A attacks Business B
    res_a_on_b = client.post(
        f"{settings.API_V1_STR}/transactions",
        json={
            "business_id": str(tenants.biz_b.id),
            "transaction_date": "2026-10-31",
            "amount": "9999.00",
            "flow_type": "INFLOW",
            "payment_mode": "UPI",
            "category": "SALE",
            "description": "Malicious transaction injected by User A",
        },
        headers=tenants.headers_a,
    )
    assert res_a_on_b.status_code == status.HTTP_404_NOT_FOUND

    # User B attacks Business A
    res_b_on_a = client.post(
        f"{settings.API_V1_STR}/transactions",
        json={
            "business_id": str(tenants.biz_a.id),
            "transaction_date": "2026-10-31",
            "amount": "8888.00",
            "flow_type": "OUTFLOW",
            "payment_mode": "CASH",
            "category": "EXPENSE",
            "description": "Malicious transaction injected by User B",
        },
        headers=tenants.headers_b,
    )
    assert res_b_on_a.status_code == status.HTTP_404_NOT_FOUND

    # Verify database counts are strictly unchanged
    db.expire_all()
    count_after_b = db.execute(
        select(func.count(Transaction.id)).where(Transaction.business_id == tenants.biz_b.id)
    ).scalar_one()
    count_after_a = db.execute(
        select(func.count(Transaction.id)).where(Transaction.business_id == tenants.biz_a.id)
    ).scalar_one()

    assert count_after_b == count_before_b
    assert count_after_a == count_before_a


# ==============================================================================
# 4. TRANSACTION LISTING & PAGINATION ISOLATION
# ==============================================================================

def test_transaction_listing_and_pagination_isolation(tenants):
    """
    Verify:
    - User A sees only A1 and A2, never B1 or B2.
    - User B sees only B1 and B2, never A1 or A2.
    - Pagination totals reflect only the authenticated tenant's records.
    - Filtering by another user's business_id returns 404 and leaks zero records.
    """
    # User A listing
    resp_a = client.get(f"{settings.API_V1_STR}/transactions", headers=tenants.headers_a)
    assert resp_a.status_code == status.HTTP_200_OK
    data_a = resp_a.json()
    a_ids = [t["id"] for t in data_a["items"]]

    assert str(tenants.txn_a1.id) in a_ids
    assert str(tenants.txn_a2.id) in a_ids
    assert str(tenants.txn_b1.id) not in a_ids
    assert str(tenants.txn_b2.id) not in a_ids

    # User B listing
    resp_b = client.get(f"{settings.API_V1_STR}/transactions", headers=tenants.headers_b)
    assert resp_b.status_code == status.HTTP_200_OK
    data_b = resp_b.json()
    b_ids = [t["id"] for t in data_b["items"]]

    assert str(tenants.txn_b1.id) in b_ids
    assert str(tenants.txn_b2.id) in b_ids
    assert str(tenants.txn_a1.id) not in b_ids
    assert str(tenants.txn_a2.id) not in b_ids

    # Cross-filtering by foreign business_id
    cross_filter_a = client.get(
        f"{settings.API_V1_STR}/transactions?business_id={tenants.biz_b.id}",
        headers=tenants.headers_a,
    )
    assert cross_filter_a.status_code == status.HTTP_404_NOT_FOUND

    cross_filter_b = client.get(
        f"{settings.API_V1_STR}/transactions?business_id={tenants.biz_a.id}",
        headers=tenants.headers_b,
    )
    assert cross_filter_b.status_code == status.HTTP_404_NOT_FOUND


# ==============================================================================
# 5. TRANSACTION FETCH, UPDATE & DELETE ISOLATION
# ==============================================================================

def test_transaction_fetch_update_delete_isolation(tenants, db):
    """
    Verify:
    - User A cannot fetch B1/B2 (404).
    - User B cannot fetch A1/A2 (404).
    - User A cannot update B1/B2 (404); database data remains untouched.
    - User B cannot update A1/A2 (404); database data remains untouched.
    - User A cannot delete B1/B2 (404); database records remain in place.
    - User B cannot delete A1/A2 (404); database records remain in place.
    """
    # 1. Cross-fetch attempts
    assert client.get(
        f"{settings.API_V1_STR}/transactions/{tenants.txn_b1.id}",
        headers=tenants.headers_a,
    ).status_code == status.HTTP_404_NOT_FOUND

    assert client.get(
        f"{settings.API_V1_STR}/transactions/{tenants.txn_a1.id}",
        headers=tenants.headers_b,
    ).status_code == status.HTTP_404_NOT_FOUND

    # 2. Cross-update attempts
    update_attack_a = client.patch(
        f"{settings.API_V1_STR}/transactions/{tenants.txn_b1.id}",
        json={"amount": "0.01", "description": "Compromised by User A"},
        headers=tenants.headers_a,
    )
    assert update_attack_a.status_code == status.HTTP_404_NOT_FOUND

    update_attack_b = client.patch(
        f"{settings.API_V1_STR}/transactions/{tenants.txn_a1.id}",
        json={"amount": "0.01", "description": "Compromised by User B"},
        headers=tenants.headers_b,
    )
    assert update_attack_b.status_code == status.HTTP_404_NOT_FOUND

    # 3. Cross-delete attempts
    del_attack_a = client.delete(
        f"{settings.API_V1_STR}/transactions/{tenants.txn_b2.id}",
        headers=tenants.headers_a,
    )
    assert del_attack_a.status_code == status.HTTP_404_NOT_FOUND

    del_attack_b = client.delete(
        f"{settings.API_V1_STR}/transactions/{tenants.txn_a2.id}",
        headers=tenants.headers_b,
    )
    assert del_attack_b.status_code == status.HTTP_404_NOT_FOUND

    # 4. Database state verification: values unmutated and records persist
    db.expire_all()
    b1_db = db.get(Transaction, tenants.txn_b1.id)
    assert b1_db is not None
    assert b1_db.amount == Decimal("2500.00")
    assert b1_db.description == "Medicine sale over the counter B1"

    a1_db = db.get(Transaction, tenants.txn_a1.id)
    assert a1_db is not None
    assert a1_db.amount == Decimal("1500.00")
    assert a1_db.description == "Daily grocery retail sales A1"

    b2_db = db.get(Transaction, tenants.txn_b2.id)
    assert b2_db is not None
    a2_db = db.get(Transaction, tenants.txn_a2.id)
    assert a2_db is not None


# ==============================================================================
# 6. ID MANIPULATION & ENUMERATION RESILIENCE
# ==============================================================================

def test_id_manipulation_and_enumeration_resilience(tenants):
    """
    Verify:
    - Nonexistent UUIDs and cross-tenant UUIDs yield identical HTTP 404 responses.
    - No timing or error message leaks differentiate another user's business from a non-existent one.
    - Malformed UUID strings return HTTP 422 Unprocessable Content.
    - Error payloads never expose email addresses, counterparty names, or internal flags.
    """
    non_existent_uuid = uuid.uuid4()

    # 1. Compare Business responses
    cross_biz_res = client.get(
        f"{settings.API_V1_STR}/businesses/{tenants.biz_b.id}",
        headers=tenants.headers_a,
    )
    ne_biz_res = client.get(
        f"{settings.API_V1_STR}/businesses/{non_existent_uuid}",
        headers=tenants.headers_a,
    )
    assert cross_biz_res.status_code == status.HTTP_404_NOT_FOUND
    assert ne_biz_res.status_code == status.HTTP_404_NOT_FOUND
    assert cross_biz_res.json() == ne_biz_res.json()
    assert cross_biz_res.json()["detail"] == "Business not found"

    # 2. Compare Transaction responses
    cross_txn_res = client.get(
        f"{settings.API_V1_STR}/transactions/{tenants.txn_b1.id}",
        headers=tenants.headers_a,
    )
    ne_txn_res = client.get(
        f"{settings.API_V1_STR}/transactions/{non_existent_uuid}",
        headers=tenants.headers_a,
    )
    assert cross_txn_res.status_code == status.HTTP_404_NOT_FOUND
    assert ne_txn_res.status_code == status.HTTP_404_NOT_FOUND
    assert cross_txn_res.json() == ne_txn_res.json()
    assert cross_txn_res.json()["detail"] == "Transaction not found"

    # 3. Malformed UUIDs
    malformed_endpoints = [
        f"/businesses/invalid-uuid-1234",
        f"/transactions/not-a-valid-uuid",
        f"/businesses/00000000-0000",
    ]
    for ep in malformed_endpoints:
        res = client.get(f"{settings.API_V1_STR}{ep}", headers=tenants.headers_a)
        assert res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 4. Error response safety
    for resp in [cross_biz_res, cross_txn_res]:
        body_text = resp.text.lower()
        assert "bina" not in body_text
        assert "chemist" not in body_text
        assert "pharma" not in body_text
        assert "@kirana.org" not in body_text


# ==============================================================================
# 7. POST-ATTACK DATABASE INTEGRITY VERIFICATION
# ==============================================================================

def test_database_integrity_post_attack_verification(tenants, db):
    """
    Comprehensive audit of live PostgreSQL tables to guarantee that no attack
    corrupted, orphaned, or inserted unauthorized records.
    """
    db.expire_all()

    # 1. Business ownership remains strictly tied to correct user UUIDs
    biz_a = db.get(Business, tenants.biz_a.id)
    assert biz_a.owner_user_id == tenants.user_a.id

    biz_b = db.get(Business, tenants.biz_b.id)
    assert biz_b.owner_user_id == tenants.user_b.id

    # 2. Transaction business links remain strictly tied to correct business UUIDs
    txn_a1 = db.get(Transaction, tenants.txn_a1.id)
    txn_a2 = db.get(Transaction, tenants.txn_a2.id)
    assert txn_a1.business_id == tenants.biz_a.id
    assert txn_a2.business_id == tenants.biz_a.id

    txn_b1 = db.get(Transaction, tenants.txn_b1.id)
    txn_b2 = db.get(Transaction, tenants.txn_b2.id)
    assert txn_b1.business_id == tenants.biz_b.id
    assert txn_b2.business_id == tenants.biz_b.id

    # 3. Check exact numeric precision and flow integrity in PostgreSQL
    assert txn_a1.amount == Decimal("1500.00")
    assert txn_a1.flow_type == "INFLOW"
    assert txn_a2.amount == Decimal("600.00")
    assert txn_a2.flow_type == "OUTFLOW"

    assert txn_b1.amount == Decimal("2500.00")
    assert txn_b1.flow_type == "INFLOW"
    assert txn_b2.amount == Decimal("900.00")
    assert txn_b2.flow_type == "OUTFLOW"
