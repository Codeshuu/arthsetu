import hashlib
from typing import Dict, Any, List, Set, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.transaction import Transaction


class DuplicateService:
    @staticmethod
    def generate_fingerprint(
        transaction_date: str,
        amount: float,
        reference_number: Optional[str] = None,
        counterparty_name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> str:
        """
        Generates a deterministic SHA-256 fingerprint for a transaction record.
        Prioritizes reference_number (UTR/UPI Ref).
        """
        clean_date = str(transaction_date).strip()
        clean_amt = f"{round(float(amount), 2):.2f}"
        clean_ref = (reference_number or "").strip().upper()
        clean_party = (counterparty_name or "").strip().upper()
        clean_desc = (description or "").strip().upper()

        if clean_ref:
            # High specificity when reference number is present
            raw_key = f"{clean_date}|{clean_amt}|{clean_ref}"
        else:
            # Fallback specificity using party and description
            raw_key = f"{clean_date}|{clean_amt}|{clean_party}|{clean_desc[:40]}"

        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    @classmethod
    def check_in_batch_duplicates(
        cls,
        parsed_rows: List[Dict[str, Any]]
    ) -> List[Tuple[int, bool, str]]:
        """
        Scans a list of parsed row dictionaries and identifies in-batch duplicates.
        Returns a list of tuples: (row_index, is_duplicate, fingerprint).
        """
        seen_fingerprints: Set[str] = set()
        results: List[Tuple[int, bool, str]] = []

        for idx, row in enumerate(parsed_rows):
            if not row:
                results.append((idx, False, ""))
                continue

            fp = cls.generate_fingerprint(
                transaction_date=row.get("transaction_date", ""),
                amount=row.get("amount", 0.0),
                reference_number=row.get("reference_number"),
                counterparty_name=row.get("counterparty_name"),
                description=row.get("description"),
            )

            if fp in seen_fingerprints:
                results.append((idx, True, fp))
            else:
                seen_fingerprints.add(fp)
                results.append((idx, False, fp))

        return results

    @classmethod
    def check_existing_db_duplicate(
        cls,
        db: Session,
        business_id: str,
        transaction_date: str,
        amount: float,
        reference_number: Optional[str] = None,
    ) -> bool:
        """
        Checks whether an identical transaction already exists in the transactions table
        for the specified business_id.
        """
        from datetime import datetime
        if isinstance(transaction_date, str):
            dt = datetime.strptime(transaction_date[:10], "%Y-%m-%d").date()
        else:
            dt = transaction_date

        query = db.query(Transaction).filter(
            Transaction.business_id == business_id,
            Transaction.transaction_date == dt,
            Transaction.amount == round(float(amount), 2),
        )

        if reference_number and reference_number.strip():
            # If reference number is given, strict match on reference number
            match = query.filter(Transaction.reference_number == reference_number.strip()).first()
            return match is not None

        # When no reference number exists, check if any unreferenced transaction matches
        match = query.filter(Transaction.reference_number.is_(None)).first()
        return match is not None
