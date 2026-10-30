import os
import io
import uuid
import hashlib
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.import_batch import ImportBatch
from app.models.import_row import ImportRow
from app.models.transaction import Transaction
from app.services.validation_service import ValidationService
from app.services.duplicate_service import DuplicateService


class ImportService:
    @staticmethod
    def compute_sha256(content: bytes) -> str:
        """Computes SHA-256 hash of file bytes."""
        return hashlib.sha256(content).hexdigest()

    @staticmethod
    def read_dataframe(file_bytes: bytes, filename: str) -> pd.DataFrame:
        """
        Reads CSV or Excel file bytes into a pandas DataFrame with automatic encoding handling.
        """
        lower_name = filename.lower()
        if lower_name.endswith(".xlsx") or lower_name.endswith(".xls"):
            return pd.read_excel(io.BytesIO(file_bytes))

        # CSV reading with fallback encodings
        encodings = ["utf-8-sig", "utf-8", "latin1", "cp1252", "iso-8859-1"]
        for enc in encodings:
            try:
                # sep=None with engine='python' autodetects delimiter (comma, semicolon, tab)
                df = pd.read_csv(io.BytesIO(file_bytes), encoding=enc, sep=None, engine="python")
                return df
            except Exception:
                continue

        # Final attempt with standard comma separator
        return pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8", errors="replace")

    @classmethod
    def save_and_initiate_batch(
        cls,
        file_bytes: bytes,
        filename: str,
        business_id: str,
        db: Session,
        source_id: Optional[str] = None
    ) -> Tuple[ImportBatch, Dict[str, Any], bool]:
        """
        Saves raw CSV/Excel file to storage/imports/, checks for duplicate hash,
        creates ImportBatch and raw ImportRow records.
        Returns (batch, upload_metadata, is_duplicate_batch).
        """
        # Ensure storage directory exists
        storage_dir = os.path.join(settings.STORAGE_DIR, "imports")
        os.makedirs(storage_dir, exist_ok=True)

        file_hash = cls.compute_sha256(file_bytes)

        # Check for existing batch with identical SHA-256 for this business
        existing_batch = db.query(ImportBatch).filter(
            ImportBatch.business_id == business_id,
            ImportBatch.file_hash_sha256 == file_hash
        ).first()

        is_duplicate_batch = existing_batch is not None

        batch_id = str(uuid.uuid4())
        safe_filename = f"{batch_id}_{os.path.basename(filename)}"
        stored_filepath = os.path.join(storage_dir, safe_filename)

        with open(stored_filepath, "wb") as f:
            f.write(file_bytes)

        # Parse DataFrame to inspect headers and rows
        df = cls.read_dataframe(file_bytes, filename)
        df = df.where(pd.notnull(df), None)  # Replace NaN with None

        raw_columns = [str(c).strip() for c in df.columns]
        suggested_mapping = ValidationService.autodetect_columns(raw_columns)
        total_rows = len(df)

        # Create ImportBatch record
        batch = ImportBatch(
            id=batch_id,
            business_id=business_id,
            source_id=source_id,
            original_filename=filename,
            stored_filepath=stored_filepath,
            file_hash_sha256=file_hash,
            total_rows=total_rows,
            valid_rows=0,
            error_rows=0,
            duplicate_rows=0,
            status="PENDING",
            column_mapping=suggested_mapping,
            error_summary={},
        )
        db.add(batch)
        db.flush()

        # Insert raw rows into import_rows
        import_row_objects = []
        for idx, row in df.iterrows():
            row_dict = {str(k): (None if pd.isna(v) else v) for k, v in row.to_dict().items()}
            import_row_objects.append(
                ImportRow(
                    batch_id=batch.id,
                    row_index=int(idx) + 1,
                    raw_data=row_dict,
                    parsed_data=None,
                    validation_status="VALID",
                    validation_error=None,
                    is_committed=False,
                )
            )

        if import_row_objects:
            db.bulk_save_objects(import_row_objects)
        db.commit()
        db.refresh(batch)

        sample_rows = [r.raw_data for r in db.query(ImportRow).filter(ImportRow.batch_id == batch.id).limit(5).all()]

        upload_meta = {
            "batch_id": batch.id,
            "original_filename": filename,
            "file_hash_sha256": file_hash,
            "total_rows_detected": total_rows,
            "raw_columns": raw_columns,
            "suggested_mapping": suggested_mapping,
            "sample_rows": sample_rows,
            "is_duplicate_batch": is_duplicate_batch,
            "message": "Duplicate batch hash detected for this business." if is_duplicate_batch else "File successfully uploaded and scanned."
        }

        return batch, upload_meta, is_duplicate_batch

    @classmethod
    def map_columns_and_validate(
        cls,
        batch_id: str,
        business_id: str,
        mapping: Dict[str, str],
        default_payment_mode: str,
        default_flow_type: Optional[str],
        db: Session
    ) -> Dict[str, Any]:
        """
        Applies mapping to all raw import_rows, runs row validation & in-batch deduplication,
        and saves parsed rows back to the database.
        """
        batch = db.query(ImportBatch).filter(
            ImportBatch.id == batch_id,
            ImportBatch.business_id == business_id
        ).first()

        if not batch:
            raise ValueError("Import batch not found or does not belong to this business.")

        rows = db.query(ImportRow).filter(ImportRow.batch_id == batch_id).order_by(ImportRow.row_index).all()

        valid_count = 0
        error_count = 0
        duplicate_count = 0

        # Step 1: Normalize all rows
        parsed_records: List[Dict[str, Any]] = []
        validation_results: List[Tuple[bool, Optional[Dict[str, Any]], Optional[str]]] = []

        for row in rows:
            is_valid, parsed_data, err = ValidationService.normalize_row(
                raw_row=row.raw_data,
                row_index=row.row_index,
                mapping=mapping,
                default_payment_mode=default_payment_mode,
                default_flow_type=default_flow_type
            )
            validation_results.append((is_valid, parsed_data, err))
            parsed_records.append(parsed_data if is_valid else {})

        # Step 2: Check in-batch duplicates on valid records
        in_batch_duplicates = DuplicateService.check_in_batch_duplicates(parsed_records)

        # Step 3: Update row records
        preview_list = []
        for i, row in enumerate(rows):
            is_valid, parsed_data, err = validation_results[i]
            _, is_duplicate, _ = in_batch_duplicates[i]

            if not is_valid:
                row.validation_status = "INVALID"
                row.validation_error = err
                row.parsed_data = None
                error_count += 1
            elif is_duplicate:
                row.validation_status = "DUPLICATE"
                row.validation_error = "In-batch duplicate transaction detected (identical date, amount, reference)"
                row.parsed_data = parsed_data
                duplicate_count += 1
            else:
                row.validation_status = "VALID"
                row.validation_error = None
                row.parsed_data = parsed_data
                valid_count += 1

            if i < 10:  # Return first 10 for preview response
                preview_list.append({
                    "row_index": row.row_index,
                    "raw_data": row.raw_data,
                    "parsed_data": row.parsed_data,
                    "validation_status": row.validation_status,
                    "validation_error": row.validation_error,
                })

        batch.column_mapping = mapping
        batch.total_rows = len(rows)
        batch.valid_rows = valid_count
        batch.error_rows = error_count
        batch.duplicate_rows = duplicate_count
        batch.status = "VALIDATED"
        db.commit()

        return {
            "batch_id": batch.id,
            "total_rows": batch.total_rows,
            "valid_rows": valid_count,
            "error_rows": error_count,
            "duplicate_rows": duplicate_count,
            "preview": preview_list,
        }

    @classmethod
    def commit_batch_to_transactions(
        cls,
        batch_id: str,
        business_id: str,
        overwrite_duplicates: bool,
        db: Session
    ) -> Dict[str, Any]:
        """
        Commits validated rows from import_rows into the active transactions table.
        Checks for cross-batch duplicates against the database.
        """
        batch = db.query(ImportBatch).filter(
            ImportBatch.id == batch_id,
            ImportBatch.business_id == business_id
        ).first()

        if not batch:
            raise ValueError("Import batch not found or does not belong to this business.")

        rows_to_commit = db.query(ImportRow).filter(
            ImportRow.batch_id == batch_id,
            ImportRow.is_committed == False,
            ImportRow.validation_status.in_(["VALID", "DUPLICATE"] if overwrite_duplicates else ["VALID"])
        ).all()

        imported_count = 0
        skipped_duplicates = 0
        failed_count = 0

        for r in rows_to_commit:
            parsed = r.parsed_data
            if not parsed:
                continue

            # Check cross-batch DB duplicate
            if not overwrite_duplicates:
                is_db_dup = DuplicateService.check_existing_db_duplicate(
                    db=db,
                    business_id=business_id,
                    transaction_date=parsed["transaction_date"],
                    amount=parsed["amount"],
                    reference_number=parsed.get("reference_number")
                )
                if is_db_dup:
                    skipped_duplicates += 1
                    r.validation_status = "DUPLICATE"
                    r.validation_error = "Skipped: identical transaction already exists in database"
                    continue

            # Create Transaction record
            try:
                txn_date = datetime.strptime(parsed["transaction_date"][:10], "%Y-%m-%d").date()
                txn_time = datetime.strptime(parsed["transaction_time"], "%H:%M:%S").time() if parsed.get("transaction_time") else None

                txn = Transaction(
                    business_id=business_id,
                    source_id=batch.source_id,
                    import_batch_id=batch.id,
                    transaction_date=txn_date,
                    transaction_time=txn_time,
                    amount=parsed["amount"],
                    flow_type=parsed["flow_type"],
                    payment_mode=parsed.get("payment_mode", "OTHER"),
                    category=parsed.get("category", "SALE"),
                    counterparty_name=parsed.get("counterparty_name"),
                    reference_number=parsed.get("reference_number"),
                    description=parsed.get("description"),
                    verification_status=parsed.get("verification_status", "STATEMENT_BACKED"),
                    is_flagged=False,
                )
                db.add(txn)
                r.is_committed = True
                imported_count += 1
            except Exception as e:
                failed_count += 1
                r.validation_error = f"Commit error: {str(e)}"

        batch.status = "COMMITTED"
        db.commit()

        return {
            "batch_id": batch.id,
            "status": batch.status,
            "imported_records_count": imported_count,
            "skipped_duplicates_count": skipped_duplicates,
            "failed_records_count": failed_count,
        }
