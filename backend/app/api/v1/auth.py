from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new micro-enterprise user account",
)
def register(
    user_in: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Register a new user account.
    Checks for email collision, securely hashes the password with bcrypt,
    and returns the safe user profile (without password hash).
    """
    normalized_email = user_in.email.strip().lower()

    # Check for existing user with this email
    existing_user = db.execute(
        select(User).where(User.email == normalized_email)
    ).scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Hash password and persist user
    hashed = hash_password(user_in.password)
    user = User(
        email=normalized_email,
        password_hash=hashed,
        full_name=user_in.full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserResponse.model_validate(user)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and issue JWT access token",
)
def login(
    credentials: UserLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate user credentials against stored bcrypt hash.
    Issues a signed JWT access token valid for 24 hours.
    Returns generic 401 error on mismatch to prevent user enumeration.
    """
    normalized_email = credentials.email.strip().lower()

    user = db.execute(
        select(User).where(User.email == normalized_email)
    ).scalar_one_or_none()

    # Generic error message to prevent account enumeration
    invalid_creds_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not user:
        raise invalid_creds_exception

    if not verify_password(credentials.password, user.password_hash):
        raise invalid_creds_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)
    expires_in_seconds = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=expires_in_seconds,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Fetch profile of currently authenticated user",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Return the authenticated user's profile verified from the JWT Bearer token.
    """
    return UserResponse.model_validate(current_user)
