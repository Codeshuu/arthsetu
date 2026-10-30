import re
from datetime import datetime, date, time
from typing import Dict, Any, List, Optional, Tuple


# Regex patterns for canonical header autodetection with strict word boundaries
HEADER_PATTERNS = {
    "date": [
        r"^date$", r"\btxn[_\s]?date\b", r"\btransaction[_\s]?date\b", r"\bposting[_\s]?date\b",
        r"\bvalue[_\s]?date\b", r"^time$", r"^timestamp$", r"\bcreated[_\s]?at\b"
    ],
    "amount": [
        r"^amount$", r"\btxn[_\s]?amount\b", r"\btransaction[_\s]?amount\b", r"^total$",
        r"\bnet[_\s]?amount\b", r"^inr$", r"^value$"
    ],
    "credit": [
        r"^credit$", r"\bcr\b", r"^deposit$", r"^inflow$", r"^received$"
    ],
    "debit": [
        r"^debit$", r"\bdr\b", r"^withdrawal$", r"^outflow$", r"^paid$", r"^spent$"
    ],
    "flow_type": [
        r"^type$", r"^flow$", r"\btxn[_\s]?type\b", r"\btransaction[_\s]?type\b",
        r"\bcr[_\s]?\/?[_\s]?dr\b", r"\bdr[_\s]?\/?[_\s]?cr\b", r"\bflow[_\s]?type\b"
    ],
    "reference_number": [
        r"\bref[_\s]?no\b", r"^reference$", r"\breference[_\s]?no\b", r"\breference[_\s]?number\b",
        r"\butr\b", r"\bupi[_\s]?ref\b", r"\brrn\b", r"\btxn[_\s]?id\b", r"\btransaction[_\s]?id\b",
        r"\border[_\s]?id\b", r"\bcheque[_\s]?no\b", r"^id$"
    ],
    "description": [
        r"\bdescription\b", r"\bnarration\b", r"\bparticulars\b", r"\bremarks\b",
        r"\bdetails\b", r"^summary$", r"^notes$"
    ],
    "counterparty_name": [
        r"\bcounterparty\b", r"\bparty[_\s]?name\b", r"\bbeneficiary\b", r"^merchant$",
        r"\bpaid[_\s]?to\b", r"\breceived[_\s]?from\b", r"\bto[_\s]?\/?[_\s]?from\b",
        r"^sender$", r"^receiver$", r"\bparty\b", r"^name$"
    ],
    "category": [
        r"^category$", r"^tag$", r"^classification$", r"\bexpense[_\s]?head\b", r"^purpose$"
    ],
    "payment_mode": [
        r"\bpayment[_\s]?mode\b", r"^mode$", r"^method$", r"^channel$", r"^instrument$"
    ],
}

KNOWN_DATE_FORMATS = [
    "%Y-%m-%d",
    "%d/%m/%Y",
    "%d-%m-%Y",
    "%d.%m.%Y",
    "%m/%d/%Y",
    "%Y/%m/%d",
    "%d-%b-%Y",
    "%d-%B-%Y",
    "%d/%m/%y",
    "%d-%m-%y",
    "%Y-%m-%d %H:%M:%S",
    "%d/%m/%Y %H:%M:%S",
    "%d-%m-%Y %H:%M:%S",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%f",
    "%Y-%m-%dT%H:%M:%SZ",
]


class ValidationService:
    @staticmethod
    def autodetect_columns(headers: List[str]) -> Dict[str, Optional[str]]:
        """
        Scans a list of raw column headers and suggests mapping to standard transaction fields.
        """
        mapping: Dict[str, Optional[str]] = {
            "date": None,
            "amount": None,
            "flow_type": None,
            "credit": None,
            "debit": None,
            "reference_number": None,
            "description": None,
            "counterparty_name": None,
            "category": None,
            "payment_mode": None,
        }

        used_headers = set()

        # Prioritize matching exact and regex patterns
        for canonical, patterns in HEADER_PATTERNS.items():
            for header in headers:
                if header in used_headers:
                    continue
                clean_header = header.strip().lower()
                for pattern in patterns:
                    if re.search(pattern, clean_header):
                        mapping[canonical] = header
                        used_headers.add(header)
                        break
                if mapping[canonical]:
                    break

        return mapping

    @staticmethod
    def parse_date(date_val: Any) -> Tuple[Optional[date], Optional[time]]:
        """
        Parses date/datetime from string, pandas Timestamp, or date object.
        """
        if date_val is None:
            return None, None

        if isinstance(date_val, (date, datetime)):
            if isinstance(date_val, datetime):
                return date_val.date(), date_val.time()
            return date_val, None

        # String cleaning
        str_val = str(date_val).strip()
        if not str_val or str_val.lower() in ("nan", "nat", "null", "none"):
            return None, None

        # Clean ISO timezone offset if present (e.g., +05:30)
        str_val_clean = re.sub(r"([+-]\d{2}:\d{2}|Z)$", "", str_val)

        for fmt in KNOWN_DATE_FORMATS:
            try:
                dt = datetime.strptime(str_val_clean, fmt)
                parsed_time = dt.time() if dt.time() != time(0, 0) else None
                return dt.date(), parsed_time
            except ValueError:
                continue

        # Try pandas / dateutil parser fallback
        try:
            from dateutil.parser import parse as dateutil_parse
            dt = dateutil_parse(str_val)
            parsed_time = dt.time() if dt.time() != time(0, 0) else None
            return dt.date(), parsed_time
        except Exception:
            return None, None

    @staticmethod
    def parse_amount(val: Any) -> Optional[float]:
        """
        Parses numeric amount from string, cleaning INR currency symbols, commas, and formatting.
        Handles negative numbers and parentheses: (500) -> -500.
        """
        if val is None:
            return None

        if isinstance(val, (int, float)):
            if str(val) == "nan":
                return None
            return float(val)

        raw = str(val).strip()
        if not raw or raw.lower() in ("nan", "null", "none", "-"):
            return None

        is_negative = False
        if raw.startswith("(") and raw.endswith(")"):
            is_negative = True
            raw = raw[1:-1]
        elif "-" in raw:
            is_negative = True

        # Remove currency symbols (₹, Rs, $, etc), commas, spaces, CR/DR notations
        cleaned = re.sub(r"[₹$€£\s,]", "", raw, flags=re.IGNORECASE)
        cleaned = re.sub(r"(cr|dr|inr|rs\.?)$", "", cleaned, flags=re.IGNORECASE)
        cleaned = cleaned.replace("-", "").strip()

        try:
            amt = float(cleaned)
            return -amt if is_negative else amt
        except ValueError:
            return None

    @staticmethod
    def determine_flow_and_amount(
        raw_row: Dict[str, Any],
        mapping: Dict[str, str],
        default_flow: Optional[str] = None
    ) -> Tuple[Optional[float], Optional[str], Optional[str]]:
        """
        Determines the positive absolute amount and flow_type (INFLOW or OUTFLOW).
        Supports:
        1. Separate Debit and Credit columns
        2. Single Amount column with a Type column ("CR", "DR", "CREDIT", "DEBIT", "INFLOW", "OUTFLOW", "REVENUE", "EXPENSE")
        3. Single signed Amount column (+ / -)
        4. Fallback to default_flow
        """
        # Case 1: Separate Debit and Credit columns mapped
        credit_col = mapping.get("credit")
        debit_col = mapping.get("debit")
        if credit_col and credit_col in raw_row and debit_col and debit_col in raw_row:
            cr_amt = ValidationService.parse_amount(raw_row.get(credit_col))
            dr_amt = ValidationService.parse_amount(raw_row.get(debit_col))
            if cr_amt and cr_amt > 0:
                return cr_amt, "INFLOW", None
            if dr_amt and dr_amt > 0:
                return dr_amt, "OUTFLOW", None

        # Case 2: Amount column mapped
        amount_col = mapping.get("amount")
        if not amount_col or amount_col not in raw_row:
            return None, None, "Amount column missing in row"

        raw_amt_val = raw_row.get(amount_col)
        parsed_amt = ValidationService.parse_amount(raw_amt_val)
        if parsed_amt is None:
            return None, None, f"Invalid or non-numeric amount: '{raw_amt_val}'"

        # Check explicit flow/type column
        flow_col = mapping.get("flow_type")
        flow_str = str(raw_row.get(flow_col, "")).strip().upper() if flow_col and flow_col in raw_row else ""

        if flow_str in ("CR", "CREDIT", "INFLOW", "RECEIVED", "DEPOSIT", "REVENUE", "SALE"):
            return abs(parsed_amt), "INFLOW", None
        elif flow_str in ("DR", "DEBIT", "OUTFLOW", "PAID", "WITHDRAWAL", "EXPENSE", "RENT"):
            return abs(parsed_amt), "OUTFLOW", None

        # Check raw amount string for CR/DR notation
        raw_str = str(raw_amt_val).strip().upper()
        if "CR" in raw_str:
            return abs(parsed_amt), "INFLOW", None
        if "DR" in raw_str:
            return abs(parsed_amt), "OUTFLOW", None

        # If signed numeric
        if parsed_amt < 0:
            return abs(parsed_amt), "OUTFLOW", None
        if parsed_amt > 0 and default_flow:
            return parsed_amt, default_flow.upper(), None

        # Default assumption: positive is INFLOW unless default_flow specifies otherwise
        flow = default_flow.upper() if default_flow else "INFLOW"
        return abs(parsed_amt), flow, None

    @staticmethod
    def infer_payment_mode(reference: Optional[str], description: Optional[str], default_mode: str = "OTHER") -> str:
        """
        Infers payment mode (UPI, NET_BANKING, CASH, CHEQUE, OTHER) from reference number or narration.
        """
        combined = f"{reference or ''} {description or ''}".upper()
        if re.search(r"\b(UPI|PAYTM|GPAY|PHONEPE|BHARATPE|VPA|BHIM)\b", combined):
            return "UPI"
        if re.search(r"\b(NEFT|RTGS|IMPS|NETBANKING|INB|TRANSFER|FT)\b", combined):
            return "NET_BANKING"
        if re.search(r"\b(CASH|ATM|CASHBOOK)\b", combined):
            return "CASH"
        if re.search(r"\b(CHQ|CHEQUE|CLEARING)\b", combined):
            return "CHEQUE"
        return default_mode

    @staticmethod
    def infer_category(flow_type: str, raw_category: Optional[str], description: Optional[str]) -> str:
        """
        Infers transaction category (SALE, EXPENSE, TRANSFER, LOAN, OWNER_DRAW).
        """
        if raw_category:
            norm = str(raw_category).strip().upper()
            if norm in ("SALE", "REVENUE", "INCOME", "SALES"):
                return "SALE"
            if norm in ("EXPENSE", "RENT", "PURCHASE", "UTILITY", "SALARY", "SUPPLIES", "TAX"):
                return "EXPENSE"
            if norm in ("TRANSFER", "CONTRA"):
                return "TRANSFER"
            if norm in ("LOAN", "BORROWING", "EMI"):
                return "LOAN"
            if norm in ("OWNER_DRAW", "DRAWING", "PERSONAL"):
                return "OWNER_DRAW"

        desc = (description or "").upper()
        if "RENT" in desc or "SALARY" in desc or "ELECTRICITY" in desc or "PURCHASE" in desc:
            return "EXPENSE"
        if "INVOICE" in desc or "CLIENT" in desc or "CUSTOMER" in desc or "ORDER" in desc:
            return "SALE"

        return "SALE" if flow_type == "INFLOW" else "EXPENSE"

    @classmethod
    def normalize_row(
        cls,
        raw_row: Dict[str, Any],
        row_index: int,
        mapping: Dict[str, str],
        default_payment_mode: str = "UPI",
        default_flow_type: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
        """
        Normalizes a single raw row according to column mapping.
        Returns (is_valid, parsed_dict, error_message).
        """
        date_col = mapping.get("date")
        if not date_col or date_col not in raw_row:
            return False, None, "Date column missing or unmapped"

        parsed_date, parsed_time = cls.parse_date(raw_row.get(date_col))
        if not parsed_date:
            return False, None, f"Unparseable date: '{raw_row.get(date_col)}'"

        amt, flow_type, amt_err = cls.determine_flow_and_amount(raw_row, mapping, default_flow_type)
        if amt_err:
            return False, None, amt_err
        if amt is None or amt <= 0:
            return False, None, f"Amount must be strictly positive, got: {amt}"

        ref_col = mapping.get("reference_number")
        desc_col = mapping.get("description")
        party_col = mapping.get("counterparty_name")
        cat_col = mapping.get("category")
        mode_col = mapping.get("payment_mode")

        ref_val = str(raw_row.get(ref_col, "")).strip() if ref_col and ref_col in raw_row else None
        ref_val = None if ref_val in ("", "None", "nan") else ref_val

        desc_val = str(raw_row.get(desc_col, "")).strip() if desc_col and desc_col in raw_row else None
        desc_val = None if desc_val in ("", "None", "nan") else desc_val

        party_val = str(raw_row.get(party_col, "")).strip() if party_col and party_col in raw_row else None
        party_val = None if party_val in ("", "None", "nan") else party_val

        mode_val = str(raw_row.get(mode_col, "")).strip().upper() if mode_col and mode_col in raw_row else None
        if not mode_val or mode_val in ("", "NONE", "NAN"):
            mode_val = cls.infer_payment_mode(ref_val, desc_val, default_payment_mode)

        cat_val = raw_row.get(cat_col) if cat_col and cat_col in raw_row else None
        inferred_category = cls.infer_category(flow_type, cat_val, desc_val)

        parsed_dict = {
            "transaction_date": parsed_date.isoformat(),
            "transaction_time": parsed_time.isoformat() if parsed_time else None,
            "amount": round(float(amt), 2),
            "flow_type": flow_type,
            "payment_mode": mode_val,
            "category": inferred_category,
            "reference_number": ref_val,
            "description": desc_val,
            "counterparty_name": party_val,
            "verification_status": "STATEMENT_BACKED" if ref_val else "SELF_DECLARED",
        }

        return True, parsed_dict, None
