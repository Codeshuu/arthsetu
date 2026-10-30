import pytest
from datetime import date
from app.services.validation_service import ValidationService


def test_autodetect_columns_standard():
    headers = ["Txn Date", "Description", "Amount", "Type", "Ref No", "Party Name"]
    detected = ValidationService.autodetect_columns(headers)
    assert detected["date"] == "Txn Date"
    assert detected["description"] == "Description"
    assert detected["amount"] == "Amount"
    assert detected["flow_type"] == "Type"
    assert detected["reference_number"] == "Ref No"
    assert detected["counterparty_name"] == "Party Name"


def test_autodetect_columns_bank_statement():
    headers = ["Value Date", "Particulars", "Debit", "Credit", "Cheque No", "Balance"]
    detected = ValidationService.autodetect_columns(headers)
    assert detected["date"] == "Value Date"
    assert detected["description"] == "Particulars"
    assert detected["debit"] == "Debit"
    assert detected["credit"] == "Credit"
    assert detected["reference_number"] == "Cheque No"


def test_parse_date_formats():
    # ISO
    d, t = ValidationService.parse_date("2026-03-15")
    assert d == date(2026, 3, 15)

    # Indian DD/MM/YYYY
    d, t = ValidationService.parse_date("15/03/2026")
    assert d == date(2026, 3, 15)

    # Indian DD-MM-YYYY
    d, t = ValidationService.parse_date("15-03-2026")
    assert d == date(2026, 3, 15)

    # DD-b-YYYY
    d, t = ValidationService.parse_date("15-Mar-2026")
    assert d == date(2026, 3, 15)

    # Invalid string
    d, t = ValidationService.parse_date("not-a-date")
    assert d is None


def test_parse_amount_currency_cleaning():
    # Standard float
    assert ValidationService.parse_amount("15000.50") == 15000.50

    # Indian comma notation with Rupee symbol
    assert ValidationService.parse_amount("₹ 1,50,000.00") == 150000.0

    # Negative formatted
    assert ValidationService.parse_amount("-450.00") == -450.0
    assert ValidationService.parse_amount("(1,200.00)") == -1200.0

    # Cr / Dr suffix notation
    assert ValidationService.parse_amount("5,000.00 Cr") == 5000.0

    # Invalid amount
    assert ValidationService.parse_amount("N/A") is None
    assert ValidationService.parse_amount(None) is None


def test_determine_flow_and_amount_debit_credit_cols():
    mapping = {"credit": "Credit", "debit": "Debit"}

    row_credit = {"Credit": "25000", "Debit": ""}
    amt, flow, err = ValidationService.determine_flow_and_amount(row_credit, mapping)
    assert amt == 25000.0
    assert flow == "INFLOW"
    assert err is None

    row_debit = {"Credit": "0", "Debit": "₹3,400"}
    amt, flow, err = ValidationService.determine_flow_and_amount(row_debit, mapping)
    assert amt == 3400.0
    assert flow == "OUTFLOW"
    assert err is None


def test_normalize_row_valid():
    raw = {
        "date": "2026-01-05",
        "desc": "Customer UPI payment",
        "amt": "4500.00",
        "type": "CR",
        "ref": "UPI1234567890",
        "party": "Kirana Customer A"
    }
    mapping = {
        "date": "date",
        "description": "desc",
        "amount": "amt",
        "flow_type": "type",
        "reference_number": "ref",
        "counterparty_name": "party"
    }

    is_valid, parsed, err = ValidationService.normalize_row(raw, 1, mapping)
    assert is_valid is True
    assert err is None
    assert parsed["transaction_date"] == "2026-01-05"
    assert parsed["amount"] == 4500.00
    assert parsed["flow_type"] == "INFLOW"
    assert parsed["reference_number"] == "UPI1234567890"
    assert parsed["verification_status"] == "STATEMENT_BACKED"


def test_normalize_row_invalid_date():
    raw = {"date": "invalid_date", "amt": "1000"}
    mapping = {"date": "date", "amount": "amt"}
    is_valid, parsed, err = ValidationService.normalize_row(raw, 1, mapping)
    assert is_valid is False
    assert "Unparseable date" in err
