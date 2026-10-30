import uuid
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.core.config import settings
from app.core.security import create_access_token, hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.business import Business
from app.models.user import User

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture(scope="module")
def user_a(db):
    """Creates Test User A."""
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

    yield user

    # Teardown
    db.execute(select(Business).where(Business.owner_user_id == user.id))
    user_in_db = db.get(User, user.id)
    if user_in_db:
        db.delete(user_in_db)
        db.commit()


@pytest.fixture(scope="module")
def user_b(db):
    """Creates Test User B."""
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

    yield user

    # Teardown
    user_in_db = db.get(User, user.id)
    if user_in_db:
        db.delete(user_in_db)
        db.commit()


# ==========================================
# 1. AUTHENTICATION PROTECTION TESTS
# ==========================================

def test_unauthenticated_access_rejected():
    """Verify unauthenticated requests cannot access business endpoints."""
    fake_id = uuid.uuid4()
    payload = {
        "trade_name": "Unauthorized Store",
        "category": "Retail",
        "business_type": "Sole Proprietorship",
    }

    # Create requires auth
    res_post = client.post(f"{settings.API_V1_STR}/businesses", json=payload)
    assert res_post.status_code == status.HTTP_401_UNAUTHORIZED

    # List requires auth
    res_list = client.get(f"{settings.API_V1_STR}/businesses")
    assert res_list.status_code == status.HTTP_401_UNAUTHORIZED

    # Get requires auth
    res_get = client.get(f"{settings.API_V1_STR}/businesses/{fake_id}")
    assert res_get.status_code == status.HTTP_401_UNAUTHORIZED

    # Update requires auth
    res_patch = client.patch(f"{settings.API_V1_STR}/businesses/{fake_id}", json={"trade_name": "New Name"})
    assert res_patch.status_code == status.HTTP_401_UNAUTHORIZED


# ==========================================
# 2. BUSINESS CREATION & VALIDATION TESTS
# ==========================================

def test_business_creation_and_ownership(user_a, db):
    """
    Verify authenticated business creation:
    - HTTP 201 on success.
    - Assigned owner_user_id matches authenticated token.
    - Client-supplied owner_user_id is ignored.
    - Invalid inputs return HTTP 422.
    """
    fake_override_uid = str(uuid.uuid4())
    create_payload = {
        "trade_name": "Gupta Kirana General Store",
        "category": "Kirana",
        "business_type": "Sole Proprietorship",
        "operating_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "owner_user_id": fake_override_uid,  # Injected maliciously; must be ignored
    }

    response = client.post(
        f"{settings.API_V1_STR}/businesses",
        json=create_payload,
        headers=user_a.auth_headers,
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["trade_name"] == "Gupta Kirana General Store"
    assert data["category"] == "Kirana"
    assert data["business_type"] == "Sole Proprietorship"
    assert len(data["operating_days"]) == 6
    assert data["owner_user_id"] == str(user_a.id)
    assert data["owner_user_id"] != fake_override_uid
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data

    # Validation: empty trade_name returns 422
    bad_payload = {
        "trade_name": "",
        "category": "Kirana",
        "business_type": "Sole Proprietorship",
    }
    bad_res = client.post(
        f"{settings.API_V1_STR}/businesses",
        json=bad_payload,
        headers=user_a.auth_headers,
    )
    assert bad_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    # Validation: missing required field returns 422
    incomplete_payload = {
        "trade_name": "Incomplete Store",
    }
    inc_res = client.post(
        f"{settings.API_V1_STR}/businesses",
        json=incomplete_payload,
        headers=user_a.auth_headers,
    )
    assert inc_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ==========================================
# 3. LISTING & EMPTY STATE TESTS
# ==========================================

def test_listing_and_empty_state(user_a, user_b):
    """
    Verify listing behaviors:
    - User with no businesses gets empty list [].
    - User with created businesses receives list containing only their records.
    """
    # User B currently has 0 businesses
    res_b = client.get(f"{settings.API_V1_STR}/businesses", headers=user_b.auth_headers)
    assert res_b.status_code == status.HTTP_200_OK
    assert res_b.json() == []

    # User A has at least the 1 business created in previous test
    res_a = client.get(f"{settings.API_V1_STR}/businesses", headers=user_a.auth_headers)
    assert res_a.status_code == status.HTTP_200_OK
    data_a = res_a.json()
    assert len(data_a) >= 1
    for biz in data_a:
        assert biz["owner_user_id"] == str(user_a.id)


# ==========================================
# 4. FETCHING & NOT FOUND TESTS
# ==========================================

def test_fetch_business_by_id(user_a):
    """
    Verify fetching business by ID:
    - Owner can fetch their business profile (HTTP 200).
    - Nonexistent UUID returns HTTP 404.
    - Malformed UUID returns HTTP 422.
    """
    # Fetch list to obtain valid ID
    list_res = client.get(f"{settings.API_V1_STR}/businesses", headers=user_a.auth_headers)
    biz_id = list_res.json()[0]["id"]

    # Valid fetch
    get_res = client.get(f"{settings.API_V1_STR}/businesses/{biz_id}", headers=user_a.auth_headers)
    assert get_res.status_code == status.HTTP_200_OK
    assert get_res.json()["id"] == biz_id

    # Nonexistent UUID
    random_id = uuid.uuid4()
    nf_res = client.get(f"{settings.API_V1_STR}/businesses/{random_id}", headers=user_a.auth_headers)
    assert nf_res.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in nf_res.json()["detail"].lower()

    # Malformed UUID path parameter
    bad_res = client.get(f"{settings.API_V1_STR}/businesses/not-a-uuid", headers=user_a.auth_headers)
    assert bad_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


# ==========================================
# 5. UPDATING & IMMUTABLE FIELD TESTS
# ==========================================

def test_update_business_partial_and_immutability(user_a, db):
    """
    Verify partial updates:
    - Owner can update permitted fields (PATCH).
    - Unsupplied fields remain untouched.
    - Database-managed/ownership fields (id, owner_user_id, created_at) cannot be modified.
    - Nonexistent business returns HTTP 404.
    """
    list_res = client.get(f"{settings.API_V1_STR}/businesses", headers=user_a.auth_headers)
    original_biz = list_res.json()[0]
    biz_id = original_biz["id"]

    fake_user_id = str(uuid.uuid4())
    fake_new_id = str(uuid.uuid4())

    patch_payload = {
        "trade_name": "Gupta Supermart & Kirana",
        "owner_user_id": fake_user_id,  # Must be ignored
        "id": fake_new_id,              # Must be ignored
    }

    patch_res = client.patch(
        f"{settings.API_V1_STR}/businesses/{biz_id}",
        json=patch_payload,
        headers=user_a.auth_headers,
    )
    assert patch_res.status_code == status.HTTP_200_OK
    updated_data = patch_res.json()

    # Updated field
    assert updated_data["trade_name"] == "Gupta Supermart & Kirana"
    # Preserved fields
    assert updated_data["category"] == original_biz["category"]
    assert updated_data["business_type"] == original_biz["business_type"]
    assert updated_data["operating_days"] == original_biz["operating_days"]
    # Immutability
    assert updated_data["id"] == biz_id
    assert updated_data["owner_user_id"] == str(user_a.id)

    # Nonexistent business update returns 404
    non_existent_id = uuid.uuid4()
    nf_patch = client.patch(
        f"{settings.API_V1_STR}/businesses/{non_existent_id}",
        json={"trade_name": "Ghost Store"},
        headers=user_a.auth_headers,
    )
    assert nf_patch.status_code == status.HTTP_404_NOT_FOUND


# ==========================================
# 6. TWO-TENANT ISOLATION END-TO-END TEST
# ==========================================

def test_two_tenant_security_isolation(user_a, user_b):
    """
    Critical multi-tenant test:
    - User A owns Business A.
    - User B owns Business B.
    - User A cannot see, fetch, or update Business B (returns 404, not 403, preventing info leakage).
    - User B cannot see, fetch, or update Business A (returns 404, not 403).
    """
    # 1. Create Business B as User B
    biz_b_payload = {
        "trade_name": "Beta Medical Stores",
        "category": "Pharmacy",
        "business_type": "Partnership",
        "operating_days": ["Monday", "Tuesday", "Wednesday"],
    }
    res_create_b = client.post(
        f"{settings.API_V1_STR}/businesses",
        json=biz_b_payload,
        headers=user_b.auth_headers,
    )
    assert res_create_b.status_code == status.HTTP_201_CREATED
    biz_b_id = res_create_b.json()["id"]

    # 2. Get Business A ID from User A
    res_list_a = client.get(f"{settings.API_V1_STR}/businesses", headers=user_a.auth_headers)
    biz_a_id = res_list_a.json()[0]["id"]

    # --- Checks as User A against User B's resource ---
    # User A listing does NOT contain Business B
    list_a_ids = [b["id"] for b in res_list_a.json()]
    assert biz_b_id not in list_a_ids

    # User A cannot GET Business B
    cross_get_a = client.get(f"{settings.API_V1_STR}/businesses/{biz_b_id}", headers=user_a.auth_headers)
    assert cross_get_a.status_code == status.HTTP_404_NOT_FOUND

    # User A cannot PATCH Business B
    cross_patch_a = client.patch(
        f"{settings.API_V1_STR}/businesses/{biz_b_id}",
        json={"trade_name": "Hacked Name by User A"},
        headers=user_a.auth_headers,
    )
    assert cross_patch_a.status_code == status.HTTP_404_NOT_FOUND

    # --- Checks as User B against User A's resource ---
    # User B listing does NOT contain Business A
    res_list_b = client.get(f"{settings.API_V1_STR}/businesses", headers=user_b.auth_headers)
    list_b_ids = [b["id"] for b in res_list_b.json()]
    assert biz_a_id not in list_b_ids
    assert biz_b_id in list_b_ids

    # User B cannot GET Business A
    cross_get_b = client.get(f"{settings.API_V1_STR}/businesses/{biz_a_id}", headers=user_b.auth_headers)
    assert cross_get_b.status_code == status.HTTP_404_NOT_FOUND

    # User B cannot PATCH Business A
    cross_patch_b = client.patch(
        f"{settings.API_V1_STR}/businesses/{biz_a_id}",
        json={"trade_name": "Hacked Name by User B"},
        headers=user_b.auth_headers,
    )
    assert cross_patch_b.status_code == status.HTTP_404_NOT_FOUND

    # Confirm Business B was never mutated by User A's unauthorized attempt
    verify_b = client.get(f"{settings.API_V1_STR}/businesses/{biz_b_id}", headers=user_b.auth_headers)
    assert verify_b.status_code == status.HTTP_200_OK
    assert verify_b.json()["trade_name"] == "Beta Medical Stores"

    # Confirm Business A was never mutated by User B's unauthorized attempt
    verify_a = client.get(f"{settings.API_V1_STR}/businesses/{biz_a_id}", headers=user_a.auth_headers)
    assert verify_a.status_code == status.HTTP_200_OK
    assert verify_a.json()["trade_name"] == "Gupta Supermart & Kirana"
