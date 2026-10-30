from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.models.transaction import Transaction
from app.models.reconciliation import Reconciliation


class ReconciliationService:
    @classmethod
    def find_candidates(cls, db: Session, business_id: str) -> List[Dict[str, Any]]:
        """
        Scans transactions for a given business to identify potential match pairs.
        Applies:
        1. UTR / Reference match with equal amounts (confidence: 0.99)
        2. Same date + equal amount across different sources or verification states (confidence: 0.90)
        3. Window approximate match: equal amount within +/- 2 days (confidence: 0.75 - 0.85)
        """
        # Fetch unreconciled transactions for the business
        txns = db.query(Transaction).filter(
            Transaction.business_id == business_id,
            Transaction.verification_status != "RECONCILED"
        ).order_by(Transaction.transaction_date.desc()).all()

        candidates: List[Dict[str, Any]] = []
        matched_pairs_set = set()

        # Query existing unresolved reconciliations for this business
        existing_recons = db.query(Reconciliation).filter(
            Reconciliation.business_id == business_id
        ).all()
        existing_map = {
            (r.primary_transaction_id, r.matched_transaction_id): r
            for r in existing_recons
        }

        n = len(txns)
        for i in range(n):
            t1 = txns[i]
            for j in range(i + 1, n):
                t2 = txns[j]

                # Cannot match same transaction
                if t1.id == t2.id:
                    continue

                # Amounts must be equal (or within float margin)
                if abs(float(t1.amount) - float(t2.amount)) > 0.01:
                    continue

                # Flows must be compatible (either both same flow recorded twice in 2 ledgers, or counterpart entry)
                # Kirana shop pattern: UPI transaction inflow matching bank statement credit inflow
                if t1.flow_type != t2.flow_type:
                    continue

                # Skip if already paired in this run
                pair_key = tuple(sorted([t1.id, t2.id]))
                if pair_key in matched_pairs_set:
                    continue

                date_diff = abs((t1.transaction_date - t2.transaction_date).days)
                confidence = 0.0
                rule = ""

                # Rule 1: Exact Reference Number / UTR match
                if (
                    t1.reference_number
                    and t2.reference_number
                    and t1.reference_number.strip().upper() == t2.reference_number.strip().upper()
                ):
                    confidence = 0.99
                    rule = "UTR_MATCH"
                # Rule 2: Same Date + Equal Amount
                elif date_diff == 0:
                    confidence = 0.90
                    rule = "EXACT_AMOUNT_DATE"
                # Rule 3: Approximate Window (+/- 1 or 2 days)
                elif date_diff == 1:
                    confidence = 0.85
                    rule = "WINDOW_APPROXIMATE"
                elif date_diff == 2:
                    confidence = 0.75
                    rule = "WINDOW_APPROXIMATE"
                else:
                    continue

                matched_pairs_set.add(pair_key)

                # Check if reconciliation record already stored in DB
                recon_record = existing_map.get((t1.id, t2.id)) or existing_map.get((t2.id, t1.id))
                if not recon_record:
                    recon_record = Reconciliation(
                        business_id=business_id,
                        primary_transaction_id=t1.id,
                        matched_transaction_id=t2.id,
                        confidence_score=confidence,
                        match_rule=rule,
                        status="PENDING_REVIEW"
                    )
                    db.add(recon_record)
                    db.flush()

                # Don't show if already rejected
                if recon_record.status == "REJECTED":
                    continue

                candidates.append({
                    "id": recon_record.id,
                    "primary_transaction": {
                        "id": t1.id,
                        "transaction_date": t1.transaction_date,
                        "amount": float(t1.amount),
                        "flow_type": t1.flow_type,
                        "payment_mode": t1.payment_mode,
                        "category": t1.category,
                        "counterparty_name": t1.counterparty_name,
                        "reference_number": t1.reference_number,
                        "description": t1.description,
                        "verification_status": t1.verification_status,
                        "source_name": t1.source.source_name if t1.source else None,
                    },
                    "matched_transaction": {
                        "id": t2.id,
                        "transaction_date": t2.transaction_date,
                        "amount": float(t2.amount),
                        "flow_type": t2.flow_type,
                        "payment_mode": t2.payment_mode,
                        "category": t2.category,
                        "counterparty_name": t2.counterparty_name,
                        "reference_number": t2.reference_number,
                        "description": t2.description,
                        "verification_status": t2.verification_status,
                        "source_name": t2.source.source_name if t2.source else None,
                    },
                    "confidence_score": confidence,
                    "match_rule": rule,
                    "status": recon_record.status,
                    "review_notes": recon_record.review_notes,
                })

        db.commit()
        return candidates

    @classmethod
    def resolve_match(
        cls,
        db: Session,
        business_id: str,
        action: str,
        reconciliation_id: Optional[str] = None,
        primary_id: Optional[str] = None,
        matched_id: Optional[str] = None,
        review_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Accepts or rejects a reconciliation pair.
        On ACCEPT: updates transaction status to RECONCILED.
        """
        recon = None
        if reconciliation_id:
            recon = db.query(Reconciliation).filter(
                Reconciliation.id == reconciliation_id,
                Reconciliation.business_id == business_id
            ).first()
        elif primary_id and matched_id:
            recon = db.query(Reconciliation).filter(
                Reconciliation.business_id == business_id,
                or_(
                    and_(Reconciliation.primary_transaction_id == primary_id, Reconciliation.matched_transaction_id == matched_id),
                    and_(Reconciliation.primary_transaction_id == matched_id, Reconciliation.matched_transaction_id == primary_id)
                )
            ).first()

        if not recon:
            raise ValueError("Reconciliation record not found for this business.")

        act = action.strip().upper()
        if act not in ("ACCEPT", "REJECT"):
            raise ValueError("Action must be either 'ACCEPT' or 'REJECT'.")

        now = datetime.utcnow()
        if act == "ACCEPT":
            recon.status = "ACCEPTED"
            recon.resolved_at = now
            recon.review_notes = review_notes

            # Upgrade transaction statuses to RECONCILED
            if recon.primary_transaction:
                recon.primary_transaction.verification_status = "RECONCILED"
            if recon.matched_transaction:
                recon.matched_transaction.verification_status = "RECONCILED"

        elif act == "REJECT":
            recon.status = "REJECTED"
            recon.resolved_at = now
            recon.review_notes = review_notes

        db.commit()
        db.refresh(recon)

        return {
            "reconciliation_id": recon.id,
            "status": recon.status,
            "action": act,
            "resolved_at": recon.resolved_at,
        }
