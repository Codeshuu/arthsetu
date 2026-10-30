from datetime import date
from typing import List, Dict, Any, Optional, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.transaction import Transaction


class MetricsService:
    @staticmethod
    def calculate_metrics_from_records(
        transactions: List[Union[Transaction, Dict[str, Any]]],
        period_start: Optional[date] = None,
        period_end: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Pure calculation function taking a list of Transaction models or dicts
        and computing authoritative financial metrics.
        Enforces strict prohibited terms: Net Recorded Cash Movement (Never 'Profit').
        """
        total_inflows = 0.0
        total_outflows = 0.0
        recorded_sales = 0.0
        recorded_expenses = 0.0
        digital_recorded_sales = 0.0
        cash_recorded_sales = 0.0

        sales_count = 0
        expense_count = 0

        dates: List[date] = []

        for item in transactions:
            # Handle both ORM object and dictionary
            if isinstance(item, dict):
                amt = float(item.get("amount", 0.0))
                flow = str(item.get("flow_type", "")).upper()
                cat = str(item.get("category", "")).upper()
                mode = str(item.get("payment_mode", "OTHER")).upper()
                d_val = item.get("transaction_date")
            else:
                amt = float(item.amount)
                flow = str(item.flow_type).upper()
                cat = str(item.category).upper()
                mode = str(item.payment_mode).upper()
                d_val = item.transaction_date

            if isinstance(d_val, str):
                from datetime import datetime
                d_val = datetime.strptime(d_val[:10], "%Y-%m-%d").date()
            if d_val:
                dates.append(d_val)

            # Inflow vs Outflow tracking
            if flow == "INFLOW":
                total_inflows += amt
                if cat in ("SALE", "REVENUE", ""):
                    recorded_sales += amt
                    sales_count += 1
                    if mode in ("UPI", "NET_BANKING", "CHEQUE", "CARD"):
                        digital_recorded_sales += amt
                    elif mode == "CASH":
                        cash_recorded_sales += amt
                    else:
                        digital_recorded_sales += amt  # Default non-cash to digital
            elif flow == "OUTFLOW":
                total_outflows += amt
                if cat in ("EXPENSE", "RENT", "SALARY", "PURCHASE", ""):
                    recorded_expenses += amt
                    expense_count += 1

        # Strictly: Net Recorded Cash Movement = Recorded Inflows - Recorded Outflows
        net_recorded_cash_movement = total_inflows - total_outflows

        # Digital sales share %
        digital_share = (
            round((digital_recorded_sales / recorded_sales) * 100.0, 2)
            if recorded_sales > 0
            else 0.0
        )

        # Expense-to-sales ratio %
        expense_ratio = (
            round((recorded_expenses / recorded_sales) * 100.0, 2)
            if recorded_sales > 0
            else 0.0
        )

        p_start = period_start or (min(dates) if dates else None)
        p_end = period_end or (max(dates) if dates else None)

        return {
            "recorded_sales": round(recorded_sales, 2),
            "recorded_expenses": round(recorded_expenses, 2),
            "net_recorded_cash_movement": round(net_recorded_cash_movement, 2),
            "total_inflows": round(total_inflows, 2),
            "total_outflows": round(total_outflows, 2),
            "digital_recorded_sales": round(digital_recorded_sales, 2),
            "cash_recorded_sales": round(cash_recorded_sales, 2),
            "digital_sales_share": digital_share,
            "expense_to_sales_ratio": expense_ratio,
            "total_transactions_count": len(transactions),
            "sales_transactions_count": sales_count,
            "expense_transactions_count": expense_count,
            "period_start": p_start,
            "period_end": p_end,
        }

    @classmethod
    def get_summary_metrics(
        cls,
        db: Session,
        business_id: str,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Queries DB for business transactions within optional date range
        and returns calculated summary metrics.
        """
        filters = [Transaction.business_id == business_id]
        if start_date:
            filters.append(Transaction.transaction_date >= start_date)
        if end_date:
            filters.append(Transaction.transaction_date <= end_date)

        txns = db.query(Transaction).filter(and_(*filters)).order_by(Transaction.transaction_date).all()
        return cls.calculate_metrics_from_records(txns, start_date, end_date)
