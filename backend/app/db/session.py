import logging
from typing import Generator, Dict, Any
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)


def build_engine(database_url: str) -> Engine:
    """
    Factory function to build a SQLAlchemy 2.x engine with dialect-specific configurations.
    Supports PostgreSQL connection pooling and fallback to SQLite if PostgreSQL is unreachable.
    """
    connect_args: Dict[str, Any] = {}
    engine_kwargs: Dict[str, Any] = {}

    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        return create_engine(database_url, connect_args=connect_args)
    else:
        try:
            eng = create_engine(
                database_url,
                connect_args=connect_args,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
            )
            # Test connection immediately
            with eng.connect() as conn:
                pass
            return eng
        except Exception as exc:
            logger.warning(
                f"Could not connect to database at {database_url} ({exc}). "
                "Falling back to local SQLite database (sqlite:///./arthsetu.db)."
            )
            return create_engine(
                "sqlite:///./arthsetu.db",
                connect_args={"check_same_thread": False},
            )


# Primary application engine configured from settings with auto-fallback
engine = build_engine(settings.DATABASE_URL)

# Primary sessionmaker factory for application requests
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI reusable dependency that yields a SQLAlchemy database session
    and guarantees that the session is closed cleanly when request lifecycle completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_test_session_factory(test_database_url: str = settings.TEST_DATABASE_URL):
    """
    Helper factory for tests to obtain an isolated SQLite/test engine and session factory.
    """
    test_engine = build_engine(test_database_url)
    TestSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=test_engine,
        expire_on_commit=False,
    )
    return test_engine, TestSessionLocal
