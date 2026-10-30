from datetime import date, timedelta
from typing import List, Dict, Any, Optional, Set, Union
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.transaction import Transaction


class CompletenessService:
    @staticmethod
    def calculate_completeness(
        transactions: List[Union[Transaction, Dict[str, Any]]],
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Dict[str, Any]:
        """
        Pure evaluation of operating rhythm and date coverage.
        Formula: Operating-Day Coverage (%) = (Unique operating days / Total calendar days) * 100.
        """
        operating_dates: Set[date] = set()

        for item in transactions:
            d_val = item.get("transaction_date") if isinstance(item, dict) else item.transaction_date
            if isinstance(d_val, str):
                from datetime import datetime
                d_val = datetime.strptime(d_val[:10], "%Y-%m-%d").date()
            if d_val:
                operating_dates.add(d_val)

        if not operating_dates:
            p_start = start_date or date.today()
            p_end = end_date or p_start
            return {
                "total_calendar_days": 0,
                "operating_days_count": 0,
                "operating_day_coverage": 0.0,
                "continuity_score": 0.0,
                "longest_operating_streak_days": 0,
                "current_operating_streak_days": 0,
                "missing_dates": [],
                "period_start": p_start,
                "period_end": p_end,
            }

        p_start = start_date or min(operating_dates)
        p_end = end_date or max(operating_dates)

        if p_start > p_end:
            p_start, p_end = p_end, p_start

        total_calendar_days = (p_end - p_start).days + 1
        filtered_operating_days = {d for d in operating_dates if p_start <= d <= p_end}
        operating_days_count = len(filtered_operating_days)

        # Operating-Day Coverage %
        coverage_pct = round((operating_days_count / total_calendar_days) * 100.0, 2) if total_calendar_days > 0 else 0.0

        # Calculate missing dates and streaks
        missing_dates: List[str] = []
        longest_streak = 0
        current_streak = 0
        streak = 0

        curr_date = p_start
        while curr_date <= p_end:
            if curr_date in filtered_operating_days:
                streak += 1
                if streak > longest_streak:
                    longest_streak = streak
            else:
                missing_dates.append(curr_date.isoformat())
                streak = 0
            curr_date += timedelta(days=1)

        current_streak = streak

        # Continuity Score: blends coverage % (70%) and relative streak ratio (30%)
        streak_ratio = (longest_streak / total_calendar_days) if total_calendar_days > 0 else 0.0
        continuity_score = round(min(100.0, (coverage_pct * 0.7) + (streak_ratio * 100.0 * 0.3)), 2)

        return {
            "total_calendar_days": total_calendar_days,
            "operating_days_count": operating_days_count,
            "operating_day_coverage": coverage_pct,
            "continuity_score": continuity_score,
            "longest_operating_streak_days": longest_streak,
            "current_operating_streak_days": current_streak,
            "missing_dates": missing_dates[:30],  # Cap preview to 30 dates
            "period_start": p_start,
            "period_end": p_end,
        }

    @classmethod
    def get_completeness_metrics(
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
        return cls.calculate_completeness(txns, start_date, end_date)
