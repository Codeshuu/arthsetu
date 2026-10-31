import React, { useState } from 'react';
import { HelpCircle, ExternalLink, Info } from 'lucide-react';
import { MoneyFigure } from './MoneyFigure';
import { EvidenceChip } from '../evidence/EvidenceChip';
import { EvidenceRibbon } from '../evidence/EvidenceRibbon';
import { EvidenceThreadDrawer } from '../evidence/EvidenceThreadDrawer';
import { EvidenceClass } from '../../services/types';
import { EvidenceSegment } from '../../selectors/evidenceSelectors';
import { formatCompactINR } from '../../lib/formatCurrency';
import { useI18n } from '../../i18n/i18nContext';

interface StatementBlockProps {
  sales: number;
  spending: number;
  netCashMovement: number;
  cashSales: number;
  digitalSales: number;
  expectedDays: number;
  recordedDays: number;
  coveragePercent: number;
  evidenceSegments: EvidenceSegment[];
  className?: string;
}

export const StatementBlock: React.FC<StatementBlockProps> = ({
  sales,
  spending,
  netCashMovement,
  cashSales,
  digitalSales,
  expectedDays,
  recordedDays,
  coveragePercent,
  evidenceSegments,
  className = '',
}) => {
  const { t, language } = useI18n();

  const [activeTrace, setActiveTrace] = useState<{
    name: string;
    amount: number;
    cls: EvidenceClass;
    category?: string;
  } | null>(null);

  const [showProfitNote, setShowProfitNote] = useState(false);

  const totalSales = cashSales + digitalSales;
  const cashShare = totalSales > 0 ? Math.round((cashSales / totalSales) * 100) : 50;
  const digitalShare = 100 - cashShare;

  return (
    <div
      className={`bg-[#FDFBF4] border border-[#D6CAA8] rounded-md shadow-paper-elevated p-5 sm:p-7 relative overflow-hidden bg-khata-page ${className}`}
    >
      {/* Red vertical khata margin decoration on desktop */}
      <div className="flex justify-between items-start border-b border-[#D6CAA8] pb-3 mb-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            ॥ बही-खाता वित्तीय सारांश ॥
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
            {t('dashboard.statementHero')}
          </h2>
        </div>
        <div className="text-right text-xs font-mono text-[#8A6446]">
          <span>Observation: 2025–2026</span>
        </div>
      </div>

      {/* Ruled Statement Rows */}
      <div className="space-y-4">
        {/* Row 1: Recorded Sales */}
        <div className="p-3 rounded bg-[#F8F1DE]/70 border border-[#D6CAA8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-[#2B2620]">
                {t('dashboard.recordedSales')}
              </span>
              <EvidenceChip evidenceClass="document_supplied" size="sm" />
              <button
                onClick={() =>
                  setActiveTrace({
                    name: 'Recorded Business Sales',
                    amount: sales,
                    cls: 'document_supplied',
                    category: 'business_income',
                  })
                }
                className="text-[#7A5A16] hover:text-[#D08A1E] text-xs flex items-center space-x-0.5 underline font-mono"
                title="Inspect evidence trail"
              >
                <span>Trace</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            {/* Inline Cash / UPI split bar */}
            <div className="mt-2 flex items-center space-x-3 text-xs font-mono text-[#5A3E2B]">
              <div className="w-40 h-2 rounded bg-[#D6CAA8] flex overflow-hidden">
                <div style={{ width: `${cashShare}%` }} className="bg-[#8A6446] h-full" title={`Cash: ${cashShare}%`} />
                <div style={{ width: `${digitalShare}%` }} className="bg-[#6B7A3A] h-full" title={`Digital: ${digitalShare}%`} />
              </div>
              <span className="text-[11px]">
                {cashShare}% Cash ({formatCompactINR(cashSales)}) · {digitalShare}% UPI ({formatCompactINR(digitalSales)})
              </span>
            </div>
          </div>
          <div className="text-right">
            <MoneyFigure amount={sales} className="text-2xl sm:text-3xl text-[#14402F]" />
          </div>
        </div>

        {/* Row 2: Recorded Spending */}
        <div className="p-3 rounded bg-[#F8F1DE]/70 border border-[#D6CAA8]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-[#2B2620]">
                {t('dashboard.recordedSpending')}
              </span>
              <EvidenceChip evidenceClass="document_supplied" size="sm" />
              <button
                onClick={() =>
                  setActiveTrace({
                    name: 'Recorded Spending & Purchases',
                    amount: spending,
                    cls: 'document_supplied',
                  })
                }
                className="text-[#7A5A16] hover:text-[#D08A1E] text-xs flex items-center space-x-0.5 underline font-mono"
              >
                <span>Trace</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="text-xs text-[#7C766B] mt-1 font-sans">
              Inventory stock, shop rent, electricity & operating expenses
            </div>
          </div>
          <div className="text-right">
            <MoneyFigure amount={spending} className="text-2xl sm:text-3xl text-[#B5532F]" />
          </div>
        </div>

        {/* Row 3: Net Recorded Cash Movement */}
        <div className="p-3 rounded bg-[#E4EAD6]/40 border border-[#939F5B]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#14402F]">
                {t('dashboard.netCashMovement')}
              </span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfitNote(!showProfitNote)}
                  className="text-[#6B7A3A] hover:text-[#14402F] p-0.5"
                  title="Important financial disclaimer"
                >
                  <Info className="w-4 h-4" />
                </button>
                {showProfitNote && (
                  <div className="absolute left-0 bottom-6 w-64 bg-[#2B2620] text-[#FDFBF4] text-[11px] p-2.5 rounded shadow-lg z-20 font-sans leading-relaxed">
                    {t('dashboard.notProfit')}
                    <div className="mt-1 text-[#D08A1E] text-[10px] font-mono">
                      (Tap icon to dismiss)
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-[11px] font-mono text-[#6B7A3A] mt-0.5">
              Recorded Inflow minus Recorded Outflow (Not Profit)
            </div>
          </div>
          <div className="text-right">
            <MoneyFigure
              amount={netCashMovement}
              showSign
              className={`text-2xl sm:text-3xl ${
                netCashMovement >= 0 ? 'text-[#14402F]' : 'text-[#B5532F]'
              }`}
            />
          </div>
        </div>

        {/* Row 4: Continuity strip info */}
        <div className="flex justify-between items-center text-xs p-2.5 rounded bg-[#F8F1DE]/50 border border-[#D6CAA8]/40 font-mono">
          <span className="text-[#5A3E2B]">{t('dashboard.daysRecorded')}:</span>
          <span className="font-bold text-[#14402F]">
            {recordedDays} / {expectedDays} days ({coveragePercent}%)
          </span>
        </div>
      </div>

      {/* Evidence Ribbon Across the Statement */}
      <div className="mt-6 pt-4 border-t border-[#D6CAA8]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-[#2B2620] uppercase font-mono tracking-wide">
            {t('dashboard.evidenceRibbonTitle', 'Evidence Breakdown Across Recorded Rupee Value')}
          </span>
          <span className="text-[11px] text-[#7C766B] font-mono">
            Mix across all ₹ value
          </span>
        </div>
        <EvidenceRibbon segments={evidenceSegments} height={20} showLabels={true} />
      </div>

      {/* Drawer */}
      {activeTrace && (
        <EvidenceThreadDrawer
          isOpen={true}
          onClose={() => setActiveTrace(null)}
          figureName={activeTrace.name}
          figureAmount={activeTrace.amount}
          evidenceClass={activeTrace.cls}
          filterCategory={activeTrace.category}
        />
      )}
    </div>
  );
};

