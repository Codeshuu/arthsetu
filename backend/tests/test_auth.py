import uuid
from datetime import timedelta
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.core.config import settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.db.session import SessionLocal
from app.main import app
from app.models.user import User

client = TestClient(app)


@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()


def test_password_hashing_and_verification():
    """Test 3, 4, 5: Verify password hashing, verification, and limits."""
    raw_pass = "SecureKirana#2026"
    hashed = hash_password(raw_pass)

    # Stored as hash, not plaintext
    assert hashed != raw_pass
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")

    # Correct password verification
    assert verify_password(raw_pass, hashed) is True

    # Incorrect password rejection
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password("", hashed) is False

    # Safe handling of invalid hashes
    assert verify_password(raw_pass, "not-a-valid-bcrypt-hash") is False

    # 72-byte limit handling
    long_pass = "A" * 73
    with pytest.raises(ValueError, match="72 bytes"):
        hash_password(long_pass)
    assert verify_password(long_pass, hashed) is False


def test_jwt_generation_and_validation():
    """Test 7, 8, 9, 10: Test JWT issuance, decoding, invalid token, and expiry."""
    test_uid = uuid.uuid4()

    # Valid token
    token = create_access_token(subject=test_uid)
    payload = decode_access_token(token)
    assert payload["sub"] == str(test_uid)
    assert "exp" in payload

    # Expired token rejection
    expired_token = create_access_token(subject=test_uid, expires_delta=timedelta(seconds=-10))
    import jwt
    with pytest.raises(jwt.ExpiredSignatureError):
        decode_access_token(expired_token)

    # Invalid token rejection
    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token("this.is.a.garbage.token")


def test_user_registration_flow(db):
    """Test 1, 2, 3, 14: Test user registration, duplicate rejection, and hash concealment."""
    unique_email = f"owner_{uuid.uuid4().hex[:8]}@kirana.org"
    password = "StorePassword@123"

    reg_payload = {
        "email": f"  {unique_email.upper()}  ",  # Test normalization (whitespace + uppercase)
        "password": password,
        "full_name": "Suresh Gupta",
    }

    # 1. Successful registration
    response = client.post(f"{settings.API_V1_STR}/auth/register", json=reg_payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()

    assert data["email"] == unique_email.lower()
    assert data["full_name"] == "Suresh Gupta"
    assert data["is_active"] is True
    assert "id" in data
    # 14. User response never contains password_hash
    assert "password_hash" not in data
    assert "password" not in data

    # 3. Database verification: stored as hash, not plaintext
    created_user = db.execute(
        select(User).where(User.email == unique_email.lower())
    ).scalar_one_or_none()
    assert created_user is not None
    assert created_user.password_hash != password
    assert verify_password(password, created_user.password_hash) is True

    # 2. Duplicate email rejection
    dup_response = client.post(f"{settings.API_V1_STR}/auth/register", json=reg_payload)
    assert dup_response.status_code == status.HTTP_409_CONFLICT
    assert "already exists" in dup_response.json()["detail"]

    # Cleanup
    db.delete(created_user)
    db.commit()


def test_user_login_flow(db):
    """Test 6, 7: Test successful login, incorrect password, nonexistent user, and inactive user."""
    test_email = f"login_{uuid.uuid4().hex[:8]}@kirana.org"
    raw_pass = "LoginSecret#99"

    # Seed active user
    user = User(
        email=test_email,
        password_hash=hash_password(raw_pass),
        full_name="Pooja Sharma",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 6. Successful login
    login_resp = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": test_email, "password": raw_pass},
    )
    assert login_resp.status_code == status.HTTP_200_OK
    tokens = login_resp.json()
    assert "access_token" in tokens
    assert tokens["token_type"] == "bearer"
    assert tokens["expires_in"] == settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    # 5. Incorrect password rejection
    bad_pass_resp = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": test_email, "password": "WrongPassword!"},
    )
    assert bad_pass_resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert bad_pass_resp.json()["detail"] == "Invalid email or password"

    # Nonexistent user rejection
    unknown_resp = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": "nonexistent@user.com", "password": raw_pass},
    )
    assert unknown_resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert unknown_resp.json()["detail"] == "Invalid email or password"

    # 12. Inactive user rejection
    user.is_active = False
    db.commit()

    inactive_resp = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={"email": test_email, "password": raw_pass},
    )
    assert inactive_resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Inactive user account" in inactive_resp.json()["detail"]

    # Cleanup
    db.delete(user)
    db.commit()


def test_auth_me_endpoint_and_token_protection(db):
    """Test 8, 9, 10, 11, 12, 13: Test GET /auth/me with valid, invalid, expired, and multi-user tokens."""
    # Create User A
    user_a = User(
        email=f"user_a_{uuid.uuid4().hex[:8]}@kirana.org",
        password_hash=hash_password("PassUserA!123"),
        full_name="User Alpha",
        is_active=True,
    )
    # Create User B
    user_b = User(
        email=f"user_b_{uuid.uuid4().hex[:8]}@kirana.org",
        password_hash=hash_password("PassUserB!456"),
        full_name="User Beta",
        is_active=True,
    )
    db.add_all([user_a, user_b])
    db.commit()
    db.refresh(user_a)
    db.refresh(user_b)

    token_a = create_access_token(subject=user_a.id)
    token_b = create_access_token(subject=user_b.id)

    # 13. GET /auth/me returns the correct user
    resp_a = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert resp_a.status_code == status.HTTP_200_OK
    assert resp_a.json()["id"] == str(user_a.id)
    assert resp_a.json()["email"] == user_a.email

    resp_b = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp_b.status_code == status.HTTP_200_OK
    assert resp_b.json()["id"] == str(user_b.id)
    assert resp_b.json()["email"] == user_b.email

    # Multi-tenant proof: User A's token cannot identify User B
    assert resp_a.json()["id"] != resp_b.json()["id"]

    # 11. Missing token rejection
    no_token_resp = client.get(f"{settings.API_V1_STR}/auth/me")
    assert no_token_resp.status_code == status.HTTP_401_UNAUTHORIZED

    # 9. Invalid token rejection
    bad_token_resp = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": "Bearer invalid.fake.token"},
    )
    assert bad_token_resp.status_code == status.HTTP_401_UNAUTHORIZED

    # 10. Expired token rejection
    expired_token = create_access_token(subject=user_a.id, expires_delta=timedelta(seconds=-1))
    expired_resp = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert expired_resp.status_code == status.HTTP_401_UNAUTHORIZED

    # 12. Inactive user token rejection
    user_a.is_active = False
    db.commit()

    inactive_token_resp = client.get(
        f"{settings.API_V1_STR}/auth/me",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert inactive_token_resp.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Inactive user account" in inactive_token_resp.json()["detail"]

    # Cleanup
    db.delete(user_a)
    db.delete(user_b)
    db.commit()
