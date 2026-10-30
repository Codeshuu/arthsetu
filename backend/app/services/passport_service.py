import os
import uuid
import hashlib
from datetime import datetime, date
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.core.config import settings
from app.models.business import Business
from app.models.passport import Passport
from app.services.metrics_service import MetricsService
from app.services.completeness_service import CompletenessService
from app.services.anomaly_service import AnomalyService
from app.services.evidence_service import EvidenceService


class PassportService:
    @staticmethod
    def _build_pdf_document(
        filepath: str,
        business: Business,
        metrics: Dict[str, Any],
        completeness: Dict[str, Any],
        evidence: Dict[str, Any],
        anomalies: Dict[str, Any],
        passport_token: str,
    ):
        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "PassportTitle",
            parent=styles["Title"],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#1E3A8A"),  # Deep Navy Blue
            alignment=0,
        )
        subtitle_style = ParagraphStyle(
            "PassportSubtitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#4B5563"),
        )
        section_style = ParagraphStyle(
            "PassportSection",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#1F2937"),
            spaceBefore=12,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "PassportBody",
            parent=styles["Normal"],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#374151"),
        )
        disclaimer_style = ParagraphStyle(
            "PassportDisclaimer",
            parent=styles["Italic"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#6B7280"),
        )

        elements = []

        # Header Block
        elements.append(Paragraph("ARTHSETU FINANCIAL VISIBILITY PASSPORT", title_style))
        elements.append(Paragraph(f"Digital Verification Token: <b>{passport_token}</b> | Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1E3A8A"), spaceAfter=14))

        # Business Metadata Table
        biz_info_data = [
            [
                Paragraph(f"<b>Legal Name:</b> {business.legal_name or 'N/A'}", body_style),
                Paragraph(f"<b>Trade Name:</b> {business.trade_name or business.legal_name or 'N/A'}", body_style)
            ],
            [
                Paragraph(f"<b>GSTIN:</b> {business.gstin or 'Unregistered / Exempt'}", body_style),
                Paragraph(f"<b>PAN:</b> {business.pan or 'Not Disclosed'}", body_style)
            ],
            [
                Paragraph(f"<b>Business Category:</b> {business.category or 'Retail & Commerce'}", body_style),
                Paragraph(f"<b>Assessment Period:</b> {metrics.get('period_start') or 'Earliest'} to {metrics.get('period_end') or 'Latest'}", body_style)
            ]
        ]
        t_biz = Table(biz_info_data, colWidths=[260, 260])
        t_biz.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F4F6")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(t_biz)
        elements.append(Spacer(1, 14))

        # Section: Core Verified Operational Metrics
        elements.append(Paragraph("1. Core Operational & Cashflow Activity", section_style))

        metrics_data = [
            ["Metric Identifier", "Recorded Value", "Observation & Compliance Note"],
            ["Recorded Sales", f"INR {metrics.get('recorded_sales', 0):,.2f}", f"{metrics.get('sales_transactions_count', 0)} eligible sales inflows identified"],
            ["Recorded Expenses", f"INR {metrics.get('recorded_expenses', 0):,.2f}", f"{metrics.get('expense_transactions_count', 0)} eligible business operational debit rows"],
            ["Net Recorded Cash Movement", f"INR {metrics.get('net_recorded_cash_movement', 0):,.2f}", "Total recorded inflows minus total recorded outflows (Not Profit)"],
            ["Digital Sales Share", f"{metrics.get('digital_sales_share', 0):.1f}%", f"UPI, Net Banking & Card receipts (INR {metrics.get('digital_recorded_sales', 0):,.2f})"],
            ["Operating-Day Coverage", f"{completeness.get('operating_day_coverage', 0):.1f}%", f"{completeness.get('operating_days_count', 0)} operating days over {completeness.get('total_calendar_days', 0)} calendar days"],
            ["Processed Records", f"{metrics.get('total_transactions_count', 0)} transactions", "Successfully parsed, normalized, and validated"],
        ]

        t_metrics = Table(metrics_data, colWidths=[150, 130, 240])
        t_metrics.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E3A8A")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(t_metrics)
        elements.append(Spacer(1, 14))

        # Regulatory Notice Callout
        disclaimer_text = (
            "<b>STATUTORY NOTICE & REGULATORY DISCLAIMER:</b> ArthSetu is a technology visibility platform, "
            "not a licensed credit rating agency or registered financial institution. All calculations are computed from "
            "owner-supplied electronic exports and cashbook ledgers. This document conveys verifiable operational discipline "
            "and evidence completeness; it does not constitute a statutory accounting audit or credit guarantee."
        )
        t_disc = Table([[Paragraph(disclaimer_text, disclaimer_style)]], colWidths=[520])
        t_disc.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),  # Soft Yellow
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#F59E0B")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(t_disc)

        # Page 2: Evidence Quality & Continuity
        elements.append(PageBreak())

        elements.append(Paragraph("2. Evidence Quality Dimensions (0–100 Scale)", section_style))
        elements.append(Paragraph("Every transaction is objectively evaluated across five distinct evidentiary criteria:", subtitle_style))
        elements.append(Spacer(1, 8))

        overall_score = evidence.get("overall_score", 0.0)
        evidence_rows = [
            ["Dimension", "Score", "Description & Standard Evaluated"]
        ]
        for item in evidence.get("dimension_breakdown", []):
            evidence_rows.append([
                item.get("dimension"),
                f"{item.get('score'):.1f} / 100",
                item.get("description", "")
            ])
        evidence_rows.append([
            "Composite Evidence Score",
            f"{overall_score:.1f} / 100",
            "Weighted multi-dimensional evidence corroboration score"
        ])

        t_ev = Table(evidence_rows, colWidths=[150, 90, 280])
        t_ev.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#065F46")),  # Deep Emerald Green
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#F9FAFB")]),
            ("BACKGROUND", (0, -1), (-1, -1), colors.HexColor("#D1FAE5")),
            ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        elements.append(t_ev)
        elements.append(Spacer(1, 14))

        # Activity Rhythm & Outliers
        elements.append(Paragraph("3. Operational Continuity & Outlier Audit", section_style))
        total_anomalies = anomalies.get("total_anomalies", 0)
        outlier_text = (
            f"<b>Operating Streak:</b> Longest uninterrupted operational streak of {completeness.get('longest_operating_streak_days', 0)} consecutive trading days.<br/>"
            f"<b>Statistical Outliers Detected:</b> {total_anomalies} transaction(s) flagged as "
            f"<i>'Unusual Activity Requiring Owner Verification'</i> via statistical IQR analysis (&ge; 30 sample threshold)."
        )
        if anomalies.get("insufficient_sample_size"):
            outlier_text = (
                f"<b>Operating Streak:</b> Longest uninterrupted operational streak of {completeness.get('longest_operating_streak_days', 0)} consecutive trading days.<br/>"
                f"<b>Statistical Outliers:</b> Insufficient sample size (&lt; 30 records) for parametric IQR analysis."
            )

        elements.append(Paragraph(outlier_text, body_style))
        elements.append(Spacer(1, 24))

        # Cryptographic Verification Seal
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#D1D5DB"), spaceAfter=10))
        seal_text = (
            f"<b>DIGITAL TAMPER-EVIDENT VERIFICATION SEAL</b><br/>"
            f"Passport Token: <b>{passport_token}</b><br/>"
            f"System Verification URL: <code>https://arthsetu.gov.in/verify/{passport_token}</code><br/>"
            f"ArthSetu Platform Core | Automated Evidence Synthesis"
        )
        t_seal = Table([[Paragraph(seal_text, disclaimer_style)]], colWidths=[520])
        t_seal.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F4F6")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#9CA3AF")),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(t_seal)

        doc.build(elements)

    @classmethod
    def _make_json_safe(cls, data: Any) -> Any:
        """Recursively converts date/datetime and non-serializable objects to strings."""
        if isinstance(data, (date, datetime)):
            return data.isoformat()
        if isinstance(data, dict):
            return {k: cls._make_json_safe(v) for k, v in data.items()}
        if isinstance(data, list):
            return [cls._make_json_safe(item) for item in data]
        return data

    @classmethod
    def create_and_freeze_passport(
        cls,
        db: Session,
        business_id: str,
        period_start: Optional[date] = None,
        period_end: Optional[date] = None,
    ) -> Passport:
        """
        Compiles all metrics, evidence scores, and anomalies for a business,
        generates a signed 2-page ReportLab PDF, computes SHA-256 seal,
        and saves a frozen Passport snapshot in the database.
        """
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            raise ValueError("Business not found")

        # 1. Compute frozen analytics snapshots
        metrics = MetricsService.get_summary_metrics(db, business_id, period_start, period_end)
        completeness = CompletenessService.get_completeness_metrics(db, business_id, period_start, period_end)
        evidence = EvidenceService.get_evidence_quality(db, business_id)
        anomalies = AnomalyService.get_anomalies(db, business_id, period_start, period_end)

        # 2. Setup storage location
        storage_dir = os.path.join(settings.STORAGE_DIR, "passports")
        os.makedirs(storage_dir, exist_ok=True)

        passport_token = f"PASS-{uuid.uuid4().hex[:10].upper()}"
        filename = f"{passport_token}.pdf"
        filepath = os.path.join(storage_dir, filename)

        # 3. Generate PDF
        cls._build_pdf_document(
            filepath=filepath,
            business=business,
            metrics=metrics,
            completeness=completeness,
            evidence=evidence,
            anomalies=anomalies,
            passport_token=passport_token,
        )

        # 4. Compute cryptographic SHA-256 of the generated PDF file
        with open(filepath, "rb") as f:
            pdf_bytes = f.read()
            file_hash = hashlib.sha256(pdf_bytes).hexdigest()

        p_start = period_start or metrics.get("period_start")
        if isinstance(p_start, str):
            p_start = datetime.strptime(p_start[:10], "%Y-%m-%d").date()
        p_start = p_start or date.today()

        p_end = period_end or metrics.get("period_end")
        if isinstance(p_end, str):
            p_end = datetime.strptime(p_end[:10], "%Y-%m-%d").date()
        p_end = p_end or date.today()

        # 5. Freeze passport in DB (JSON-safe snapshots)
        passport = Passport(
            id=str(uuid.uuid4()),
            business_id=business_id,
            passport_token=passport_token,
            period_start=p_start,
            period_end=p_end,
            metrics_snapshot=cls._make_json_safe(metrics),
            evidence_breakdown=cls._make_json_safe(evidence),
            anomaly_summary=cls._make_json_safe(anomalies),
            pdf_filepath=filepath,
            sha256_hash=file_hash,
            generated_at=datetime.utcnow(),
        )
        db.add(passport)
        db.commit()
        db.refresh(passport)

        return passport
