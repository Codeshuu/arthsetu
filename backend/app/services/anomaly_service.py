import numpy as np
from datetime import date
from typing import List, Dict, Any, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.transaction import Transaction


class AnomalyService:
    MIN_SAMPLE_SIZE_FOR_IQR = 30
    OUTLIER_LABEL = "Unusual Activity Requiring Owner Verification"

    @classmethod
    def detect_anomalies(
        cls,
        transactions: List[Union[Transaction, Dict[str, Any]]],
    ) -> Dict[str, Any]:
        """
        Calculates Q1, Q3, and IQR for transaction amounts.
        Strict compliance:
        - Threshold guard: Only runs when sample size >= 30.
        - Outliers are labeled as 'Unusual Activity Requiring Owner Verification', NEVER 'Fraud'.
        """
        n = len(transactions)
        if n < cls.MIN_SAMPLE_SIZE_FOR_IQR:
            return {
                "insufficient_sample_size": True,
                "sample_size": n,
                "threshold_q1": None,
                "threshold_q3": None,
                "threshold_iqr": None,
                "upper_bound": None,
                "lower_bound": None,
                "anomalies": [],
                "total_anomalies": 0,
            }

        # Extract amounts and items
        amounts: List[float] = []
        valid_items: List[Dict[str, Any]] = []

        for item in transactions:
            if isinstance(item, dict):
                amt = float(item.get("amount", 0.0))
                tid = str(item.get("id", ""))
                tdate = item.get("transaction_date")
                cat = str(item.get("category", "SALE"))
                flow = str(item.get("flow_type", "INFLOW"))
            else:
                amt = float(item.amount)
                tid = str(item.id)
                tdate = item.transaction_date
                cat = str(item.category)
                flow = str(item.flow_type)

            if isinstance(tdate, str):
                from datetime import datetime
                tdate = datetime.strptime(tdate[:10], "%Y-%m-%d").date()

            amounts.append(amt)
            valid_items.append({
                "id": tid,
                "transaction_date": tdate,
                "amount": amt,
                "category": cat,
                "flow_type": flow,
            })

        # Calculate IQR
        q1 = float(np.percentile(amounts, 25))
        q3 = float(np.percentile(amounts, 75))
        iqr = float(q3 - q1)
        upper_bound = float(q3 + (1.5 * iqr))
        lower_bound = max(0.0, float(q1 - (1.5 * iqr)))

        anomalies_list: List[Dict[str, Any]] = []
        for item in valid_items:
            amt = item["amount"]
            if amt > upper_bound:
                severity = "HIGH" if amt > (q3 + (3.0 * iqr)) else "MEDIUM"
                anomalies_list.append({
                    "transaction_id": item["id"],
                    "transaction_date": item["transaction_date"],
                    "amount": round(amt, 2),
                    "category": item["category"],
                    "flow_type": item["flow_type"],
                    "reason": f"Amount ₹{amt:,.2f} exceeds upper IQR threshold of ₹{upper_bound:,.2f}",
                    "label": cls.OUTLIER_LABEL,
                    "severity": severity,
                })
            elif amt < lower_bound and lower_bound > 0:
                anomalies_list.append({
                    "transaction_id": item["id"],
                    "transaction_date": item["transaction_date"],
                    "amount": round(amt, 2),
                    "category": item["category"],
                    "flow_type": item["flow_type"],
                    "reason": f"Amount ₹{amt:,.2f} is below lower IQR threshold of ₹{lower_bound:,.2f}",
                    "label": cls.OUTLIER_LABEL,
                    "severity": "LOW",
                })

        return {
            "insufficient_sample_size": False,
            "sample_size": n,
            "threshold_q1": round(q1, 2),
            "threshold_q3": round(q3, 2),
            "threshold_iqr": round(iqr, 2),
            "upper_bound": round(upper_bound, 2),
            "lower_bound": round(lower_bound, 2),
            "anomalies": anomalies_list,
            "total_anomalies": len(anomalies_list),
        }

    @classmethod
    def get_anomalies(
        cls,
        db: Session,
        business_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        filters = [Transaction.business_id == business_id]
        if start_date:
            filters.append(Transaction.transaction_date >= start_date)
        if end_date:
            filters.append(Transaction.transaction_date <= end_date)

        txns = db.query(Transaction).filter(and_(*filters)).order_by(Transaction.transaction_date).all()
        return cls.detect_anomalies(txns)
