"""Initial schema with 8 core models

Revision ID: aea5e99fefc6
Revises: 
Create Date: 2026-10-31 01:09:02.156544

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aea5e99fefc6'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # -------------------------------------------------------------------------
    # 1. USERS TABLE (Root Dependency)
    # -------------------------------------------------------------------------
    op.create_table(
        'users',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # -------------------------------------------------------------------------
    # 2. BUSINESSES TABLE (Depends on users)
    # -------------------------------------------------------------------------
    op.create_table(
        'businesses',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('owner_user_id', sa.Uuid(), nullable=False),
        sa.Column('trade_name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('business_type', sa.String(length=100), nullable=False),
        sa.Column('operating_days', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['owner_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_businesses_owner_user_id'), 'businesses', ['owner_user_id'], unique=False)

    # -------------------------------------------------------------------------
    # 3. SOURCES TABLE (Depends on businesses, users)
    # -------------------------------------------------------------------------
    op.create_table(
        'sources',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('source_type', sa.String(length=50), nullable=False),
        sa.Column('source_name', sa.String(length=255), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=True),
        sa.Column('submitted_by', sa.Uuid(), nullable=True),
        sa.Column('authenticity_status', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['submitted_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_sources_business_id'), 'sources', ['business_id'], unique=False)
    op.create_index(op.f('ix_sources_submitted_by'), 'sources', ['submitted_by'], unique=False)

    # -------------------------------------------------------------------------
    # 4. IMPORT BATCHES TABLE (Depends on businesses, sources)
    # -------------------------------------------------------------------------
    op.create_table(
        'import_batches',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('source_id', sa.Uuid(), nullable=True),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('stored_filepath', sa.String(length=500), nullable=False),
        sa.Column('file_hash_sha256', sa.String(length=64), nullable=False),
        sa.Column('total_rows', sa.Integer(), nullable=False),
        sa.Column('valid_rows', sa.Integer(), nullable=False),
        sa.Column('error_rows', sa.Integer(), nullable=False),
        sa.Column('duplicate_rows', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('column_mapping', sa.JSON(), nullable=True),
        sa.Column('error_summary', sa.JSON(), nullable=True),
        sa.Column('date_range_start', sa.Date(), nullable=True),
        sa.Column('date_range_end', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['source_id'], ['sources.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_import_batches_business_id'), 'import_batches', ['business_id'], unique=False)
    op.create_index(op.f('ix_import_batches_file_hash_sha256'), 'import_batches', ['file_hash_sha256'], unique=False)
    op.create_index(op.f('ix_import_batches_source_id'), 'import_batches', ['source_id'], unique=False)

    # -------------------------------------------------------------------------
    # 5. IMPORT ROWS TABLE (Depends on import_batches)
    # Note: FK to transactions.id is deferred until transactions table is created.
    # -------------------------------------------------------------------------
    op.create_table(
        'import_rows',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('batch_id', sa.Uuid(), nullable=False),
        sa.Column('row_number', sa.Integer(), nullable=False),
        sa.Column('raw_data', sa.JSON(), nullable=False),
        sa.Column('parsed_data', sa.JSON(), nullable=True),
        sa.Column('validation_status', sa.String(length=50), nullable=False),
        sa.Column('validation_errors', sa.JSON(), nullable=True),
        sa.Column('duplicate_of_transaction_id', sa.Uuid(), nullable=True),
        sa.Column('is_committed', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['batch_id'], ['import_batches.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_import_rows_batch_id'), 'import_rows', ['batch_id'], unique=False)
    op.create_index('ix_import_rows_batch_validation', 'import_rows', ['batch_id', 'validation_status'], unique=False)
    op.create_index(op.f('ix_import_rows_duplicate_of_transaction_id'), 'import_rows', ['duplicate_of_transaction_id'], unique=False)

    # -------------------------------------------------------------------------
    # 6. TRANSACTIONS TABLE (Depends on businesses, sources, import_batches, import_rows)
    # -------------------------------------------------------------------------
    op.create_table(
        'transactions',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('source_id', sa.Uuid(), nullable=True),
        sa.Column('import_batch_id', sa.Uuid(), nullable=True),
        sa.Column('import_row_id', sa.Uuid(), nullable=True),
        sa.Column('transaction_date', sa.Date(), nullable=False),
        sa.Column('transaction_time', sa.Time(), nullable=True),
        sa.Column('amount', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('flow_type', sa.String(length=20), nullable=False),
        sa.Column('payment_mode', sa.String(length=50), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('counterparty_name', sa.String(length=255), nullable=True),
        sa.Column('counterparty_identifier', sa.String(length=255), nullable=True),
        sa.Column('reference_number', sa.String(length=255), nullable=True),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('dedup_hash', sa.String(length=64), nullable=True),
        sa.Column('is_flagged', sa.Boolean(), nullable=False),
        sa.Column('flag_reason', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('amount > 0', name='ck_transactions_amount_positive'),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['import_batch_id'], ['import_batches.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['import_row_id'], ['import_rows.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['source_id'], ['sources.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_transactions_business_date', 'transactions', ['business_id', 'transaction_date'], unique=False)
    op.create_index('ix_transactions_business_dedup', 'transactions', ['business_id', 'dedup_hash'], unique=False)
    op.create_index(op.f('ix_transactions_business_id'), 'transactions', ['business_id'], unique=False)
    op.create_index(op.f('ix_transactions_import_batch_id'), 'transactions', ['import_batch_id'], unique=False)
    op.create_index(op.f('ix_transactions_import_row_id'), 'transactions', ['import_row_id'], unique=False)
    op.create_index(op.f('ix_transactions_source_id'), 'transactions', ['source_id'], unique=False)
    op.create_index(op.f('ix_transactions_transaction_date'), 'transactions', ['transaction_date'], unique=False)

    # -------------------------------------------------------------------------
    # 7. ADD CIRCULAR FK: import_rows.duplicate_of_transaction_id -> transactions.id
    # -------------------------------------------------------------------------
    op.create_foreign_key(
        'fk_import_rows_duplicate_of_transaction_id',
        'import_rows',
        'transactions',
        ['duplicate_of_transaction_id'],
        ['id'],
        ondelete='SET NULL',
    )

    # -------------------------------------------------------------------------
    # 8. RECONCILIATIONS TABLE (Depends on businesses, transactions, users)
    # -------------------------------------------------------------------------
    op.create_table(
        'reconciliations',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('primary_transaction_id', sa.Uuid(), nullable=False),
        sa.Column('matched_transaction_id', sa.Uuid(), nullable=False),
        sa.Column('confidence_score', sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column('match_rule', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('review_notes', sa.String(length=500), nullable=True),
        sa.Column('resolved_by_user_id', sa.Uuid(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('confidence_score >= 0 AND confidence_score <= 1', name='ck_reconciliation_confidence_range'),
        sa.CheckConstraint('primary_transaction_id != matched_transaction_id', name='ck_reconciliation_distinct_txns'),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['matched_transaction_id'], ['transactions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['primary_transaction_id'], ['transactions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['resolved_by_user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_reconciliations_business_id'), 'reconciliations', ['business_id'], unique=False)
    op.create_index(op.f('ix_reconciliations_matched_transaction_id'), 'reconciliations', ['matched_transaction_id'], unique=False)
    op.create_index(op.f('ix_reconciliations_primary_transaction_id'), 'reconciliations', ['primary_transaction_id'], unique=False)
    op.create_index(op.f('ix_reconciliations_resolved_by_user_id'), 'reconciliations', ['resolved_by_user_id'], unique=False)

    # -------------------------------------------------------------------------
    # 9. PASSPORTS TABLE (Depends on businesses, users)
    # -------------------------------------------------------------------------
    op.create_table(
        'passports',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('business_id', sa.Uuid(), nullable=False),
        sa.Column('generated_by', sa.Uuid(), nullable=True),
        sa.Column('period_start', sa.Date(), nullable=False),
        sa.Column('period_end', sa.Date(), nullable=False),
        sa.Column('metrics_snapshot', sa.JSON(), nullable=False),
        sa.Column('evidence_breakdown', sa.JSON(), nullable=False),
        sa.Column('anomaly_summary', sa.JSON(), nullable=False),
        sa.Column('pdf_filepath', sa.String(length=500), nullable=True),
        sa.Column('sha256_hash', sa.String(length=64), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint('period_start <= period_end', name='ck_passports_period_valid'),
        sa.ForeignKeyConstraint(['business_id'], ['businesses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['generated_by'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_passports_business_id'), 'passports', ['business_id'], unique=False)
    op.create_index('ix_passports_business_period', 'passports', ['business_id', 'period_start', 'period_end'], unique=False)
    op.create_index(op.f('ix_passports_generated_by'), 'passports', ['generated_by'], unique=False)


def downgrade() -> None:
    # Drop in strict reverse topological order
    op.drop_index('ix_passports_business_period', table_name='passports')
    op.drop_index(op.f('ix_passports_generated_by'), table_name='passports')
    op.drop_index(op.f('ix_passports_business_id'), table_name='passports')
    op.drop_table('passports')

    op.drop_index(op.f('ix_reconciliations_resolved_by_user_id'), table_name='reconciliations')
    op.drop_index(op.f('ix_reconciliations_primary_transaction_id'), table_name='reconciliations')
    op.drop_index(op.f('ix_reconciliations_matched_transaction_id'), table_name='reconciliations')
    op.drop_index(op.f('ix_reconciliations_business_id'), table_name='reconciliations')
    op.drop_table('reconciliations')

    # Drop circular foreign key before dropping transactions or import_rows
    op.drop_constraint('fk_import_rows_duplicate_of_transaction_id', 'import_rows', type_='foreignkey')

    op.drop_index(op.f('ix_transactions_transaction_date'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_source_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_import_row_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_import_batch_id'), table_name='transactions')
    op.drop_index(op.f('ix_transactions_business_id'), table_name='transactions')
    op.drop_index('ix_transactions_business_dedup', table_name='transactions')
    op.drop_index('ix_transactions_business_date', table_name='transactions')
    op.drop_table('transactions')

    op.drop_index(op.f('ix_import_rows_duplicate_of_transaction_id'), table_name='import_rows')
    op.drop_index('ix_import_rows_batch_validation', table_name='import_rows')
    op.drop_index(op.f('ix_import_rows_batch_id'), table_name='import_rows')
    op.drop_table('import_rows')

    op.drop_index(op.f('ix_import_batches_source_id'), table_name='import_batches')
    op.drop_index(op.f('ix_import_batches_file_hash_sha256'), table_name='import_batches')
    op.drop_index(op.f('ix_import_batches_business_id'), table_name='import_batches')
    op.drop_table('import_batches')

    op.drop_index(op.f('ix_sources_submitted_by'), table_name='sources')
    op.drop_index(op.f('ix_sources_business_id'), table_name='sources')
    op.drop_table('sources')

    op.drop_index(op.f('ix_businesses_owner_user_id'), table_name='businesses')
    op.drop_table('businesses')

    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
