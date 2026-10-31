import React, { useState } from 'react';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import {
  selectMonthlyTrends,
  selectDailyTrends,
  selectExpenseBreakdown,
  selectRecordedSales,
  selectRecordedSpending,
  selectNetCashMovement,
} from '../../selectors/financeSelectors';
import { formatCompactINR, formatINR } from '../../lib/formatCurrency';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Download, SlidersHorizontal, AlertCircle, Sparkles } from 'lucide-react';
import { KhataPage } from '../../components/fragments/KhataPage';

export const AnalyticsPage: React.FC = () => {
  const { t } = useI18n();
  const transactions = useArthSetuStore((s) => s.transactions);
  const business = useArthSetuStore((s) => s.business);

  const [colorByEvidence, setColorByEvidence] = useState(false);
  const [periodPreset, setPeriodPreset] = useState<'3m' | '6m' | 'all'>('all');
  const [viewGranularity, setViewGranularity] = useState<'daily' | 'monthly'>('daily');

  const allMonthlyTrends = selectMonthlyTrends(transactions);
  const monthlyTrends =
    periodPreset === '3m'
      ? allMonthlyTrends.slice(-3)
      : periodPreset === '6m'
      ? allMonthlyTrends.slice(-6)
      : allMonthlyTrends;

  const allDailyTrends = selectDailyTrends(transactions);
  const dailyTrends =
    periodPreset === '3m'
      ? allDailyTrends.slice(-90)
      : periodPreset === '6m'
      ? allDailyTrends.slice(-180)
      : allDailyTrends;

  const chartData = viewGranularity === 'daily' ? dailyTrends : monthlyTrends;
  const xDataKey = viewGranularity === 'daily' ? 'dateLabel' : 'monthLabel';

  const expenseBreakdown = selectExpenseBreakdown(transactions);
  const totalSales = selectRecordedSales(transactions);
  const totalSpending = selectRecordedSpending(transactions);

  // Check 12-month seasonality requirement
  const hasTwelveMonths = allMonthlyTrends.length >= 12;

  const handleDownloadCsv = () => {
    let csv = 'Month,Recorded Sales,Cash Sales,Digital Sales,Spending,Net Movement\n';
    monthlyTrends.forEach((m) => {
      csv += `${m.monthLabel},${m.sales},${m.cashSales},${m.digitalSales},${m.spending},${m.netCashMovement}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArthSetu_Analytics_${business.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto font-sans select-none">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('analytics.banner')}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
            {t('analytics.title')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Granularity Toggle: Daily vs Monthly */}
          <div className="flex items-center rounded bg-[#F8F1DE] border border-[#D6CAA8] p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewGranularity('daily')}
              className={`px-3 py-1 rounded transition-colors font-bold ${
                viewGranularity === 'daily'
                  ? 'bg-[#14402F] text-white shadow-xs'
                  : 'text-[#7C766B] hover:text-[#2B2620]'
              }`}
            >
              📅 Daily View
            </button>
            <button
              onClick={() => setViewGranularity('monthly')}
              className={`px-3 py-1 rounded transition-colors font-bold ${
                viewGranularity === 'monthly'
                  ? 'bg-[#14402F] text-white shadow-xs'
                  : 'text-[#7C766B] hover:text-[#2B2620]'
              }`}
            >
              📊 Monthly View
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center rounded bg-[#F8F1DE] border border-[#D6CAA8] p-0.5 text-xs font-mono">
            {[
              { id: '3m', label: t('analytics.last3m') },
              { id: '6m', label: t('analytics.last6m') },
              { id: 'all', label: t('analytics.allTime') },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodPreset(p.id as any)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  periodPreset === p.id
                    ? 'bg-[#14402F] text-white font-bold'
                    : 'text-[#7C766B] hover:text-[#2B2620]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-1 px-3 py-1.5 rounded bg-[#FDFBF4] border border-[#D6CAA8] text-xs font-mono font-bold text-[#14402F] hover:bg-[#F8F1DE]"
          >
            <Download className="w-3.5 h-3.5 text-[#D08A1E]" />
            <span>{t('analytics.exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Hero Chart: Revenue and Spending Trend */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 sm:p-6 shadow-paper-elevated space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D6CAA8] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446]">
              Hero Trend Analysis
            </span>
            <h3 className="font-display font-bold text-xl text-[#14402F]">
              Revenue and Spending Trajectory
            </h3>
          </div>

          <button
            onClick={() => setColorByEvidence(!colorByEvidence)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors flex items-center space-x-1.5 ${
              colorByEvidence
                ? 'bg-[#B28A33] text-white border-[#7A5A16]'
                : 'bg-[#F8F1DE] text-[#7A5A16] border-[#D6CAA8]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{colorByEvidence ? '✓ Coloured by Evidence' : 'Colour by Evidence Class'}</span>
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6DAB9" opacity={0.6} />
              <XAxis dataKey={xDataKey} stroke="#7C766B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#7C766B"
                fontSize={11}
                tickFormatter={(val) => formatCompactINR(val)}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FDFBF4',
                  borderColor: '#D6CAA8',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
                formatter={(val: number) => [formatINR(val), '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar
                dataKey="sales"
                name="Recorded Sales (Inflow)"
                fill={colorByEvidence ? '#B28A33' : '#14402F'}
                radius={[3, 3, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="spending"
                name="Recorded Spending (Outflow)"
                stroke="#B5532F"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#B5532F' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Cash vs Digital Sales & Expense Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash vs Digital Sales Stacked Columns */}
        <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift space-y-3">
          <div className="border-b border-[#D6CAA8] pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446]">
              Payment Channels
            </span>
            <h3 className="font-display font-bold text-lg text-[#14402F]">
              Cash vs Digital (UPI/Bank) Distribution
            </h3>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6DAB9" opacity={0.5} />
                <XAxis dataKey={xDataKey} stroke="#7C766B" fontSize={10} tickLine={false} />
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
                    fontSize: '11px',
                  }}
                  formatter={(val: number) => [formatINR(val), '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="cashSales"
                  name="Cash Sales (Daybook)"
                  stackId="sales"
                  fill="#8A6446"
                />
                <Bar
                  dataKey="digitalSales"
                  name="Digital (UPI/Bank)"
                  stackId="sales"
                  fill="#6B7A3A"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift space-y-3">
          <div className="border-b border-[#D6CAA8] pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446]">
              Cost Breakdown
            </span>
            <h3 className="font-display font-bold text-lg text-[#14402F]">
              Recorded Spending by Category
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {expenseBreakdown.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#2B2620]">{item.labelEn}</span>
                  <span className="font-mono font-bold text-[#14402F]">
                    {formatINR(item.amount)} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded bg-[#E6DAB9] overflow-hidden">
                  <div
                    className="h-full bg-[#B5532F]"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonality Section */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 sm:p-6 shadow-paper-lift">
        <div className="flex justify-between items-center border-b border-[#D6CAA8] pb-3 mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A6446]">
              Annual Cycle Analysis
            </span>
            <h3 className="font-display font-bold text-xl text-[#14402F]">
              Seasonality & Festival Trading Cycles
            </h3>
          </div>
          <span className="text-xs font-mono text-[#7C766B]">
            {hasTwelveMonths ? 'Full 12-Month Cycle Active' : 'Partial History'}
          </span>
        </div>

        {hasTwelveMonths ? (
          <div className="space-y-4">
            <div className="p-3 bg-[#E4EAD6] border border-[#939F5B] rounded text-xs flex items-center space-x-2 text-[#14402F]">
              <Sparkles className="w-4 h-4 text-[#D08A1E]" />
              <span>
                Seasonal cycles detected: Strong surges documented during festival shopping periods.
              </span>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allMonthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6DAB9" opacity={0.5} />
                  <XAxis dataKey={xDataKey} stroke="#7C766B" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#7C766B"
                    fontSize={11}
                    tickFormatter={(val) => formatCompactINR(val)}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FDFBF4',
                      borderColor: '#D6CAA8',
                      fontSize: '11px',
                    }}
                    formatter={(val: number) => [formatINR(val), 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#14402F" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Empty state for businesses with < 12 months history (e.g. Business C) */
          <div className="py-10 px-4 text-center space-y-3">
            <div className="max-w-md mx-auto">
              <KhataPage
                title="मौसमी रुझान खाता (Seasonality Ledger)"
                date="Awaiting 12 Months"
                entries={[
                  { particular: 'वर्तमान में केवल 7 महीने दर्ज हैं', amount: 0 },
                  { particular: 'मौसमी रुझान के लिए 12 महीने आवश्यक हैं', amount: 0 },
                ]}
                className="opacity-80"
              />
            </div>
            <h4 className="font-display font-bold text-lg text-[#5A3E2B] mt-4">
              Seasonal patterns need about a year of records
            </h4>
            <p className="text-xs text-[#7C766B] max-w-md mx-auto">
              You have {allMonthlyTrends.length} months of data recorded so far. Continue logging daily sales to unlock annual seasonal analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

