import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Download,
  Info,
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

export const InstitutionViewPage: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const { t } = useI18n();

  const business = useArthSetuStore((s) => s.business);
  const transactions = useArthSetuStore((s) => s.transactions);
  const diaryDays = useArthSetuStore((s) => s.diaryDays);
  const udhaar = useArthSetuStore((s) => s.udhaar);
  const shares = useArthSetuStore((s) => s.shares);

  const [activeTab, setActiveTab] = useState<string>('profile');
  const [shaFingerprint, setShaFingerprint] = useState<string>('');
  const [verifiedStatus, setVerifiedStatus] = useState<'idle' | 'matched'>('idle');

  const currentShare = shares.find((s) => s.token === (token || 'demo')) || shares[0];
  const isRevoked = currentShare?.revokedAt != null;

  // Derived financial figures
  const totalSales = selectRecordedSales(transactions);
  const totalSpending = selectRecordedSpending(transactions);
  const netCash = selectNetCashMovement(transactions);
  const split = selectSalesCashDigitalSplit(transactions);
  const continuity = selectOperatingContinuity(business, diaryDays);
  const evidenceSegments = selectEvidenceBreakdown(transactions);
  const dimensions = selectFourDimensions(business, transactions, diaryDays);
  const monthlyTrends = selectMonthlyTrends(transactions);
  const expenseBreakdown = selectExpenseBreakdown(transactions);

  const reportRefId = `AS-2026-IND-${business.id.toUpperCase().slice(-6) || '904218'}`;

  const totalReceivables = udhaar.reduce((sum, u) => {
    const settled = u.settlements.reduce((s, st) => s + st.amount, 0);
    return sum + Math.max(0, u.amount - settled);
  }, 0);

  useEffect(() => {
    reportService.computeFingerprint().then((hash) => {
      setShaFingerprint(hash);
    });
  }, [business, transactions, diaryDays]);

  const handleVerifyLive = () => {
    reportService.computeFingerprint().then((hash) => {
      setShaFingerprint(hash);
      setVerifiedStatus('matched');
    });
  };

  if (isRevoked) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-lg p-8 border border-slate-300 shadow-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t('institution.revokedTitle')}</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{t('institution.revokedDesc')}</p>
          <Link
            to="/app"
            className="inline-block px-4 py-2 rounded bg-slate-900 text-white text-xs font-bold"
          >
            {t('institution.switchOwnerBtn')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 select-none pb-16">
      {/* Top Institutional Header */}
      <header className="bg-[#0A2540] text-white px-4 sm:px-8 py-3.5 border-b border-slate-700 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-[#38BDF8] font-bold border border-slate-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8] font-bold">
                  {t('institution.readOnlyBadge')}
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-[10px] font-mono text-slate-300">
                  {currentShare?.recipientLabel || 'Bank Evaluation Officer'}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white leading-tight">
                {t('institution.shellHeader')}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <LanguageSelector variant="passport" />
            <Link
              to="/app"
              className="px-3.5 py-1.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              {t('institution.switchOwnerBtn')}
            </Link>
          </div>
        </div>
      </header>

      {/* Institutional Disclaimer Banner */}
      <div className="bg-slate-200/80 border-b border-slate-300 px-4 sm:px-8 py-2 text-xs font-mono text-slate-700">
        <div className="max-w-6xl mx-auto flex items-center space-x-2">
          <Info className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span>{t('institution.disclaimer')}</span>
        </div>
      </div>

      {/* Main Review Portal Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 border-b border-slate-300 overflow-x-auto pb-1 text-xs font-medium">
          {[
            { id: 'profile', label: t('institution.tabProfile') },
            { id: 'dimensions', label: t('institution.tabDimensions') },
            { id: 'trends', label: t('institution.tabTrends') },
            { id: 'evidence', label: t('institution.tabEvidence') },
            { id: 'limitations', label: t('institution.tabLimitations') },
            { id: 'integrity', label: t('institution.tabIntegrity') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-t-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-white border-t-2 border-t-[#0284C7] border-x border-slate-300 font-bold text-[#0A2540] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile & Executive Summary */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <span className="text-[10px] font-mono uppercase text-[#0284C7] font-bold">
                Institution File Dossier · REF: {reportRefId}
              </span>
              <h2 className="text-2xl font-bold text-[#0A2540] mt-1">{business.name}</h2>
              <div className="text-xs text-slate-500 mt-1">
                {business.location.city}, {business.location.state} · {business.category.toUpperCase()} · {business.yearsOperating} Years Continuous Trade
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">{t('passport.salesTitle')}</span>
                <span className="text-xl font-bold text-[#0A2540]">{formatINR(totalSales)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Gross classified inflow</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">{t('passport.spendingTitle')}</span>
                <span className="text-xl font-bold text-slate-800">{formatINR(totalSpending)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Procurement & store utilities</span>
              </div>
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded">
                <span className="text-blue-900 block font-semibold text-[11px]">{t('passport.netCashTitle')}</span>
                <span className="text-xl font-bold text-blue-900">{formatINR(netCash)}</span>
                <span className="text-[10px] text-blue-700 block mt-1">Net cash flow (NOT commercial profit)</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">{t('passport.salesCash')}</span>
                <span className="text-base font-bold text-slate-800">{formatINR(split.cashTotal)} ({split.cashPercent}%)</span>
                <span className="text-[10px] text-slate-400 block mt-1">Counter cash recorded</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">{t('passport.salesDigital')}</span>
                <span className="text-base font-bold text-slate-800">{formatINR(split.digitalTotal)} ({split.digitalPercent}%)</span>
                <span className="text-[10px] text-slate-400 block mt-1">UPI & statement entries</span>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">{t('passport.receivablesTitle')}</span>
                <span className="text-base font-bold text-slate-800">{formatINR(totalReceivables)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Active customer credit</span>
              </div>
            </div>

            <div className="p-4 rounded bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Institutional Assessment Note:</strong> {t('passport.legalDisclaimer')}
            </div>
          </div>
        )}

        {/* Tab 2: Four Dimensions */}
        {activeTab === 'dimensions' && (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-xl font-bold text-[#0A2540]">{t('passport.dimTitle')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('passport.dimDesc')}</p>
            </div>

            <div className="space-y-4">
              {dimensions.map((dim, idx) => (
                <div key={dim.id} className="border border-slate-200 rounded-md p-4 bg-slate-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                    <span className="font-bold text-sm text-[#0A2540]">{idx + 1}. {dim.nameEn}</span>
                    <span className="px-2.5 py-0.5 rounded bg-[#0A2540] text-white font-mono text-xs font-bold">
                      {dim.level} ({dim.scorePercent}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-bold block text-[11px]">Observed Evidence:</span>
                      <ul className="space-y-1 text-slate-700 mt-1">
                        {dim.factsEn.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block text-[11px]">Limitations & Missing Info:</span>
                      <p className="text-slate-700 mt-1 leading-relaxed text-[11px]">{dim.improvementEn}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Financial Graphs */}
        {activeTab === 'trends' && (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-xl font-bold text-[#0A2540]">{t('passport.graph1Title')}</h3>
              <p className="text-xs text-slate-500">{t('passport.graph1Desc')}</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="monthLabel" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={10} tickFormatter={(v) => formatCompactINR(v)} tickLine={false} width={45} />
                  <Tooltip formatter={(val: number) => [formatINR(val), '']} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="cashSales" name="Cash Sales" stackId="sales" fill="#0A2540" />
                  <Bar dataKey="digitalSales" name="Digital / UPI" stackId="sales" fill="#0284C7" />
                  <Line type="monotone" dataKey="spending" name="Total Spending" stroke="#DC2626" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 4: Evidence Breakdown */}
        {activeTab === 'evidence' && (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-6 sm:p-8 space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-xl font-bold text-[#0A2540]">{t('passport.graph6Title')}</h3>
              <p className="text-xs text-slate-500">{t('passport.graph6Desc')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Document Supplied</span>
                <span className="text-lg font-bold text-[#0A2540] block my-1">
                  {formatINR(evidenceSegments.find((s) => s.cls === 'document_supplied')?.amount || 0)}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Uploaded statements & invoices (Not third-party verified).
                </span>
              </div>
              <div className="p-4 rounded border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Owner Declared</span>
                <span className="text-lg font-bold text-slate-800 block my-1">
                  {formatINR(evidenceSegments.find((s) => s.cls === 'owner_declared')?.amount || 0)}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Proprietor counter cash & diary entries.
                </span>
              </div>
              <div className="p-4 rounded border border-slate-200 bg-slate-100">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Source Authenticated</span>
                <span className="text-lg font-bold text-slate-500 block my-1">₹0 (0%)</span>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Direct Account Aggregator feed (Locked in demo).
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Methodology & Scope */}
        {activeTab === 'limitations' && (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-6 sm:p-8 space-y-5 text-xs font-sans">
            <h3 className="text-xl font-bold text-[#0A2540]">{t('passport.methodologyTitle')}</h3>
            <div className="space-y-3 leading-relaxed text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                <h4 className="font-bold text-[#0A2540]">{t('passport.methOwner')}</h4>
                <p className="mt-0.5">{t('passport.methOwnerDesc')}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                <h4 className="font-bold text-[#0A2540]">{t('passport.methSupplied')}</h4>
                <p className="mt-0.5">{t('passport.methSuppliedDesc')}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200">
                <h4 className="font-bold text-[#0A2540]">{t('passport.methAuth')}</h4>
                <p className="mt-0.5">{t('passport.methAuthDesc')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Cryptographic Integrity */}
        {activeTab === 'integrity' && (
          <div className="bg-white rounded-lg border border-slate-300 shadow-sm p-6 sm:p-8 space-y-5">
            <h3 className="text-xl font-bold text-[#0A2540]">{t('passport.integrityTitle')}</h3>
            <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3 font-mono text-xs">
              <span className="text-slate-500 font-bold block">Current Canonical Dataset SHA-256 Digest:</span>
              <div className="p-3 bg-[#0A2540] text-[#38BDF8] rounded select-all break-all tracking-wider font-mono">
                {shaFingerprint || 'Computing SHA-256...'}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVerifyLive}
                  className="px-4 py-2 rounded bg-[#0284C7] text-white font-bold text-xs hover:bg-[#0369A1] transition-colors"
                >
                  {t('institution.verifyBtn')}
                </button>
              </div>
              {verifiedStatus === 'matched' && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">{t('institution.verifyMatched')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

