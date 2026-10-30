import logging
from sqlalchemy.orm import Session
from app.core.config import settings

logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    """
    Initialize database context and baseline seed data.

    CRITICAL ARCHITECTURAL RULE:
    Tables must NOT be created automatically on application startup in production
    (no Base.metadata.create_all). All schema definitions and alterations are
    managed strictly through Alembic migrations to ensure auditability and prevent
    uncontrolled schema mutations.

    This function is reserved for seeding essential lookup data or initial system
    defaults once migrations have established the schema.
    """
    db_target = settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else settings.DATABASE_URL
    logger.info(
        "Checking database initialization state for environment '%s' (Target: %s)",
        settings.ENVIRONMENT,
        db_target
    )
    # Seed data injection logic will be activated when models are migrated in subsequent tasks.
