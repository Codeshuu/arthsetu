import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { StatementBlock } from '../../components/finance/StatementBlock';
import { DimensionPanel } from '../../components/finance/DimensionPanel';
import { ObservationCard } from '../../components/finance/ObservationCard';
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
import { selectActiveObservations } from '../../selectors/observationSelectors';
import { formatCompactINR, formatINR } from '../../lib/formatCurrency';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Clock,
  ArrowRight,
  FileCheck2,
  Calendar,
  Receipt,
  ShieldAlert,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { t, language } = useI18n();
  const business = useArthSetuStore((s) => s.business);
  const transactions = useArthSetuStore((s) => s.transactions);
  const diaryDays = useArthSetuStore((s) => s.diaryDays);
  const observations = useArthSetuStore((s) => s.observations);

  // Derived financial figures via selectors
  const totalSales = selectRecordedSales(transactions);
  const totalSpending = selectRecordedSpending(transactions);
  const netCash = selectNetCashMovement(transactions);
  const split = selectSalesCashDigitalSplit(transactions);
  const continuity = selectOperatingContinuity(business, diaryDays);
  const evidenceSegments = selectEvidenceBreakdown(transactions);
  const dimensions = selectFourDimensions(business, transactions, diaryDays);
  const activeObs = selectActiveObservations(observations);
  const monthlyTrends = selectMonthlyTrends(transactions);

  // Prioritized Next Actions Queue
  const nextActions = [
    {
      title: t('dashboard.action1Title', 'Review unclassified bank credits'),
      detail: t('dashboard.action1Desc', `${transactions.filter((t) => t.category === 'unclassified').length} transactions awaiting classification`),
      time: '2 min',
      link: '/app/records/review',
      icon: Receipt,
    },
    {
      title: t('dashboard.action2Title', 'Record today’s cash & UPI sales'),
      detail: t('dashboard.action2Desc', 'Keep your 92% operating continuity record intact'),
      time: '1 min',
      link: '/app/diary',
      icon: Calendar,
    },
    {
      title: t('dashboard.action3Title', 'Upload wholesale supplier bills'),
      detail: t('dashboard.action3Desc', 'Strengthen Evidence Reliability score with invoice links'),
      time: '3 min',
      link: '/app/evidence',
      icon: FileCheck2,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="font-sans"
    >
      {/* Hero greeting banner — warm, editorial style */}
      <div className="relative overflow-hidden bg-[#0F2E22] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-jali-pattern opacity-20" />
        {/* Warm amber glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D08A1E] opacity-5 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {business.category === 'kirana' ? '🏪' :
                 business.category === 'garments' ? '👗' :
                 business.category === 'vegetable_fruit' ? '🥦' :
                 business.category === 'festival_goods' ? '🪔' :
                 business.category === 'stationery' ? '📚' : '🛒'}
              </span>
              <span className="text-[11px] font-mono text-[#D08A1E] uppercase font-bold tracking-wider">
                {t('dashboard.greeting', 'Namaste')}, {business.name.split(' ')[0]}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#FDFBF4] leading-tight">
              {t('dashboard.subheading', 'Here is your Financial Visibility Summary')}
            </h1>
            <div className="text-xs text-[#B7C4A0] font-sans mt-1">{business.name} · {business.location.city}</div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono flex-shrink-0">
            <span className="text-[#7C9A80]">{t('dashboard.periodLabel', 'Observation Period')}:</span>
            <span className="px-3 py-1.5 rounded-lg bg-[#14402F] border border-[#2A6347] font-bold text-[#FDFBF4]">
              {t('dashboard.periodValue', 'Nov 2025 – Oct 2026')}
            </span>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* Main Grid: Left Statement Column + Right Evidence / Trend Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: The Statement Hero (7 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
          className="lg:col-span-7 space-y-6"
        >
          <StatementBlock
            sales={totalSales}
            spending={totalSpending}
            netCashMovement={netCash}
            cashSales={split.cashTotal}
            digitalSales={split.digitalTotal}
            expectedDays={continuity.expectedDays}
            recordedDays={continuity.recordedDays}
            coveragePercent={continuity.coveragePercent}
            evidenceSegments={evidenceSegments}
          />

          {/* Attention Observations Strip */}
          {activeObs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B5532F] flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#B5532F]" />
                  <span>
                    {t('dashboard.attentionStrip', 'Observations Needing Attention')} ({activeObs.length})
                  </span>
                </span>
                <Link
                  to="/app/evidence"
                  className="text-xs text-[#14402F] font-bold hover:underline"
                >
                  {t('dashboard.viewEvidence', 'View in Evidence Centre →')}
                </Link>
              </div>
              <div className="space-y-2">
                {activeObs.slice(0, 2).map((obs) => (
                  <ObservationCard key={obs.id} observation={obs} />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right: Trend & Priority Actions Column (5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="lg:col-span-5 space-y-6"
        >
          {/* Mini Trend Chart */}
          <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-xl p-4 sm:p-5 shadow-paper-lift bg-khata-page">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446] font-bold">
                  {t('dashboard.monthlyOverview', 'Monthly Overview')}
                </span>
                <h3 className="font-display font-bold text-base text-[#14402F]">
                  {t('dashboard.salesVsSpending', 'Recorded Sales vs Spending')}
                </h3>
              </div>
              <Link
                to="/app/analytics"
                className="text-xs font-bold text-[#14402F] hover:text-[#D08A1E] flex items-center space-x-0.5"
              >
                <span>{t('dashboard.fullTrends', 'Full Trends')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6DAB9" opacity={0.6} />
                  <XAxis dataKey="monthLabel" stroke="#7C766B" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#7C766B"
                    fontSize={10}
                    tickFormatter={(val) => formatCompactINR(val)}
                    tickLine={false}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDFBF4',
                      borderColor: '#D6CAA8',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#2B2620',
                    }}
                    formatter={(val: number) => [formatINR(val), '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name={t('dashboard.salesLegend', 'Sales (Inflow)')}
                    stroke="#14402F"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="spending"
                    name={t('dashboard.spendingLegend', 'Spending (Outflow)')}
                    stroke="#B5532F"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-2 text-[11px] font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-0.5 bg-[#14402F]" />
                <span className="text-[#14402F] font-bold">{t('dashboard.salesLegend', 'Sales (Inflow)')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-0.5 bg-[#B5532F] border-b border-dashed" />
                <span className="text-[#B5532F] font-bold">{t('dashboard.spendingLegend', 'Spending (Outflow)')}</span>
              </span>
            </div>
          </div>

          {/* Next Best Things to Organise */}
          <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-4 sm:p-5 shadow-paper-lift bg-khata-page">
            <div className="flex items-center justify-between pb-2 border-b border-[#D6CAA8] mb-3">
              <span className="font-display font-bold text-base text-[#14402F]">
                {t('dashboard.nextActions', 'Next Best Things to Organise')}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#8A6446]">
                {t('dashboard.priorityQueue', 'PRIORITY QUEUE')}
              </span>
            </div>

            <div className="space-y-2.5">
              {nextActions.map((act, i) => {
                const Icon = act.icon;
                return (
                  <Link
                    key={i}
                    to={act.link}
                    className="group p-2.5 rounded bg-[#F8F1DE]/70 border border-[#D6CAA8]/60 hover:bg-[#E6DAB9]/80 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-start space-x-2.5">
                      <div className="p-1.5 rounded bg-[#14402F] text-[#FDFBF4] mt-0.5 group-hover:scale-105 transition-transform shadow-xs">
                        <Icon className="w-3.5 h-3.5 text-[#D08A1E]" />
                      </div>
                      <div>
                        <div className="font-bold text-[#2B2620] group-hover:text-[#14402F]">
                          {act.title}
                        </div>
                        <div className="text-[11px] text-[#7C766B] font-sans">
                          {act.detail}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-[#8A6446] bg-[#FDFBF4] px-1.5 py-0.5 rounded border border-[#D6CAA8]">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{act.time}</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Four Dimensions of Financial Visibility Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pt-4 border-t border-[#D6CAA8]"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446] font-bold">
              {t('landing.dimensionsTag', 'Credibility Architecture')}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#14402F]">
              {t('dashboard.fourDimensionsTitle', 'Four Dimensions of Financial Visibility')}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#7C766B] hidden sm:inline">
            {t('dashboard.dimensionsSubtext', 'No single credit score · Evaluated from real records')}
          </span>
        </div>
        <DimensionPanel dimensions={dimensions} />
      </motion.div>
      </div>
    </motion.div>
  );
};
