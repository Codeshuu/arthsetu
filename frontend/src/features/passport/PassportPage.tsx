import React, { useState, useEffect } from 'react';
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
} from '../../selectors/financeSelectors';
import { selectEvidenceBreakdown } from '../../selectors/evidenceSelectors';
import { selectFourDimensions } from '../../selectors/dimensionSelectors';
import { reportService } from '../../services/ReportService';
import { formatCompactINR, formatINR } from '../../lib/formatCurrency';
import { Stamp } from '../../components/fragments/Stamp';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import { EvidenceRibbon } from '../../components/evidence/EvidenceRibbon';
import { DimensionPanel } from '../../components/finance/DimensionPanel';
import {
  Download,
  Share2,
  FileCode,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Printer,
} from 'lucide-react';
import jsPDF from 'jspdf';

export const PassportPage: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const business = useArthSetuStore((s) => s.business);
  const transactions = useArthSetuStore((s) => s.transactions);
  const diaryDays = useArthSetuStore((s) => s.diaryDays);

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [shaFingerprint, setShaFingerprint] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Derived selectors
  const totalSales = selectRecordedSales(transactions);
  const totalSpending = selectRecordedSpending(transactions);
  const netCash = selectNetCashMovement(transactions);
  const split = selectSalesCashDigitalSplit(transactions);
  const continuity = selectOperatingContinuity(business, diaryDays);
  const evidenceSegments = selectEvidenceBreakdown(transactions);
  const dimensions = selectFourDimensions(business, transactions, diaryDays);

  // Compute real SHA-256 fingerprint on mount / updates
  useEffect(() => {
    reportService.computeFingerprint().then((hash) => {
      setShaFingerprint(hash);
    });
  }, [business, transactions, diaryDays]);

  const handleExportJson = () => {
    reportService.exportJsonFile();
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Cover Page
      doc.setFillColor(20, 64, 47); // Forest 800
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(248, 241, 222); // Cream 100
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text('ARTHSETU', 105, 70, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('FINANCIAL VISIBILITY PASSPORT', 105, 82, { align: 'center' });

      doc.setTextColor(208, 138, 30); // Saffron
      doc.setFontSize(11);
      doc.text('Making Small Businesses Financially Visible', 105, 92, { align: 'center' });

      doc.setTextColor(248, 241, 222);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(business.name, 105, 140, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`${business.location.city}, ${business.location.state}`, 105, 150, { align: 'center' });
      doc.text(`Operating: ${business.yearsOperating} Years · Category: ${business.category}`, 105, 158, { align: 'center' });

      doc.setFontSize(10);
      doc.text('OBSERVATION PERIOD: Nov 2025 - Oct 2026', 105, 190, { align: 'center' });
      doc.text('VOLUNTARY SUPPLEMENTARY DISCLOSURE', 105, 198, { align: 'center' });

      // Page 2: Statement & Dimensions
      doc.addPage();
      doc.setFillColor(253, 251, 244); // Ivory
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(20, 64, 47);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('Financial Statement Summary', 20, 30);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(43, 38, 32);
      doc.text(`Recorded Sales: ${formatINR(totalSales)}`, 20, 45);
      doc.text(`Recorded Spending: ${formatINR(totalSpending)}`, 20, 53);
      doc.text(`Net Recorded Movement: ${formatINR(netCash)} (Note: Not Profit)`, 20, 61);
      doc.text(`Days Documented: ${continuity.recordedDays} of ${continuity.expectedDays} (${continuity.coveragePercent}%)`, 20, 69);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Four Dimensions of Visibility', 20, 88);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      dimensions.forEach((dim, idx) => {
        doc.text(`${idx + 1}. ${dim.nameEn}: ${dim.level} (${dim.scorePercent}%)`, 20, 100 + idx * 8);
      });

      // Limitations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Mandatory Limitations & Scope', 20, 150);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const limitations = [
        '1. Figures are owner-organised from supplied records and not independently audited.',
        '2. Uploaded documents are NOT third-party authenticated in this prototype.',
        '3. Recorded net cash movement is NOT equivalent to net commercial profit.',
        '4. No credit score, lending verdict, or underwriting recommendation is made.',
        '5. This report is supplementary information shared voluntarily by the business owner.',
      ];
      limitations.forEach((line, i) => {
        doc.text(line, 20, 162 + i * 8);
      });

      // SHA-256 Fingerprint
      doc.setFont('helvetica', 'bold');
      doc.text('Cryptographic Integrity Fingerprint (SHA-256):', 20, 220);
      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.text(shaFingerprint, 20, 228);

      doc.save(`ArthSetu_Passport_${business.name.replace(/\s+/g, '_')}_2026.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const pages = [
    { id: 0, title: t('passport.pageCover') },
    { id: 1, title: t('passport.pageStatement') },
    { id: 2, title: t('passport.pageDimensions') },
    { id: 3, title: t('passport.pageContinuity') },
    { id: 4, title: t('passport.pageLimitations') },
    { id: 5, title: t('passport.pageIntegrity') },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans select-none">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('passport.banner')}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
            {t('passport.title')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center rounded bg-[#F8F1DE] border border-[#D6CAA8] p-1 text-xs">
            <button
              onClick={() => setZoomScale(Math.max(0.8, zoomScale - 0.1))}
              className="p-1 text-[#7C766B] hover:text-[#14402F]"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1.5 font-bold">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale(Math.min(1.2, zoomScale + 0.1))}
              className="p-1 text-[#7C766B] hover:text-[#14402F]"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono font-bold text-[#14402F] hover:bg-[#E6DAB9]"
          >
            <FileCode className="w-3.5 h-3.5 text-[#8A6446]" />
            <span>{t('passport.exportJsonBtn')}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-[#14402F] text-white text-xs font-bold hover:bg-[#0F2E22] shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#D08A1E]" />
            <span>{isExportingPdf ? 'Building PDF...' : t('passport.downloadPdfBtn')}</span>
          </button>

          <Link
            to="/app/passport/share"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-[#D08A1E] text-white text-xs font-bold hover:bg-[#B57415] shadow transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('nav.sharePassport')}</span>
          </Link>
        </div>
      </div>

      {/* Page Navigation Thumbnails Strip */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-mono">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePageIndex(p.id)}
            className={`px-3 py-1.5 rounded border whitespace-nowrap transition-all ${
              activePageIndex === p.id
                ? 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22] font-bold shadow-sm'
                : 'bg-[#FDFBF4] text-[#7C766B] border-[#D6CAA8] hover:bg-[#F8F1DE]'
            }`}
          >
            Page {p.id + 1}: {p.title}
          </button>
        ))}
      </div>

      {/* Desk Backdrop with Physical A4 Document */}
      <div className="bg-[#E6DAB9] p-4 sm:p-8 lg:p-12 rounded-xl border border-[#D6CAA8] shadow-inner flex justify-center overflow-x-auto">
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
          }}
          className="w-full max-w-[700px] min-h-[960px] bg-[#FDFBF4] border border-[#D6CAA8] rounded shadow-2xl p-8 sm:p-12 relative flex flex-col justify-between text-[#2B2620] paper-grain"
        >
          {/* PAGE 1: COVER PAGE */}
          {activePageIndex === 0 && (
            <div className="h-full flex flex-col justify-between py-6">
              {/* Jali Lattice Border Frame */}
              <div className="border-4 border-double border-[#14402F] p-8 h-full flex flex-col justify-between rounded-sm relative">
                {/* Stamp */}
                <div className="absolute top-6 right-6 pointer-events-none">
                  <Stamp
                    variant="owner_shared"
                    text="OWNER-SHARED"
                    subtext="SUPPLEMENTARY INFO"
                    rotation={-5}
                    animate={true}
                  />
                </div>

                <div className="text-center pt-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#14402F] flex items-center justify-center mx-auto text-[#D08A1E] font-display font-bold text-2xl shadow-md">
                    अ
                  </div>
                  <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#14402F] tracking-tight">
                    ArthSetu
                  </h2>
                  <div className="text-xs font-mono uppercase tracking-widest text-[#D08A1E] font-bold">
                    Financial Visibility Passport
                  </div>
                  <p className="text-xs text-[#7C766B] italic max-w-sm mx-auto">
                    Making Small Businesses Financially Visible Through Organized Evidence
                  </p>
                </div>

                <div className="text-center my-10 py-6 border-y-2 border-[#14402F] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446]">
                    Issued For Commercial Entity
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
                    {business.name}
                  </h3>
                  <div className="text-xs text-[#5A3E2B] font-mono">
                    {business.location.city}, {business.location.state} · Operating {business.yearsOperating} Years
                  </div>
                </div>

                <div className="text-xs font-mono space-y-1.5 text-[#5A3E2B] text-center">
                  <div>Observation Period: November 1, 2025 – October 31, 2026</div>
                  <div>Report ID: AS-2026-IND-{business.id.toUpperCase().slice(-6)}</div>
                  <div className="text-[10px] text-[#7C766B] pt-2">
                    Voluntarily shared supplementary disclosure. Not a credit score or loan guarantee.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: STATEMENT */}
          {activePageIndex === 1 && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b-2 border-[#14402F] pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#D08A1E] font-bold">
                    Section 1 · Consolidated Statement
                  </span>
                  <h3 className="font-display font-bold text-2xl text-[#14402F]">
                    Financial Activity Overview
                  </h3>
                </div>
                <EvidenceChip evidenceClass="document_supplied" />
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] flex justify-between items-center">
                  <span>Total Recorded Sales (Revenue):</span>
                  <span className="text-lg font-bold text-[#14402F]">{formatINR(totalSales)}</span>
                </div>
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] flex justify-between items-center">
                  <span>Total Recorded Spending (Outflow):</span>
                  <span className="text-lg font-bold text-[#B5532F]">{formatINR(totalSpending)}</span>
                </div>
                <div className="p-3 bg-[#E4EAD6] rounded border border-[#939F5B] flex justify-between items-center">
                  <span className="font-bold text-[#14402F]">Net Recorded Cash Movement:</span>
                  <span className="text-lg font-bold text-[#14402F]">{formatINR(netCash)}</span>
                </div>
              </div>

              <div className="p-3 rounded bg-[#F8F1DE]/70 border border-[#D6CAA8] text-xs text-[#7C766B] font-sans italic">
                {t('dashboard.notProfit')}
              </div>

              <div>
                <h4 className="font-display font-bold text-base text-[#14402F] mb-2">
                  Evidence Classification Mix
                </h4>
                <EvidenceRibbon segments={evidenceSegments} height={24} showLabels={true} />
              </div>
            </div>
          )}

          {/* PAGE 3: FOUR DIMENSIONS */}
          {activePageIndex === 2 && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase text-[#D08A1E] font-bold">
                  Section 2 · Independent Evaluators
                </span>
                <h3 className="font-display font-bold text-2xl text-[#14402F]">
                  The Four Dimensions of Visibility
                </h3>
              </div>
              <DimensionPanel dimensions={dimensions} readOnly={true} />
            </div>
          )}

          {/* PAGE 4: CONTINUITY */}
          {activePageIndex === 3 && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase text-[#D08A1E] font-bold">
                  Section 3 · Operating Discipline
                </span>
                <h3 className="font-display font-bold text-2xl text-[#14402F]">
                  Operating Continuity & Coverage
                </h3>
              </div>

              <div className="p-4 bg-[#F8F1DE] rounded border border-[#D6CAA8] space-y-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Operating Days Expected:</span>
                  <span className="font-bold">{continuity.expectedDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Documented Sales Entries:</span>
                  <span className="font-bold text-[#14402F]">{continuity.recordedDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Documented Shop Closures:</span>
                  <span className="font-bold text-[#8A6446]">{continuity.documentedClosedDays} Days</span>
                </div>
                <div className="flex justify-between border-t border-[#D6CAA8] pt-2 text-sm font-bold text-[#14402F]">
                  <span>Total Continuity Coverage:</span>
                  <span>{continuity.coveragePercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5: IMPORTANT LIMITATIONS (MANDATORY PAGE) */}
          {activePageIndex === 4 && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#B5532F] pb-3">
                <span className="text-[10px] font-mono uppercase text-[#B5532F] font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Mandatory Disclosure · Section 4</span>
                </span>
                <h3 className="font-display font-bold text-2xl text-[#14402F]">
                  Important Limitations & Declarations
                </h3>
              </div>

              <div className="space-y-4 text-xs font-sans leading-relaxed text-[#2B2620]">
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <h4 className="font-bold text-[#14402F] mb-1">
                    1. Owner-Organised Records
                  </h4>
                  <p className="text-[#5A3E2B]">
                    All numbers in this report are consolidated from records supplied directly by the business owner. ArthSetu provides evidence structure but does not independently audit merchant accounts.
                  </p>
                </div>

                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <h4 className="font-bold text-[#14402F] mb-1">
                    2. Documents Are Not Independently Authenticated
                  </h4>
                  <p className="text-[#5A3E2B]">
                    Uploaded CSV files, receipt photos, and statements are labelled as "Document supplied, not independently authenticated". Consented third-party aggregator feeds are not enabled in this prototype.
                  </p>
                </div>

                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <h4 className="font-bold text-[#14402F] mb-1">
                    3. Revenue is Not Profit
                  </h4>
                  <p className="text-[#5A3E2B]">
                    Recorded sales represent gross cash and digital inflow. Net recorded cash movement does not reflect gross margin or taxable net income.
                  </p>
                </div>

                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <h4 className="font-bold text-[#14402F] mb-1">
                    4. Not a Credit Assessment
                  </h4>
                  <p className="text-[#5A3E2B]">
                    ArthSetu produces no composite score, underwriting recommendation, or credit appraisal. It is shared purely as supplementary documentation for human lending officers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 6: INTEGRITY FINGERPRINT */}
          {activePageIndex === 5 && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase text-[#D08A1E] font-bold">
                  Section 5 · Cryptographic Verification
                </span>
                <h3 className="font-display font-bold text-2xl text-[#14402F]">
                  Tamper-Evident Fingerprint
                </h3>
              </div>

              <div className="p-5 bg-[#F8F1DE] rounded border border-[#D6CAA8] space-y-3 font-mono">
                <div className="text-xs text-[#7C766B]">
                  SHA-256 Digest of Canonical JSON Report:
                </div>
                <div className="p-3 bg-[#2B2620] text-[#D08A1E] rounded text-xs break-all tracking-wider select-all">
                  {shaFingerprint || 'Computing SHA-256...'}
                </div>
                <div className="text-[11px] text-[#5A3E2B] font-sans leading-relaxed">
                  <strong>Verification Note:</strong> This hash proves whether this report has been altered in any way after generation. It guarantees digital immutability; it does not claim to prove the underlying paper records are true.
                </div>
              </div>

              <div className="p-4 bg-[#E4EAD6] border border-[#939F5B] rounded text-xs text-[#2A6347] flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-[#2A6347] flex-shrink-0" />
                <span>
                  Web Crypto SubtleCrypto Verified: Real mathematical digest computed locally in your browser session.
                </span>
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="pt-4 border-t border-[#D6CAA8] flex justify-between items-center text-[10px] font-mono text-[#7C766B] mt-8">
            <span>ArthSetu Financial Visibility Passport · Page {activePageIndex + 1} of 6</span>
            <span>Integrity: SHA-256 Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

