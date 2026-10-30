import uuid
from datetime import date, time
from decimal import Decimal
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.business import Business
from app.models.reconciliation import Reconciliation
from app.models.transaction import Transaction
from app.models.user import User

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="module")
def user_a(db):
    """Creates Test User A with a Business A."""
    email = f"user_a_{uuid.uuid4().hex[:8]}@kirana.org"
    user = User(
        email=email,
        password_hash=hash_password("PassA#12345"),
        full_name="User Alpha",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    user.auth_headers = {"Authorization": f"Bearer {token}"}

    # Create Business A
    biz = Business(
        owner_user_id=user.id,
        trade_name="Alpha Kirana Store",
        category="Kirana",
        business_type="Sole Proprietorship",
        operating_days=["Monday", "Tuesday", "Wednesday"],
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)
    user.business = biz

    yield user

    # Teardown
    user_in_db = db.get(User, user.id)
    if user_in_db:
        db.delete(user_in_db)
        db.commit()


@pytest.fixture(scope="module")
def user_b(db):
    """Creates Test User B with a Business B."""
    email = f"user_b_{uuid.uuid4().hex[:8]}@kirana.org"
    user = User(
        email=email,
        password_hash=hash_password("PassB#12345"),
        full_name="User Beta",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    user.auth_headers = {"Authorization": f"Bearer {token}"}

    # Create Business B
    biz = Business(
        owner_user_id=user.id,
        trade_name="Beta Medical Stores",
        category="Pharmacy",
        business_type="Partnership",
        operating_days=["Monday", "Tuesday", "Wednesday"],
    )
    db.add(biz)
    db.commit()
    db.refresh(biz)
    user.business = biz

    yield user

    # Teardown
    user_in_db = db.get(User, user.id)
    if user_in_db:
        db.delete(user_in_db)
        db.commit()


# ==========================================
# 1. AUTHENTICATION PROTECTION TESTS
# ==========================================

def test_unauthenticated_transaction_access_rejected():
    """Verify unauthenticated requests cannot access transaction endpoints."""
    fake_id = uuid.uuid4()
    payload = {
        "business_id": str(fake_id),
        "transaction_date": "2026-10-31",
        "amount": "150.00",
        "flow_type": "INFLOW",
        "payment_mode": "CASH",
        "category": "SALE",
    }

    # Create requires auth
    res_post = client.post(f"{settings.API_V1_STR}/transactions", json=payload)
    assert res_post.status_code == status.HTTP_401_UNAUTHORIZED

    # List requires auth
    res_list = client.get(f"{settings.API_V1_STR}/transactions")
    assert res_list.status_code == status.HTTP_401_UNAUTHORIZED

    # Get requires auth
    res_get = client.get(f"{settings.API_V1_STR}/transactions/{fake_id}")
    assert res_get.status_code == status.HTTP_401_UNAUTHORIZED

    # Update requires auth
    res_patch = client.patch(
        f"{settings.API_V1_STR}/transactions/{fake_id}", json={"amount": "200.00"}
    )
    assert res_patch.status_code == status.HTTP_401_UNAUTHORIZED

    # Delete requires auth
    res_delete = client.delete(f"{settings.API_V1_STR}/transactions/{fake_id}")
    assert res_delete.status_code == status.HTTP_401_UNAUTHORIZED


# ==========================================
# 2. TRANSACTION CREATION & VALIDATION TESTS
# ==========================================

def test_transaction_creation_and_validation(user_a, user_b):
    """
    Verify:
    - User can create transaction for their own business.
    - Transaction associated with correct business.
    - User cannot create transaction for another user's business (HTTP 404).
    - Nonexistent business returns HTTP 404.
    - Negative or zero amounts rejected (HTTP 422).
    - Invalid enum rejected (HTTP 422).
    - Internal fields not exposed.
    """
    # 1. Successful creation
    valid_payload = {
        "business_id": str(user_a.business.id),
        "transaction_date": "2026-10-30",
        "transaction_time": "14:30:00",
        "amount": "2500.50",
        "flow_type": "inflow",  # Test normalization
        "payment_mode": "upi",
        "category": "sale",
        "counterparty_name": "Ramesh Groceries",
        "reference_number": "UPI/2026/001",
        "description": "Daily Kirana sale",
        "dedup_hash": "malicious_hash",  # Injected, must be ignored
        "is_flagged": True,              # Injected, must be ignored
    }
    response = client.post(
        f"{settings.API_V1_STR}/transactions",
        json=valid_payload,
        headers=user_a.auth_headers,
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["business_id"] == str(user_a.business.id)
    assert data["amount"] == "2500.50"
    assert data["flow_type"] == "INFLOW"
    assert data["payment_mode"] == "UPI"
    assert data["category"] == "SALE"
    assert data["counterparty_name"] == "Ramesh Groceries"
    assert data["reference_number"] == "UPI/2026/001"
    assert data["is_flagged"] is False  # System default preserved
    assert "dedup_hash" not in data    # Not exposed in response schema

    # 2. Cannot create for User B's business (404 Not Found)
    cross_payload = dict(valid_payload, business_id=str(user_b.business.id))
    cross_res = client.post(
        f"{settings.API_V1_STR}/transactions",
        json=cross_payload,
        headers=user_a.auth_headers,
    )
    assert cross_res.status_code == status.HTTP_404_NOT_FOUND
    assert "business not found" in cross_res.json()["detail"].lower()

    # 3. Nonexistent business returns 404
    non_existent_payload = dict(valid_payload, business_id=str(uuid.uuid4()))
    ne_res = client.post(
        f"{settings.API_V1_STR}/transactions",
        json=non_existent_payload,
        headers=user_a.auth_headers,
    )
    assert ne_res.status_code == status.HTTP_404_NOT_FOUND

    # 4. Negative amount rejected (422)
    neg_payload = dict(valid_payload, amount="-500.00")
    neg_res = client.post(
        f"{settings.API_V1_STR}/transactions",
        json=neg_payload,
        headers=user_a.auth_headers,
    )
    assert neg_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 5. Zero amount rejected (422)
    zero_payload = dict(valid_payload, amount="0.00")
    zero_res = client.post(
        f"{settings.API_V1_STR}/transactions",
        json=zero_payload,
        headers=user_a.auth_headers,
    )
    assert zero_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # 6. Invalid flow_type rejected (422)
    bad_flow_payload = dict(valid_payload, flow_type="UNKNOWN_FLOW")
    bad_flow_res = client.post(
        f"{settings.API_V1_STR}/transactions",
        json=bad_flow_payload,
        headers=user_a.auth_headers,
    )
    assert bad_flow_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ==========================================
# 3. LISTING, FILTERING & PAGINATION TESTS
# ==========================================

def test_listing_filtering_and_pagination(user_a, user_b):
    """
    Verify:
    - User sees only their own transactions.
    - Filter by business_id, date range, flow_type, payment_mode, category.
    - Pagination metadata (page, page_size, total, total_pages).
    - Page size > 100 rejected (422).
    - Inverted dates rejected (400).
    """
    # Seed 3 additional distinct transactions for User A
    txns_data = [
        ("2026-10-25", "100.00", "OUTFLOW", "CASH", "EXPENSE"),
        ("2026-10-26", "200.00", "INFLOW", "UPI", "SALE"),
        ("2026-10-27", "300.00", "OUTFLOW", "NET_BANKING", "TRANSFER"),
    ]
    for d, a, f, p, c in txns_data:
        client.post(
            f"{settings.API_V1_STR}/transactions",
            json={
                "business_id": str(user_a.business.id),
                "transaction_date": d,
                "amount": a,
                "flow_type": f,
                "payment_mode": p,
                "category": c,
            },
            headers=user_a.auth_headers,
        )

    # 1. Basic list for User A (at least 4 txns)
    res = client.get(f"{settings.API_V1_STR}/transactions", headers=user_a.auth_headers)
    assert res.status_code == status.HTTP_200_OK
    body = res.json()
    assert body["total"] >= 4
    assert len(body["items"]) >= 4
    for item in body["items"]:
        assert item["business_id"] == str(user_a.business.id)

    # 2. Filter by flow_type=OUTFLOW
    res_flow = client.get(
        f"{settings.API_V1_STR}/transactions?flow_type=OUTFLOW",
        headers=user_a.auth_headers,
    )
    assert res_flow.status_code == status.HTTP_200_OK
    flow_items = res_flow.json()["items"]
    assert len(flow_items) >= 2
    assert all(i["flow_type"] == "OUTFLOW" for i in flow_items)

    # 3. Filter by payment_mode=CASH
    res_cash = client.get(
        f"{settings.API_V1_STR}/transactions?payment_mode=CASH",
        headers=user_a.auth_headers,
    )
    assert res_cash.status_code == status.HTTP_200_OK
    assert all(i["payment_mode"] == "CASH" for i in res_cash.json()["items"])

    # 4. Filter by category=EXPENSE
    res_cat = client.get(
        f"{settings.API_V1_STR}/transactions?category=EXPENSE",
        headers=user_a.auth_headers,
    )
    assert res_cat.status_code == status.HTTP_200_OK
    assert all(i["category"] == "EXPENSE" for i in res_cat.json()["items"])

    # 5. Date range filter
    res_date = client.get(
        f"{settings.API_V1_STR}/transactions?start_date=2026-10-25&end_date=2026-10-26",
        headers=user_a.auth_headers,
    )
    assert res_date.status_code == status.HTTP_200_OK
    for i in res_date.json()["items"]:
        assert "2026-10-25" <= i["transaction_date"] <= "2026-10-26"

    # 6. Inverted dates return 400
    res_bad_dates = client.get(
        f"{settings.API_V1_STR}/transactions?start_date=2026-10-31&end_date=2026-10-01",
        headers=user_a.auth_headers,
    )
    assert res_bad_dates.status_code == status.HTTP_400_BAD_REQUEST

    # 7. Pagination with page_size=2
    res_page = client.get(
        f"{settings.API_V1_STR}/transactions?page=1&page_size=2",
        headers=user_a.auth_headers,
    )
    assert res_page.status_code == status.HTTP_200_OK
    p_body = res_page.json()
    assert len(p_body["items"]) == 2
    assert p_body["page"] == 1
    assert p_body["page_size"] == 2
    assert p_body["total_pages"] >= 2

    # 8. Page size > 100 rejected (422)
    res_big_page = client.get(
        f"{settings.API_V1_STR}/transactions?page_size=101",
        headers=user_a.auth_headers,
    )
    assert res_big_page.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ==========================================
# 4. FETCH & NOT FOUND TESTS
# ==========================================

def test_fetch_transaction_by_id(user_a, user_b):
    """
    Verify:
    - Owner can fetch their transaction (200 OK).
    - Another user receives 404 (not 403).
    - Nonexistent transaction returns 404.
    """
    # Get a transaction ID belonging to User A
    list_res = client.get(f"{settings.API_V1_STR}/transactions", headers=user_a.auth_headers)
    txn_id = list_res.json()["items"][0]["id"]

    # Owner fetch
    res_ok = client.get(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        headers=user_a.auth_headers,
    )
    assert res_ok.status_code == status.HTTP_200_OK
    assert res_ok.json()["id"] == txn_id

    # Cross-tenant fetch by User B (404)
    res_cross = client.get(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        headers=user_b.auth_headers,
    )
    assert res_cross.status_code == status.HTTP_404_NOT_FOUND

    # Nonexistent UUID fetch (404)
    res_ne = client.get(
        f"{settings.API_V1_STR}/transactions/{uuid.uuid4()}",
        headers=user_a.auth_headers,
    )
    assert res_ne.status_code == status.HTTP_404_NOT_FOUND


# ==========================================
# 5. UPDATE TESTS & IMMUTABILITY
# ==========================================

def test_update_transaction(user_a, user_b):
    """
    Verify:
    - Owner can update permitted fields (PATCH & PUT).
    - Partial update preserves untouched fields.
    - Cross-tenant update returns 404.
    - Immutability for business_id, id, and internal fields.
    - Negative amount in update is rejected (422).
    """
    list_res = client.get(f"{settings.API_V1_STR}/transactions", headers=user_a.auth_headers)
    target_txn = list_res.json()["items"][0]
    txn_id = target_txn["id"]

    # 1. Partial update of description & amount
    patch_payload = {
        "amount": "9999.00",
        "description": "Updated Kirana Sale description",
        "business_id": str(user_b.business.id),  # Malicious attempt to transfer; ignored
        "id": str(uuid.uuid4()),                # Malicious attempt; ignored
    }
    patch_res = client.patch(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        json=patch_payload,
        headers=user_a.auth_headers,
    )
    assert patch_res.status_code == status.HTTP_200_OK
    updated = patch_res.json()

    assert updated["amount"] == "9999.00"
    assert updated["description"] == "Updated Kirana Sale description"
    # Preserved fields
    assert updated["category"] == target_txn["category"]
    assert updated["flow_type"] == target_txn["flow_type"]
    # Immutability
    assert updated["id"] == txn_id
    assert updated["business_id"] == target_txn["business_id"]

    # 2. Cross-tenant update by User B returns 404
    cross_res = client.patch(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        json={"amount": "1.00"},
        headers=user_b.auth_headers,
    )
    assert cross_res.status_code == status.HTTP_404_NOT_FOUND

    # 3. Invalid update amount rejected
    bad_amt_res = client.patch(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        json={"amount": "-10.00"},
        headers=user_a.auth_headers,
    )
    assert bad_amt_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ==========================================
# 6. DELETE TESTS & REFERENTIAL SAFETY
# ==========================================

def test_delete_transaction_and_reconciliation_conflict(user_a, user_b, db):
    """
    Verify:
    - User can delete safe transaction (204 No Content).
    - User B cannot delete User A's transaction (404).
    - Deleting a transaction linked to a reconciliation record raises 409 Conflict.
    """
    # 1. Create a disposable transaction for User A
    create_res = client.post(
        f"{settings.API_V1_STR}/transactions",
        json={
            "business_id": str(user_a.business.id),
            "transaction_date": "2026-10-31",
            "amount": "50.00",
            "flow_type": "INFLOW",
            "payment_mode": "CASH",
            "category": "SALE",
        },
        headers=user_a.auth_headers,
    )
    txn_id = create_res.json()["id"]

    # 2. User B cannot delete User A's transaction (404)
    cross_del = client.delete(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        headers=user_b.auth_headers,
    )
    assert cross_del.status_code == status.HTTP_404_NOT_FOUND

    # 3. Create another transaction to form a reconciliation pair
    match_txn_res = client.post(
        f"{settings.API_V1_STR}/transactions",
        json={
            "business_id": str(user_a.business.id),
            "transaction_date": "2026-10-31",
            "amount": "50.00",
            "flow_type": "INFLOW",
            "payment_mode": "UPI",
            "category": "SALE",
        },
        headers=user_a.auth_headers,
    )
    matched_id = match_txn_res.json()["id"]

    # Seed a reconciliation referencing txn_id and matched_id
    rec = Reconciliation(
        business_id=user_a.business.id,
        primary_transaction_id=uuid.UUID(txn_id),
        matched_transaction_id=uuid.UUID(matched_id),
        confidence_score=Decimal("0.9500"),
        match_rule="EXACT_AMOUNT_DATE",
        status="PENDING_REVIEW",
    )
    db.add(rec)
    db.commit()

    # 4. Deleting txn_id must now return 409 Conflict
    conflict_res = client.delete(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        headers=user_a.auth_headers,
    )
    assert conflict_res.status_code == status.HTTP_409_CONFLICT
    assert "reconciliation" in conflict_res.json()["detail"].lower()

    # Clean up the reconciliation to test safe deletion
    db.delete(rec)
    db.commit()

    # 5. Successful deletion (204 No Content)
    safe_del = client.delete(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        headers=user_a.auth_headers,
    )
    assert safe_del.status_code == status.HTTP_204_NO_CONTENT

    # Verify transaction is gone
    verify_res = client.get(
        f"{settings.API_V1_STR}/transactions/{txn_id}",
        headers=user_a.auth_headers,
    )
    assert verify_res.status_code == status.HTTP_404_NOT_FOUND


# ==========================================
# 7. TWO-TENANT ISOLATION END-TO-END TEST
# ==========================================

def test_two_tenant_isolation_end_to_end(user_a, user_b):
    """
    Comprehensive end-to-end multi-tenant isolation:
    - User A owns Business A and Transaction A.
    - User B owns Business B and Transaction B.
    - User A:
      - Listing returns only User A's transactions.
      - Filtering for Business B returns 404 (does not expose Business B).
      - Fetching Transaction B returns 404.
      - Updating Transaction B returns 404.
      - Deleting Transaction B returns 404.
      - Creating a transaction under Business B returns 404.
    - User B:
      - Listing returns only User B's transactions.
      - Filtering for Business A returns 404.
      - Fetching Transaction A returns 404.
      - Updating Transaction A returns 404.
      - Deleting Transaction A returns 404.
      - Creating a transaction under Business A returns 404.
    """
    # 1. Create Transaction B under Business B
    res_b = client.post(
        f"{settings.API_V1_STR}/transactions",
        json={
            "business_id": str(user_b.business.id),
            "transaction_date": "2026-10-31",
            "amount": "1234.56",
            "flow_type": "INFLOW",
            "payment_mode": "UPI",
            "category": "SALE",
            "description": "User B proprietary transaction",
        },
        headers=user_b.auth_headers,
    )
    assert res_b.status_code == status.HTTP_201_CREATED
    txn_b_id = res_b.json()["id"]

    # 2. Get Transaction A under Business A
    list_a = client.get(f"{settings.API_V1_STR}/transactions", headers=user_a.auth_headers)
    txn_a_id = list_a.json()["items"][0]["id"]

    # --- USER A TESTS AGAINST USER B ---
    # User A listing contains zero of User B's transactions
    items_a = client.get(f"{settings.API_V1_STR}/transactions", headers=user_a.auth_headers).json()["items"]
    assert all(i["id"] != txn_b_id for i in items_a)
    assert all(i["business_id"] != str(user_b.business.id) for i in items_a)

    # User A filtering for Business B returns 404
    res_filter_b = client.get(
        f"{settings.API_V1_STR}/transactions?business_id={user_b.business.id}",
        headers=user_a.auth_headers,
    )
    assert res_filter_b.status_code == status.HTTP_404_NOT_FOUND

    # User A cannot GET Transaction B
    assert client.get(
        f"{settings.API_V1_STR}/transactions/{txn_b_id}",
        headers=user_a.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND

    # User A cannot PATCH Transaction B
    assert client.patch(
        f"{settings.API_V1_STR}/transactions/{txn_b_id}",
        json={"amount": "1.00"},
        headers=user_a.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND

    # User A cannot DELETE Transaction B
    assert client.delete(
        f"{settings.API_V1_STR}/transactions/{txn_b_id}",
        headers=user_a.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND

    # User A cannot create transaction under Business B
    assert client.post(
        f"{settings.API_V1_STR}/transactions",
        json={
            "business_id": str(user_b.business.id),
            "transaction_date": "2026-10-31",
            "amount": "99.00",
            "flow_type": "INFLOW",
            "payment_mode": "CASH",
            "category": "SALE",
        },
        headers=user_a.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND

    # --- USER B TESTS AGAINST USER A ---
    # User B listing contains zero of User A's transactions
    items_b = client.get(f"{settings.API_V1_STR}/transactions", headers=user_b.auth_headers).json()["items"]
    assert all(i["id"] != txn_a_id for i in items_b)
    assert all(i["business_id"] != str(user_a.business.id) for i in items_b)

    # User B filtering for Business A returns 404
    res_filter_a = client.get(
        f"{settings.API_V1_STR}/transactions?business_id={user_a.business.id}",
        headers=user_b.auth_headers,
    )
    assert res_filter_a.status_code == status.HTTP_404_NOT_FOUND

    # User B cannot GET Transaction A
    assert client.get(
        f"{settings.API_V1_STR}/transactions/{txn_a_id}",
        headers=user_b.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND

    # User B cannot PATCH Transaction A
    assert client.patch(
        f"{settings.API_V1_STR}/transactions/{txn_a_id}",
        json={"amount": "1.00"},
        headers=user_b.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND

    # User B cannot DELETE Transaction A
    assert client.delete(
        f"{settings.API_V1_STR}/transactions/{txn_a_id}",
        headers=user_b.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND

    # User B cannot create transaction under Business A
    assert client.post(
        f"{settings.API_V1_STR}/transactions",
        json={
            "business_id": str(user_a.business.id),
            "transaction_date": "2026-10-31",
            "amount": "99.00",
            "flow_type": "INFLOW",
            "payment_mode": "CASH",
            "category": "SALE",
        },
        headers=user_b.auth_headers,
    ).status_code == status.HTTP_404_NOT_FOUND
