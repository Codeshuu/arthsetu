import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import {
  selectRecordedSales,
  selectRecordedSpending,
  selectNetCashMovement,
  selectSalesCashDigitalSplit,
  selectOperatingContinuity,
  selectMonthlyTrends,
  selectExpenseBreakdown,
} from '../../selectors/financeSelectors';
import { selectEvidenceBreakdown } from '../../selectors/evidenceSelectors';
import { selectFourDimensions } from '../../selectors/dimensionSelectors';
import { reportService } from '../../services/ReportService';
import { formatCompactINR, formatINR } from '../../lib/formatCurrency';
import { LanguageSelector } from '../../components/layout/LanguageSelector';
import {
  Download,
  Share2,
  FileCode,
  ShieldAlert,
  Printer,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import jsPDF from 'jspdf';

export const PassportPage: React.FC = () => {
  const { t, language } = useI18n();
  const business = useArthSetuStore((s) => s.business);
  const transactions = useArthSetuStore((s) => s.transactions);
  const diaryDays = useArthSetuStore((s) => s.diaryDays);
  const udhaar = useArthSetuStore((s) => s.udhaar);

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [shaFingerprint, setShaFingerprint] = useState<string>('');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Derived selectors
  const totalSales = selectRecordedSales(transactions);
  const totalSpending = selectRecordedSpending(transactions);
  const netCash = selectNetCashMovement(transactions);
  const split = selectSalesCashDigitalSplit(transactions);
  const continuity = selectOperatingContinuity(business, diaryDays);
  const evidenceSegments = selectEvidenceBreakdown(transactions);
  const dimensions = selectFourDimensions(business, transactions, diaryDays);
  const monthlyTrends = selectMonthlyTrends(transactions);
  const expenseBreakdown = selectExpenseBreakdown(transactions);

  // Document Reference ID for demo
  const reportRefId = useMemo(() => {
    return `AS-2026-IND-${business.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-6) || '904218'}`;
  }, [business.id]);

  const generationDate = '31 October 2026';
  const reportingPeriod = '1 November 2025 – 31 October 2026 (12 Months)';

  // Calculate customer udhaar receivables
  const totalReceivables = useMemo(() => {
    return udhaar.reduce((sum, u) => {
      const settled = u.settlements.reduce((s, st) => s + st.amount, 0);
      return sum + Math.max(0, u.amount - settled);
    }, 0);
  }, [udhaar]);

  // Compute SHA-256 fingerprint on mount / updates
  useEffect(() => {
    reportService.computeFingerprint().then((hash) => {
      setShaFingerprint(hash);
    });
  }, [business, transactions, diaryDays]);

  const handleExportJson = () => {
    reportService.exportJsonFile();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryNavy = [10, 37, 64] as const;
      const slateDark = [30, 41, 59] as const;
      const mutedText = [100, 116, 139] as const;
      const lineGray = [226, 232, 240] as const;
      const lightBg = [248, 250, 252] as const;

      // PAGE 1: FORMAL COVER PAGE
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ARTHSETU · FINANCIAL VISIBILITY PASSPORT', 20, 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`REF: ${reportRefId}`, 190, 12, { align: 'right' });

      // Title Block
      doc.setTextColor(...primaryNavy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('FINANCIAL VISIBILITY PASSPORT', 20, 42);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedText);
      doc.text('Owner-provided business information · Supplementary information for institutional review', 20, 50);

      // Thin divider
      doc.setDrawColor(...lineGray);
      doc.setLineWidth(0.5);
      doc.line(20, 56, 190, 56);

      // Business Overview Box
      doc.setFillColor(...lightBg);
      doc.rect(20, 64, 170, 78, 'F');
      doc.setDrawColor(...lineGray);
      doc.rect(20, 64, 170, 78, 'S');

      doc.setTextColor(...primaryNavy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(business.name, 28, 76);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...slateDark);
      doc.text(`Trading Category: ${business.category.toUpperCase()}`, 28, 86);
      doc.text(`Jurisdiction / City: ${business.location.city}, ${business.location.state}`, 28, 93);
      doc.text(`Operating History: ${business.yearsOperating} Years Established`, 28, 100);
      doc.text(`Reporting Period: ${reportingPeriod}`, 28, 107);
      doc.text(`Report Generation Date: ${generationDate}`, 28, 114);
      doc.text(`Reference ID: ${reportRefId}`, 28, 121);
      doc.text(`Total Transactions Recorded: ${transactions.length} entries`, 28, 128);
      doc.text(`Operating Days Documented: ${continuity.recordedDays} of ${continuity.expectedDays} (${continuity.coveragePercent}%)`, 28, 135);

      // Executive Summary Metrics Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...primaryNavy);
      doc.text('Recorded Operating Figures (INR)', 20, 158);

      const metrics = [
        ['Total Recorded Sales (Gross Inflow)', formatINR(totalSales), 'Classified merchant sales'],
        ['  - Cash Counter Sales', formatINR(split.cashTotal), `${split.cashPercent}% of sales`],
        ['  - Digital / UPI Receipts', formatINR(split.digitalTotal), `${split.digitalPercent}% of sales`],
        ['Total Recorded Spending (Outflow)', formatINR(totalSpending), 'Procurement & operational dues'],
        ['Net Recorded Cash Movement', formatINR(netCash), 'Note: NOT net commercial profit'],
        ['Customer Receivables Outstanding (Udhaar)', formatINR(totalReceivables), 'Owner-declared customer credit'],
        ['Supporting Invoices / Documents Attached', `${transactions.filter(t => t.evidence.class === 'document_supplied').length} docs`, 'Uploaded by merchant'],
      ];

      let yPos = 168;
      metrics.forEach((row, i) => {
        if (i % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, yPos - 5, 170, 8, 'F');
        }
        doc.setFont('helvetica', row[0].startsWith('Total') || row[0].startsWith('Net') ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...slateDark);
        doc.text(row[0], 24, yPos);
        doc.text(row[1], 120, yPos);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(...mutedText);
        doc.text(row[2], 150, yPos);
        yPos += 8;
      });

      // Mandatory Institutional Notice
      doc.setFillColor(...lightBg);
      doc.rect(20, 235, 170, 38, 'F');
      doc.setDrawColor(...lineGray);
      doc.rect(20, 235, 170, 38, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...primaryNavy);
      doc.text('MANDATORY INSTITUTIONAL NOTICE & LIMITATIONS:', 26, 243);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...slateDark);
      doc.text('1. Figures are structured from owner-provided records and statements; they do not represent an independent statutory audit.', 26, 249);
      doc.text('2. Uploaded invoices and CSVs are document-supplied by the merchant and are not third-party authenticated.', 26, 255);
      doc.text('3. Net recorded cash movement represents cash in minus cash out, NOT commercial net profit or taxable income.', 26, 261);
      doc.text('4. ArthSetu provides no credit verdict, loan approval, or underwriting score. Reviewing institutions must perform appraisal.', 26, 267);

      // Cover Page Footer
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedText);
      doc.text('Page 1 of 4 · ArthSetu Financial Visibility Passport', 20, 287);
      doc.text(`Integrity Digest: ${shaFingerprint.substring(0, 24)}...`, 190, 287, { align: 'right' });

      // PAGE 2: FOUR VISIBILITY DIMENSIONS
      doc.addPage();
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ARTHSETU · SECTION 2: FOUR FINANCIAL VISIBILITY DIMENSIONS', 20, 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`REF: ${reportRefId}`, 190, 12, { align: 'right' });

      doc.setTextColor(...primaryNavy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('2.0 Four Financial Visibility Dimensions', 20, 32);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedText);
      doc.text('Transparent independent evaluation without composite scoring or automated underwriting verdicts.', 20, 38);

      let dimY = 48;
      dimensions.forEach((dim, idx) => {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...lineGray);
        doc.rect(20, dimY, 170, 48, 'S');
        doc.setFillColor(...lightBg);
        doc.rect(20, dimY, 170, 10, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...primaryNavy);
        doc.text(`2.${idx + 1} ${dim.nameEn}`, 24, dimY + 7);
        doc.text(`Observed Rating: ${dim.level} (${dim.scorePercent}%)`, 185, dimY + 7, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...slateDark);
        doc.text('Supporting Evidence Observed:', 24, dimY + 17);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        dim.factsEn.forEach((fact, fi) => {
          doc.text(`• ${fact}`, 26, dimY + 23 + fi * 6);
        });

        doc.setFont('helvetica', 'bold');
        doc.text('Scope & Actionable Observation:', 24, dimY + 38);
        doc.setFont('helvetica', 'normal');
        doc.text(dim.improvementEn, 26, dimY + 44);

        dimY += 54;
      });

      // Page 2 Footer
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedText);
      doc.text('Page 2 of 4 · ArthSetu Financial Visibility Passport', 20, 287);
      doc.text(`Integrity Digest: ${shaFingerprint.substring(0, 24)}...`, 190, 287, { align: 'right' });

      // PAGE 3: MONTHLY RECORDED ACTIVITY & TRENDS
      doc.addPage();
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ARTHSETU · SECTION 3: MONTHLY FINANCIAL BREAKDOWN', 20, 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`REF: ${reportRefId}`, 190, 12, { align: 'right' });

      doc.setTextColor(...primaryNavy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('3.0 Monthly Recorded Business Activity Breakdown', 20, 32);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...mutedText);
      doc.text('Unit: Indian Rupee (INR). Figures sourced from classified owner daybook and uploaded statements.', 20, 38);

      // Table Header
      let tY = 48;
      doc.setFillColor(...primaryNavy);
      doc.rect(20, tY, 170, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('Month', 24, tY + 5.5);
      doc.text('Cash Sales', 65, tY + 5.5);
      doc.text('Digital/UPI Sales', 100, tY + 5.5);
      doc.text('Total Outflows', 135, tY + 5.5);
      doc.text('Net Cash Move', 170, tY + 5.5);

      tY += 8;
      monthlyTrends.forEach((m, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, tY, 170, 7.5, 'F');
        }
        doc.setDrawColor(...lineGray);
        doc.line(20, tY + 7.5, 190, tY + 7.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...slateDark);
        doc.text(m.monthLabel, 24, tY + 5);
        doc.text(formatINR(m.cashSales), 65, tY + 5);
        doc.text(formatINR(m.digitalSales), 100, tY + 5);
        doc.text(formatINR(m.spending), 135, tY + 5);
        doc.setFont('helvetica', 'bold');
        doc.text(formatINR(m.netCashMovement), 170, tY + 5);
        tY += 7.5;
      });

      // Annual Totals
      doc.setFillColor(...lightBg);
      doc.rect(20, tY, 170, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...primaryNavy);
      doc.text('12-Month Total', 24, tY + 6);
      doc.text(formatINR(split.cashTotal), 65, tY + 6);
      doc.text(formatINR(split.digitalTotal), 100, tY + 6);
      doc.text(formatINR(totalSpending), 135, tY + 6);
      doc.text(formatINR(netCash), 170, tY + 6);

      // Expense Breakdown Table
      tY += 22;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...primaryNavy);
      doc.text('3.1 Recorded Operating Spending by Category', 20, tY);

      tY += 6;
      doc.setFillColor(...slateDark);
      doc.rect(20, tY, 170, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.text('Spending Category', 24, tY + 5);
      doc.text('Total Amount (INR)', 120, tY + 5);
      doc.text('Share of Spending', 160, tY + 5);

      tY += 7;
      expenseBreakdown.forEach((exp, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(20, tY, 170, 7, 'F');
        }
        doc.setDrawColor(...lineGray);
        doc.line(20, tY + 7, 190, tY + 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...slateDark);
        doc.text(exp.labelEn, 24, tY + 5);
        doc.text(formatINR(exp.amount), 120, tY + 5);
        doc.text(`${exp.percentage}%`, 160, tY + 5);
        tY += 7;
      });

      // Page 3 Footer
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedText);
      doc.text('Page 3 of 4 · ArthSetu Financial Visibility Passport', 20, 287);
      doc.text(`Integrity Digest: ${shaFingerprint.substring(0, 24)}...`, 190, 287, { align: 'right' });

      // PAGE 4: EVIDENCE METHODOLOGY & INTEGRITY DIGEST
      doc.addPage();
      doc.setFillColor(...primaryNavy);
      doc.rect(0, 0, 210, 18, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ARTHSETU · SECTION 4: EVIDENCE METHODOLOGY & INTEGRITY', 20, 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`REF: ${reportRefId}`, 190, 12, { align: 'right' });

      doc.setTextColor(...primaryNavy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('4.0 Evidence Methodology & Cryptographic Verification', 20, 32);

      let mY = 44;
      const methods = [
        ['Owner-Declared Information', 'Data entered directly by the proprietor into the local daybook (e.g., daily cash sales, informal udhaar). These reflect disciplined operating records but lack external verification.'],
        ['Document-Supplied Information', 'Entries linked to merchant-supplied statement CSVs, distributor invoices, or payment slips. Note: In this release, documents are owner-supplied and have NOT been independently authenticated by third-party auditors.'],
        ['Source-Authenticated Information', 'Records directly retrieved from consented APIs (e.g., Account Aggregator network). To maintain absolute transparency, this channel is locked at 0% in this offline demonstration.'],
        ['Unclassified Transactions', 'Raw entries pending categorization. These are isolated and never automatically assumed to be business income.'],
      ];

      methods.forEach((meth, idx) => {
        doc.setFillColor(...lightBg);
        doc.rect(20, mY, 170, 24, 'F');
        doc.setDrawColor(...lineGray);
        doc.rect(20, mY, 170, 24, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(...primaryNavy);
        doc.text(`4.${idx + 1} ${meth[0]}`, 24, mY + 7);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...slateDark);
        const splitLines = doc.splitTextToSize(meth[1], 162);
        doc.text(splitLines, 24, mY + 14);

        mY += 28;
      });

      // SHA-256 Digest Box
      mY += 4;
      doc.setFillColor(255, 255, 255);
      doc.rect(20, mY, 170, 48, 'F');
      doc.setDrawColor(...primaryNavy);
      doc.setLineWidth(0.8);
      doc.rect(20, mY, 170, 48, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...primaryNavy);
      doc.text('4.5 Cryptographic Tamper-Evident Digest (SHA-256)', 24, mY + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...slateDark);
      doc.text('Computed using standard Web Crypto API across all canonical transaction records and metadata:', 24, mY + 16);

      doc.setFillColor(241, 245, 249);
      doc.rect(24, mY + 20, 162, 11, 'F');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...primaryNavy);
      doc.text(shaFingerprint || 'Computing SHA-256...', 26, mY + 27);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(...mutedText);
      doc.text('Verification Note: Any alteration of amounts, dates, or classifications after generation invalidates this digest.', 24, mY + 39);
      doc.text('Institutions may re-compute this digest using the canonical JSON export to verify report immutability.', 24, mY + 44);

      // Page 4 Footer
      doc.setFontSize(7.5);
      doc.setTextColor(...mutedText);
      doc.text('Page 4 of 4 · ArthSetu Financial Visibility Passport', 20, 287);
      doc.text(`Integrity Digest: ${shaFingerprint.substring(0, 24)}...`, 190, 287, { align: 'right' });

      doc.save(`ArthSetu_Passport_${business.name.replace(/\s+/g, '_')}_2026.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error generating PDF document. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const pages = [
    { id: 0, title: t('passport.pageCover', '1. Cover Page') },
    { id: 1, title: t('passport.pageOverview', '2. Executive Overview') },
    { id: 2, title: t('passport.pageGraphs', '3. Financial Graphs') },
    { id: 3, title: t('passport.pageDimensions', '4. Visibility Dimensions') },
    { id: 4, title: t('passport.pageMethodology', '5. Methodology & Evidence') },
    { id: 5, title: t('passport.pageIntegrity', '6. Cryptographic Integrity') },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans select-none pb-12">
      {/* Top Formal Action Bar */}
      <div className="bg-[#0A2540] text-white border-b border-[#1E3A8A] px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold">
                {t('passport.banner', 'FINANCIAL VISIBILITY PASSPORT')}
              </span>
              <span className="text-[10px] text-slate-400">·</span>
              <span className="text-[10px] font-mono text-slate-300">{reportRefId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {business.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Language Selector */}
            <LanguageSelector variant="passport" />

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#1E293B] text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('passport.printBtn', 'Print')}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#1E293B] text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('passport.exportJsonBtn', 'Export JSON')}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-[#0284C7] text-white text-xs font-bold hover:bg-[#0369A1] shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Building PDF...' : t('passport.downloadPdfBtn', 'Download PDF')}</span>
            </button>

            <Link
              to="/app/passport/share"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] shadow transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t('nav.sharePassport', 'Share Passport')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Page Tabs Strip */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between overflow-x-auto py-2">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePageIndex(p.id)}
                className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all ${
                  activePageIndex === p.id
                    ? 'bg-[#0A2540] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center space-x-1">
            <button
              onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
              disabled={activePageIndex === 0}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-500 px-1">
              {activePageIndex + 1} / {pages.length}
            </span>
            <button
              onClick={() => setActivePageIndex(Math.min(pages.length - 1, activePageIndex + 1))}
              disabled={activePageIndex === pages.length - 1}
              className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main A4 Document Sheet View */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-6">
        <div className="a4-page bg-white rounded-lg shadow-report-sheet border border-slate-200 p-8 sm:p-12 text-slate-900 min-h-[960px] flex flex-col justify-between">
          <div>
            {/* Running Document Header */}
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-6">
              <span>ARTHSETU · FINANCIAL VISIBILITY REPORT</span>
              <span>REF: {reportRefId}</span>
            </div>

            {/* PAGE 0: FORMAL COVER PAGE */}
            {activePageIndex === 0 && (
              <div className="space-y-8 py-4">
                {/* Formal Title Block */}
                <div className="border-b-2 border-[#0A2540] pb-6 space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0284C7]">
                    Official Dossier · Supplementary Disclosure
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
                    Financial Visibility Passport
                  </h2>
                  <p className="text-sm text-slate-600 max-w-2xl font-normal leading-relaxed">
                    {t('passport.docClassification')}
                  </p>
                </div>

                {/* Formal Entity Metadata Table */}
                <div className="bg-[#F8FAFC] border border-slate-200 rounded-md overflow-hidden">
                  <div className="bg-[#0A2540] text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider">
                    Commercial Entity & Reporting Scope
                  </div>
                  <div className="divide-y divide-slate-200 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <span className="font-semibold text-slate-500">{t('passport.tradingEntityLabel')}:</span>
                      <span className="sm:col-span-2 font-bold text-slate-900 text-sm">{business.name}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <span className="font-semibold text-slate-500">{t('passport.tradeCategoryLabel')}:</span>
                      <span className="sm:col-span-2 font-mono uppercase text-slate-800">{business.category}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <span className="font-semibold text-slate-500">{t('passport.locationLabel')}:</span>
                      <span className="sm:col-span-2 text-slate-800">{business.location.city}, {business.location.state}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <span className="font-semibold text-slate-500">{t('passport.yearsOperatingLabel')}:</span>
                      <span className="sm:col-span-2 text-slate-800">{business.yearsOperating} Years Continuous Operation</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <span className="font-semibold text-slate-500">{t('passport.reportingPeriodLabel')}:</span>
                      <span className="sm:col-span-2 font-mono text-slate-800">{reportingPeriod}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <span className="font-semibold text-slate-500">{t('passport.generationDateLabel')}:</span>
                      <span className="sm:col-span-2 font-mono text-slate-800">{generationDate}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3">
                      <span className="font-semibold text-slate-500">{t('passport.refIdLabel')}:</span>
                      <span className="sm:col-span-2 font-mono font-bold text-[#0A2540]">{reportRefId}</span>
                    </div>
                  </div>
                </div>

                {/* Institutional Review Covenant Notice */}
                <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700 leading-relaxed">
                  <div className="flex items-center space-x-2 font-bold text-[#0A2540]">
                    <Info className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
                    <span>REPORT GOVERNANCE & METHODOLOGY NOTICE:</span>
                  </div>
                  <p>{t('passport.legalDisclaimer')}</p>
                </div>
              </div>
            )}

            {/* PAGE 1: EXECUTIVE BUSINESS OVERVIEW */}
            {activePageIndex === 1 && (
              <div className="space-y-6 py-2">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-mono uppercase text-[#0284C7] font-bold">
                    Section 2.0 · Consolidated Records
                  </span>
                  <h3 className="text-2xl font-bold text-[#0A2540] mt-1">
                    {t('passport.execSummaryTitle')}
                  </h3>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-500 block">{t('passport.salesTitle')}</span>
                    <span className="text-xl font-bold text-[#0A2540]">{formatINR(totalSales)}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Recorded gross sales</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-500 block">{t('passport.spendingTitle')}</span>
                    <span className="text-xl font-bold text-slate-800">{formatINR(totalSpending)}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Recorded expenses & stock</span>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-md">
                    <span className="text-[11px] text-blue-900 block font-semibold">{t('passport.netCashTitle')}</span>
                    <span className="text-xl font-bold text-blue-900">{formatINR(netCash)}</span>
                    <span className="text-[10px] text-blue-700 block mt-1">Inflow minus outflow</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-500 block">{t('passport.salesCash')}</span>
                    <span className="text-base font-bold text-slate-800">{formatINR(split.cashTotal)} ({split.cashPercent}%)</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Owner-declared counter cash</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-500 block">{t('passport.salesDigital')}</span>
                    <span className="text-base font-bold text-slate-800">{formatINR(split.digitalTotal)} ({split.digitalPercent}%)</span>
                    <span className="text-[10px] text-slate-400 block mt-1">UPI & statement entries</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="text-[11px] text-slate-500 block">{t('passport.receivablesTitle')}</span>
                    <span className="text-base font-bold text-slate-800">{formatINR(totalReceivables)}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Active customer udhaar</span>
                  </div>
                </div>

                {/* Important Accounting Principle Callout */}
                <div className="p-3.5 rounded-md bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <div className="font-bold flex items-center space-x-1.5 mb-0.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>FINANCIAL HONESTY COVENANT:</span>
                  </div>
                  <p className="leading-relaxed text-[11px]">
                    {t('passport.netCashNote')}
                  </p>
                </div>

                {/* Completeness & Record Integrity Table */}
                <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
                  <table className="w-full text-left divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-mono text-[11px] text-slate-700">
                      <tr>
                        <th className="p-2.5">Audit & Record Metric</th>
                        <th className="p-2.5 text-right">Recorded Value</th>
                        <th className="p-2.5">Classification & Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      <tr>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{t('passport.transactionsCount')}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{transactions.length}</td>
                        <td className="p-2.5 text-slate-500 font-sans">Full ledger transaction volume</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{t('passport.supportingDocsCount')}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{transactions.filter(t => t.evidence.class === 'document_supplied').length}</td>
                        <td className="p-2.5 text-slate-500 font-sans">Uploaded bank/UPI statements & bills</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium text-slate-800">{t('passport.recordCompleteness')}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{continuity.coveragePercent}%</td>
                        <td className="p-2.5 text-slate-500 font-sans">{continuity.recordedDays} of {continuity.expectedDays} operating days documented</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Disclosure of Missing Information */}
                <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider font-mono text-[10px]">
                    {t('passport.missingDataNote')}
                  </span>
                  <p className="text-slate-600 font-sans leading-relaxed text-[11px]">
                    {t('passport.missingDataDesc')}
                  </p>
                </div>
              </div>
            )}

            {/* PAGE 2: FINANCIAL GRAPHS */}
            {activePageIndex === 2 && (
              <div className="space-y-6 py-2">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-mono uppercase text-[#0284C7] font-bold">
                    Section 3.0 · Financial Graphs
                  </span>
                  <h3 className="text-2xl font-bold text-[#0A2540] mt-1">
                    Documented Financial Pattern Graphs
                  </h3>
                  <p className="text-xs text-slate-500">
                    Units: Indian Rupee (INR). Derived strictly from available recorded transactions.
                  </p>
                </div>

                {/* Graph 1: Monthly Recorded Business Activity */}
                <div className="border border-slate-200 rounded-md p-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-[#0A2540]">{t('passport.graph1Title')}</h4>
                      <p className="text-[11px] text-slate-500">{t('passport.graph1Desc')}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 sm:mt-0">Source: Daybook & Statements</span>
                  </div>

                  {monthlyTrends.length === 0 ? (
                    <div className="h-44 w-full flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded text-center">
                      <span className="text-xs font-mono font-bold text-slate-700 uppercase">Insufficient Recorded Data</span>
                      <p className="text-[11px] text-slate-500 max-w-sm mt-1">No monthly trading activity has been logged for this merchant yet. Record daily sales or import a statement to view activity trends.</p>
                    </div>
                  ) : (
                    <div className="h-52 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                          <XAxis dataKey="monthLabel" stroke="#64748B" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={10} tickFormatter={(v) => formatCompactINR(v)} tickLine={false} width={45} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: '11px' }}
                            formatter={(val: number) => [formatINR(val), '']}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                          <Bar dataKey="cashSales" name="Cash Sales" stackId="sales" fill="#0A2540" />
                          <Bar dataKey="digitalSales" name="Digital / UPI" stackId="sales" fill="#0284C7" />
                          <Line type="monotone" dataKey="spending" name="Total Outflows" stroke="#DC2626" strokeWidth={2} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 italic mt-1 text-center">
                    Note: Months with lower counts represent fewer recording days rather than verified zero trading activity.
                  </div>
                </div>

                {/* 2-Column Graphs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Graph 2: Sales Composition */}
                  <div className="border border-slate-200 rounded-md p-4 bg-white">
                    <h4 className="font-bold text-xs text-[#0A2540]">{t('passport.graph2Title')}</h4>
                    <p className="text-[10px] text-slate-500 mb-2">{t('passport.graph2Desc')}</p>
                    {split.cashTotal + split.digitalTotal === 0 ? (
                      <div className="h-44 w-full flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded text-center">
                        <span className="text-xs font-mono font-bold text-slate-700 uppercase">Insufficient Sales Records</span>
                        <p className="text-[11px] text-slate-500 mt-1">Pending recorded cash/UPI receipts.</p>
                      </div>
                    ) : (
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Cash Sales', value: split.cashTotal },
                                { name: 'Digital / UPI', value: split.digitalTotal },
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={36}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              <Cell fill="#0A2540" />
                              <Cell fill="#0284C7" />
                            </Pie>
                            <Tooltip formatter={(val: number) => [formatINR(val), '']} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Graph 3: Outflow Breakdown */}
                  <div className="border border-slate-200 rounded-md p-4 bg-white">
                    <h4 className="font-bold text-xs text-[#0A2540]">{t('passport.graph3Title')}</h4>
                    <p className="text-[10px] text-slate-500 mb-2">{t('passport.graph3Desc')}</p>
                    {expenseBreakdown.length === 0 ? (
                      <div className="h-44 w-full flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded text-center">
                        <span className="text-xs font-mono font-bold text-slate-700 uppercase">Insufficient Expense Records</span>
                        <p className="text-[11px] text-slate-500 mt-1">No categorized outflows in current reporting period.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-3 font-mono text-xs">
                        {expenseBreakdown.map((exp) => (
                          <div key={exp.category} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-sans text-slate-700 truncate">{exp.labelEn}</span>
                              <span className="font-bold text-slate-900">{formatINR(exp.amount)} ({exp.percentage}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-700 rounded-full" style={{ width: `${exp.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PAGE 3: FOUR VISIBILITY DIMENSIONS */}
            {activePageIndex === 3 && (
              <div className="space-y-6 py-2">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-mono uppercase text-[#0284C7] font-bold">
                    Section 4.0 · Institutional Lenses
                  </span>
                  <h3 className="text-2xl font-bold text-[#0A2540] mt-1">
                    {t('passport.dimTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans mt-0.5">
                    {t('passport.dimDesc')}
                  </p>
                </div>

                <div className="space-y-4">
                  {dimensions.map((dim, idx) => (
                    <div key={dim.id} className="border border-slate-200 rounded-md overflow-hidden bg-white">
                      <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">DIMENSION 4.{idx + 1}</span>
                          <h4 className="font-bold text-sm text-[#0A2540]">{dim.nameEn}</h4>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-sm bg-[#0A2540] text-white text-[11px] font-mono font-bold">
                            {dim.level} · {dim.scorePercent}%
                          </span>
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-2">
                          <span className="font-bold text-slate-700 block font-mono text-[10px] uppercase">
                            Observed Facts from Ledger Records:
                          </span>
                          <ul className="space-y-1.5 text-slate-600">
                            {dim.factsEn.map((f, fi) => (
                              <li key={fi} className="flex items-start space-x-1.5">
                                <span className="text-slate-400">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4">
                          <span className="font-bold text-slate-700 block font-mono text-[10px] uppercase">
                            Operational Scope & Limitations:
                          </span>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {dim.improvementEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAGE 4: METHODOLOGY & LIMITATIONS */}
            {activePageIndex === 4 && (
              <div className="space-y-6 py-2">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-mono uppercase text-[#0284C7] font-bold">
                    Section 5.0 · Transparency Protocols
                  </span>
                  <h3 className="text-2xl font-bold text-[#0A2540] mt-1">
                    {t('passport.methodologyTitle')}
                  </h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed font-sans">
                  <div className="p-3.5 border border-slate-200 rounded-md bg-white">
                    <h4 className="font-bold text-[#0A2540] mb-0.5">{t('passport.methOwner')}</h4>
                    <p className="text-slate-600 text-[11px]">{t('passport.methOwnerDesc')}</p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-md bg-white">
                    <h4 className="font-bold text-[#0A2540] mb-0.5">{t('passport.methSupplied')}</h4>
                    <p className="text-slate-600 text-[11px]">{t('passport.methSuppliedDesc')}</p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-md bg-white">
                    <h4 className="font-bold text-[#0A2540] mb-0.5">{t('passport.methAuth')}</h4>
                    <p className="text-slate-600 text-[11px]">{t('passport.methAuthDesc')}</p>
                  </div>

                  <div className="p-3.5 border border-slate-200 rounded-md bg-white">
                    <h4 className="font-bold text-[#0A2540] mb-0.5">{t('passport.methUnclass')}</h4>
                    <p className="text-slate-600 text-[11px]">{t('passport.methUnclassDesc')}</p>
                  </div>
                </div>

                {/* Limitations */}
                <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-md space-y-2 text-xs">
                  <h4 className="font-bold text-[#0A2540] font-mono uppercase text-[11px]">
                    Institutional Scope & Disclaimers:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                    <li>This passport is supplementary business information; it is NOT a credit bureau score or report.</li>
                    <li>It does not constitute a loan sanction, loan eligibility guarantee, or bank appraisal decision.</li>
                    <li>Reviewing financial institutions are solely responsible for conducting their own underwriting and KYC assessments.</li>
                    <li>Cash sales figures reflect proprietor daybook entries and are not third-party audited.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* PAGE 5: CRYPTOGRAPHIC INTEGRITY */}
            {activePageIndex === 5 && (
              <div className="space-y-6 py-2">
                <div className="border-b border-slate-200 pb-3">
                  <span className="text-[10px] font-mono uppercase text-[#0284C7] font-bold">
                    Section 6.0 · Data Integrity
                  </span>
                  <h3 className="text-2xl font-bold text-[#0A2540] mt-1">
                    {t('passport.integrityTitle')}
                  </h3>
                </div>

                <div className="border border-slate-200 rounded-md p-5 bg-[#F8FAFC] space-y-3 font-mono">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                    Canonical SHA-256 Digest of Report Dataset:
                  </span>
                  <div className="p-3 bg-[#0A2540] text-[#38BDF8] rounded-md text-xs break-all select-all font-mono tracking-widest">
                    {shaFingerprint || 'Computing SHA-256 Digest...'}
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed pt-1">
                    {t('passport.integrityNotice')}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex items-start space-x-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold block">Browser-Computed Mathematical Proof</span>
                    <p className="text-[11px] text-emerald-800">
                      This hash was computed strictly in your browser session using standard Web Crypto API. If any transaction row, date, or amount is altered, the digest immediately changes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Running Document Footer */}
          <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-[10px] font-mono text-slate-400 mt-8">
            <span>ArthSetu Financial Visibility Report · Page {activePageIndex + 1} of {pages.length}</span>
            <span>Integrity: SHA-256 Verified · {reportRefId}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
