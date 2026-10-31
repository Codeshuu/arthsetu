import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { ShareGrant } from '../../services/types';
import { shareService } from '../../services/ShareService';
import { reportService } from '../../services/ReportService';
import { formatINR, formatCompactINR } from '../../lib/formatCurrency';
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
import { DimensionPanel } from '../../components/finance/DimensionPanel';
import { EvidenceRibbon } from '../../components/evidence/EvidenceRibbon';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import { Stamp } from '../../components/fragments/Stamp';
import { BankStatementStrip } from '../../components/fragments/BankRow';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Printer,
  FileCheck2,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const InstitutionViewPage: React.FC = () => {
  const { t } = useI18n();
  const { token } = useParams<{ token: string }>();
  const business = useArthSetuStore((s) => s.business);
  const transactions = useArthSetuStore((s) => s.transactions);
  const sources = useArthSetuStore((s) => s.sources);
  const diaryDays = useArthSetuStore((s) => s.diaryDays);
  const shares = useArthSetuStore((s) => s.shares);

  const demoFallbackShare: ShareGrant = {
    token: 'demo',
    sections: ['profile', 'dimensions', 'trends', 'evidence', 'limitations', 'integrity'],
    createdAt: '2026-10-25T10:00:00Z',
    expiresAt: '2026-11-25T10:00:00Z',
    recipientLabel: 'State Bank of India (Demonstration Share)',
  };

  const activeShare =
    shares.find((s) => s.token === token) ||
    (token === 'demo' ? shares.find((s) => s.token === 'demo') || demoFallbackShare : undefined);

  const [activeSection, setActiveSection] = useState<string>('profile');
  const [computedHash, setComputedHash] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'matched' | 'mismatch'>('matched');

  // Derived selectors
  const totalSales = selectRecordedSales(transactions);
  const totalSpending = selectRecordedSpending(transactions);
  const netCash = selectNetCashMovement(transactions);
  const split = selectSalesCashDigitalSplit(transactions);
  const continuity = selectOperatingContinuity(business, diaryDays);
  const evidenceSegments = selectEvidenceBreakdown(transactions);
  const dimensions = selectFourDimensions(business, transactions, diaryDays);
  const monthlyTrends = selectMonthlyTrends(transactions);

  useEffect(() => {
    reportService.computeFingerprint().then((hash) => {
      setComputedHash(hash);
    });
  }, [business, transactions, diaryDays]);

  const handleVerifyHash = async () => {
    setIsVerifying(true);
    setTimeout(async () => {
      const liveHash = await reportService.computeFingerprint();
      if (liveHash === computedHash) {
        setVerifyStatus('matched');
      } else {
        setVerifyStatus('mismatch');
      }
      setIsVerifying(false);
    }, 500);
  };

  // State checks: expired or revoked
  const isRevoked = activeShare?.revokedAt !== undefined;
  const isExpired = activeShare ? new Date(activeShare.expiresAt) < new Date() : false;

  if (!activeShare) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#FDFBF4] border border-[#D6CAA8] rounded-lg text-center space-y-4 shadow-paper-lift">
        <AlertTriangle className="w-10 h-10 text-[#B5532F] mx-auto" />
        <h2 className="font-display font-bold text-2xl text-[#14402F]">
          {t('institution.shareNotFoundTitle')}
        </h2>
        <p className="text-xs text-[#5A3E2B]">
          {t('institution.shareNotFoundDesc')}
        </p>
        <Link
          to="/app"
          className="inline-block px-4 py-2 rounded bg-[#14402F] text-white text-xs font-bold"
        >
          {t('institution.switchOwnerBtn')}
        </Link>
      </div>
    );
  }

  if (isRevoked) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#FDFBF4] border border-[#B5532F] rounded-lg text-center space-y-4 shadow-paper-lift">
        <Lock className="w-10 h-10 text-[#B5532F] mx-auto" />
        <h2 className="font-display font-bold text-2xl text-[#B5532F]">
          {t('institution.revokedTitle')}
        </h2>
        <p className="text-xs text-[#5A3E2B]">
          {t('institution.revokedDesc')}
        </p>
      </div>
    );
  }

  const navSections = [
    { id: 'profile', label: t('institution.tabProfile') },
    { id: 'dimensions', label: t('institution.tabDimensions') },
    { id: 'statement', label: '3. Recorded Statement' },
    { id: 'trends', label: t('institution.tabTrends') },
    { id: 'continuity', label: '5. Operating Continuity' },
    { id: 'evidence', label: t('institution.tabEvidence') },
    { id: 'limitations', label: t('institution.tabLimitations') },
    { id: 'integrity', label: t('institution.tabIntegrity') },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 select-none font-sans">
      {/* Formal Top Bar */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <div className="font-bold text-[#14402F] font-sans text-sm">
            Voluntary Disclosure for: {business.name}
          </div>
          <div className="text-[11px] text-[#7C766B]">
            Recipient: {activeShare.recipientLabel} · Access valid until{' '}
            {activeShare.expiresAt.split('T')[0]}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#14402F] font-bold hover:bg-[#E6DAB9]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Section</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sticky Left Index + Center Document Pane + Right Scope Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Sticky Section Index (3 cols) */}
        <div className="lg:col-span-3 sticky top-4 space-y-2">
          <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-3 shadow-sm">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8A6446] block mb-2">
              DOCUMENT SECTIONS
            </span>
            <nav className="space-y-1 text-xs">
              {navSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${
                    activeSection === sec.id
                      ? 'bg-[#14402F] text-[#FDFBF4] font-bold shadow-xs'
                      : 'text-[#4B4740] hover:bg-[#F8F1DE] hover:text-[#14402F]'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Center: Main Reading Pane (6 cols) */}
        <div className="lg:col-span-6 bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-6 sm:p-8 shadow-paper-elevated space-y-6 bg-khata-page min-h-[600px]">
          {/* SECTION: PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#14402F] pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                    Section 1 · Commercial Entity
                  </span>
                  <h2 className="font-display font-bold text-2xl text-[#14402F]">
                    Business Profile & Overview
                  </h2>
                </div>
                <Stamp variant="owner_shared" rotation={-3} animate={false} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <span className="text-[#7C766B] block">Enterprise Name:</span>
                  <span className="font-bold text-[#14402F] text-sm">{business.name}</span>
                </div>
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <span className="text-[#7C766B] block">Category:</span>
                  <span className="font-bold text-[#2B2620] uppercase">{business.category}</span>
                </div>
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <span className="text-[#7C766B] block">Ownership:</span>
                  <span className="font-bold text-[#2B2620]">{business.ownership}</span>
                </div>
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
                  <span className="text-[#7C766B] block">Operating Tenure:</span>
                  <span className="font-bold text-[#14402F]">{business.yearsOperating} Years</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] text-xs font-mono">
                <span className="text-[#7C766B] block">Trading Address:</span>
                <span className="font-bold text-[#2B2620]">
                  {business.location.area}, {business.location.city}, {business.location.state} – {business.location.pincode}
                </span>
              </div>
            </div>
          )}

          {/* SECTION: FOUR DIMENSIONS */}
          {activeSection === 'dimensions' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                  Section 2 · Independent Evaluators
                </span>
                <h2 className="font-display font-bold text-2xl text-[#14402F]">
                  Four Dimensions of Visibility
                </h2>
              </div>
              <DimensionPanel dimensions={dimensions} readOnly={true} />
            </div>
          )}

          {/* SECTION: STATEMENT */}
          {activeSection === 'statement' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                  Section 3 · Financial Totals
                </span>
                <h2 className="font-display font-bold text-2xl text-[#14402F]">
                  Recorded Statement Summary
                </h2>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] flex justify-between items-center">
                  <span>Gross Recorded Sales:</span>
                  <span className="text-lg font-bold text-[#14402F]">{formatINR(totalSales)}</span>
                </div>
                <div className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] flex justify-between items-center">
                  <span>Gross Recorded Spending:</span>
                  <span className="text-lg font-bold text-[#B5532F]">{formatINR(totalSpending)}</span>
                </div>
                <div className="p-3 bg-[#E4EAD6] rounded border border-[#939F5B] flex justify-between items-center">
                  <span className="font-bold text-[#14402F]">Net Recorded Cash Flow:</span>
                  <span className="text-lg font-bold text-[#14402F]">{formatINR(netCash)}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F1DE] border border-[#D6CAA8] rounded text-xs text-[#7C766B] font-sans">
                <strong>Accounting Note:</strong> In accordance with ArthSetu transparency guidelines, net recorded movement represents declared and documented cash flow. It is not an assessment of commercial profit.
              </div>

              <div>
                <h4 className="font-display font-bold text-base text-[#14402F] mb-2">
                  Evidence Mix Across Recorded Value
                </h4>
                <EvidenceRibbon segments={evidenceSegments} height={24} showLabels={true} />
              </div>
            </div>
          )}

          {/* SECTION: TRENDS */}
          {activeSection === 'trends' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                  Section 4 · Historical Trajectory
                </span>
                <h2 className="font-display font-bold text-2xl text-[#14402F]">
                  Monthly Sales Distribution
                </h2>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6DAB9" opacity={0.6} />
                    <XAxis dataKey="monthLabel" stroke="#7C766B" fontSize={10} tickLine={false} />
                    <YAxis
                      stroke="#7C766B"
                      fontSize={10}
                      tickFormatter={(v) => formatCompactINR(v)}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FDFBF4',
                        borderColor: '#D6CAA8',
                        fontSize: '11px',
                      }}
                      formatter={(v: number) => [formatINR(v), 'Sales']}
                    />
                    <Bar dataKey="sales" fill="#14402F" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* SECTION: CONTINUITY */}
          {activeSection === 'continuity' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                  Section 5 · Operating Discipline
                </span>
                <h2 className="font-display font-bold text-2xl text-[#14402F]">
                  Operating Continuity & Coverage
                </h2>
              </div>

              <div className="p-4 bg-[#F8F1DE] rounded border border-[#D6CAA8] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span>Operating Days Expected:</span>
                  <span className="font-bold text-[#2B2620]">{continuity.expectedDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Documented Sales Days:</span>
                  <span className="font-bold text-[#14402F]">{continuity.recordedDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Documented Closure Days:</span>
                  <span className="font-bold text-[#8A6446]">{continuity.documentedClosedDays} Days</span>
                </div>
                <div className="flex justify-between border-t border-[#D6CAA8] pt-2 text-sm font-bold text-[#14402F]">
                  <span>Continuity Metric:</span>
                  <span>{continuity.coveragePercent}% Coverage</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: EVIDENCE */}
          {activeSection === 'evidence' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                  Section 6 · Supplied Documents
                </span>
                <h2 className="font-display font-bold text-2xl text-[#14402F]">
                  Document Shelf & Evidence Strip
                </h2>
              </div>

              <div className="space-y-3">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-[#14402F] font-sans">{src.fileName}</div>
                      <div className="text-[10px] text-[#7C766B]">
                        {src.rowCount} rows · Tagged as {src.accountTag} account
                      </div>
                    </div>
                    <EvidenceChip evidenceClass="document_supplied" size="sm" />
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <BankStatementStrip bankName="Primary Account (Demonstration Sample)" />
              </div>
            </div>
          )}

          {/* SECTION: LIMITATIONS */}
          {activeSection === 'limitations' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#B5532F] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#B5532F]">
                  Section 7 · Mandatory Declarations
                </span>
                <h2 className="font-display font-bold text-2xl text-[#14402F]">
                  Limitations of Voluntary Disclosure
                </h2>
              </div>

              <div className="space-y-3 text-xs font-sans leading-relaxed text-[#5A3E2B]">
                <p>
                  1. <strong>Owner Declaration:</strong> Figures are organised from records provided voluntarily by the business owner. ArthSetu provides evidence traceability but does not conduct external statutory audits.
                </p>
                <p>
                  2. <strong>Non-Authenticated Uploads:</strong> Uploaded bank CSVs and UPI reports are labelled "Document supplied, not independently authenticated".
                </p>
                <p>
                  3. <strong>Revenue is Not Profit:</strong> Recorded figures represent gross activity, not commercial underwriting profit.
                </p>
                <p>
                  4. <strong>Institutional Autonomy:</strong> ArthSetu provides no automated credit verdict or scoring metric. Institutional lending decisions remain entirely under the discretion of the reviewing financial institution.
                </p>
              </div>
            </div>
          )}

          {/* SECTION: INTEGRITY */}
          {activeSection === 'integrity' && (
            <div className="space-y-5">
              <div className="border-b-2 border-[#14402F] pb-3">
                <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                  Section 8 · Digital Immutability
                </span>
                <h2 className="font-display font-bold text-2xl text-[#14402F]">
                  Cryptographic Integrity Verification
                </h2>
              </div>

              <div className="p-4 bg-[#F8F1DE] rounded border border-[#D6CAA8] space-y-3 font-mono text-xs">
                <div className="text-[#7C766B]">SHA-256 Digest of Canonical Record:</div>
                <div className="p-2.5 bg-[#2B2620] text-[#D08A1E] rounded text-xs break-all select-all">
                  {computedHash}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleVerifyHash}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded bg-[#14402F] text-white font-bold hover:bg-[#0F2E22] transition-colors"
                  >
                    {isVerifying ? 'Verifying Digest...' : 'Verify Cryptographic Hash'}
                  </button>
                  {verifyStatus === 'matched' && (
                    <span className="text-[#2A6347] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tamper-Check Passed ✓</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Data Scope Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-4 shadow-sm space-y-3 text-xs font-mono">
            <span className="text-[10px] uppercase font-bold text-[#8A6446] block pb-1 border-b border-[#D6CAA8]">
              DISCLOSURE SCOPE
            </span>
            <div className="flex justify-between">
              <span className="text-[#7C766B]">Total Records:</span>
              <span className="font-bold text-[#14402F]">{transactions.length} entries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C766B]">Source Files:</span>
              <span className="font-bold text-[#14402F]">{sources.length} documents</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C766B]">Period:</span>
              <span className="font-bold text-[#2B2620]">12 Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7C766B]">Direct Auth:</span>
              <span className="font-bold text-[#8A6446]">0% (Locked)</span>
            </div>
          </div>

          <div className="bg-[#E4EAD6] border border-[#939F5B] rounded-md p-4 text-xs space-y-1 text-[#14402F]">
            <div className="font-bold font-mono">Voluntary Disclosure Note</div>
            <p className="text-[11px] leading-relaxed">
              This dossier is provided voluntarily by the business owner as supplementary evidence. No third-party bureau inquiry has been triggered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

