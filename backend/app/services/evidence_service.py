from typing import List, Dict, Any, Union
from sqlalchemy.orm import Session
from app.models.transaction import Transaction


class EvidenceService:
    @staticmethod
    def calculate_evidence_quality(
        transactions: List[Union[Transaction, Dict[str, Any]]],
    ) -> Dict[str, Any]:
        """
        Calculates 5 distinct dimensions of Evidence Quality (0-100) and an overall score.
        1. Provenance
        2. Source Status
        3. Completeness
        4. Consistency
        5. Traceability
        """
        n = len(transactions)
        if n == 0:
            return {
                "overall_score": 0.0,
                "provenance_score": 0.0,
                "source_status_score": 0.0,
                "completeness_score": 0.0,
                "consistency_score": 0.0,
                "traceability_score": 0.0,
                "dimension_breakdown": [],
                "evaluation_notes": "No transaction records available for evidence evaluation."
            }

        # Counters for each dimension
        provenance_points = 0.0
        status_points = 0.0
        complete_fields_count = 0
        consistent_count = 0
        traceable_count = 0

        for item in transactions:
            if isinstance(item, dict):
                ref = item.get("reference_number")
                party = item.get("counterparty_name")
                desc = item.get("description")
                v_status = str(item.get("verification_status", "SELF_DECLARED")).upper()
                is_flagged = bool(item.get("is_flagged", False))
                source_type = str(item.get("source_type", "")).upper()
            else:
                ref = item.reference_number
                party = item.counterparty_name
                desc = item.description
                v_status = str(item.verification_status).upper()
                is_flagged = bool(item.is_flagged)
                source_type = str(item.source.source_type).upper() if item.source else ""

            # 1. Provenance: Bank Statement (95), UPI Export (85), ERP (80), Self/Manual (50)
            if "BANK" in source_type:
                provenance_points += 95.0
            elif "UPI" in source_type:
                provenance_points += 85.0
            elif "ERP" in source_type:
                provenance_points += 80.0
            else:
                provenance_points += 60.0 if ref else 45.0

            # 2. Source Status: RECONCILED (100), STATEMENT_BACKED (85), SELF_DECLARED (50)
            if v_status == "RECONCILED":
                status_points += 100.0
            elif v_status == "STATEMENT_BACKED":
                status_points += 85.0
            else:
                status_points += 50.0

            # 3. Completeness: fields present (date, amount guaranteed; test ref, party, desc)
            fields_present = 2  # date & amount are non-null
            if desc and str(desc).strip():
                fields_present += 1
            if party and str(party).strip():
                fields_present += 1
            if ref and str(ref).strip():
                fields_present += 1
            complete_fields_count += (fields_present / 5.0)

            # 4. Consistency: non-flagged
            if not is_flagged:
                consistent_count += 1

            # 5. Traceability: has UTR / UPI reference
            if ref and str(ref).strip() and str(ref).lower() not in ("none", "nan", "null"):
                traceable_count += 1

        provenance_score = round(provenance_points / n, 1)
        source_status_score = round(status_points / n, 1)
        completeness_score = round((complete_fields_count / n) * 100.0, 1)
        consistency_score = round((consistent_count / n) * 100.0, 1)
        traceability_score = round((traceable_count / n) * 100.0, 1)

        # Overall weighted composite (0-100)
        overall_score = round(
            (provenance_score * 0.25) +
            (source_status_score * 0.25) +
            (completeness_score * 0.20) +
            (consistency_score * 0.15) +
            (traceability_score * 0.15),
            1
        )

        breakdown = [
            {
                "dimension": "Provenance",
                "score": provenance_score,
                "description": "Evaluation of original data source reliability (Bank Statements > Digital UPI Exports > Counter Entries).",
                "key_findings": [f"{round(provenance_score)}% weighted data provenance score across {n} records."]
            },
            {
                "dimension": "Source Status",
                "score": source_status_score,
                "description": "Verification tier distribution (Reconciled vs. Statement-backed vs. Self-declared).",
                "key_findings": [f"{round(source_status_score)}% verified status score."]
            },
            {
                "dimension": "Completeness",
                "score": completeness_score,
                "description": "Proportion of records containing complete contextual fields (Counterparty, Narration, Reference).",
                "key_findings": [f"{completeness_score}% of optional contextual transaction fields populated."]
            },
            {
                "dimension": "Consistency",
                "score": consistency_score,
                "description": "Integrity of financial timeline without conflicting duplicates or flagged records.",
                "key_findings": [f"{consistency_score}% clean non-flagged transaction rate."]
            },
            {
                "dimension": "Traceability",
                "score": traceability_score,
                "description": "Availability of banking UTR, UPI transaction IDs, or clearing references.",
                "key_findings": [f"{traceable_count} out of {n} transactions possess verifiable reference numbers ({traceability_score}%)."]
            },
        ]

        notes = (
            f"Evidence evaluation synthesized across {n} transactions. "
            f"Overall score reflects {overall_score}/100 based on multi-channel data corroboration."
        )

        return {
            "overall_score": overall_score,
            "provenance_score": provenance_score,
            "source_status_score": source_status_score,
            "completeness_score": completeness_score,
            "consistency_score": consistency_score,
            "traceability_score": traceability_score,
            "dimension_breakdown": breakdown,
            "evaluation_notes": notes,
        }

    @classmethod
    def get_evidence_quality(cls, db: Session, business_id: str) -> Dict[str, Any]:
        txns = db.query(Transaction).filter(Transaction.business_id == business_id).all()
        return cls.calculate_evidence_quality(txns)
