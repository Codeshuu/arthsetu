import React, { useState } from 'react';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { selectEvidenceBreakdown } from '../../selectors/evidenceSelectors';
import { selectActiveObservations } from '../../selectors/observationSelectors';
import { formatCompactINR, formatINR } from '../../lib/formatCurrency';
import { EvidenceRibbon } from '../../components/evidence/EvidenceRibbon';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import { ObservationCard } from '../../components/finance/ObservationCard';
import { Stamp } from '../../components/fragments/Stamp';
import { BankStatementStrip } from '../../components/fragments/BankRow';
import { UpiSlip } from '../../components/fragments/UpiSlip';
import { InvoiceSheet } from '../../components/fragments/InvoiceSheet';
import { ReceiptStub } from '../../components/fragments/CashNote';
import {
  FileText,
  ShieldCheck,
  Lock,
  ArrowRight,
  GitBranch,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const EvidenceCentrePage: React.FC = () => {
  const { t, language } = useI18n();
  const transactions = useArthSetuStore((s) => s.transactions);
  const sources = useArthSetuStore((s) => s.sources);
  const observations = useArthSetuStore((s) => s.observations);

  const evidenceSegments = selectEvidenceBreakdown(transactions);
  const activeObs = selectActiveObservations(observations);

  const [activeTab, setActiveTab] = useState<'shelf' | 'observations' | 'reconciliation'>('shelf');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const selectedSource = sources.find((s) => s.id === selectedSourceId);

  const getSegLabel = (cfg: any) => {
    if (language === 'hi') return cfg.labelHi;
    if (language === 'kn') return cfg.labelKn;
    if (language === 'ta') return cfg.labelTa;
    return cfg.labelEn;
  };

  const getSegDesc = (cfg: any) => {
    if (language === 'hi') return cfg.descriptionHi;
    if (language === 'kn') return cfg.descriptionKn;
    if (language === 'ta') return cfg.descriptionTa;
    return cfg.descriptionEn;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto font-sans select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('evidence.banner')}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
            {t('evidence.title')}
          </h1>
        </div>
        <div className="text-xs font-mono text-[#7C766B]">
          Story Beat ③: Every Number Traced
        </div>
      </div>

      {/* Top Large Evidence Ribbon Banner */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 sm:p-6 shadow-paper-elevated space-y-4 bg-khata-page">
        <div className="flex justify-between items-center border-b border-[#D6CAA8] pb-2">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#8A6446]">
              {t('evidence.ribbonHeader')}
            </span>
            <h3 className="font-display font-bold text-xl text-[#14402F]">
              {t('evidence.ribbonSubtitle')}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#14402F]">
            100% {t('evidence.ribbonPercent')}
          </span>
        </div>

        {/* Large 32px Ribbon */}
        <EvidenceRibbon segments={evidenceSegments} height={32} showLabels={true} />

        {/* Informative Definition Cards for the 5 Classes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {evidenceSegments.map((seg) => (
            <div
              key={seg.cls}
              className={`p-3 rounded border text-xs space-y-1 ${
                seg.cls === 'source_authenticated'
                  ? 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22]'
                  : 'bg-[#F8F1DE] text-[#2B2620] border-[#D6CAA8]'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-bold">
                <span className="flex items-center space-x-1">
                  {seg.cls === 'source_authenticated' && <Lock className="w-3.5 h-3.5 text-[#D08A1E]" />}
                  <span>{getSegLabel(seg.config)}</span>
                </span>
                <span>{seg.percentage}%</span>
              </div>
              <p
                className={`text-[11px] font-sans leading-relaxed ${
                  seg.cls === 'source_authenticated' ? 'text-[#B7C4A0]' : 'text-[#5A3E2B]'
                }`}
              >
                {getSegDesc(seg.config)}
              </p>
              <div className="text-[10px] font-mono pt-1 font-bold">
                Value: {formatINR(seg.amount)} ({seg.count} transactions)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs for Evidence Sub-views */}
      <div className="flex items-center space-x-2 border-b border-[#D6CAA8] text-xs font-mono font-bold">
        {[
          { id: 'shelf', label: `${t('evidence.tabShelf')} (${sources.length})` },
          { id: 'observations', label: `${t('evidence.tabObs')} (${activeObs.length})` },
          { id: 'reconciliation', label: t('evidence.tabRecon') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#14402F] text-[#14402F] bg-[#F8F1DE] font-bold'
                : 'border-transparent text-[#7C766B] hover:text-[#2B2620]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: The Physical Document Shelf */}
      {activeTab === 'shelf' && (
        <div className="space-y-6">
          <div className="text-xs text-[#5A3E2B]">
            {t('evidence.shelfDesc')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((src) => (
              <div
                key={src.id}
                onClick={() => setSelectedSourceId(src.id)}
                className="group relative bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-4 shadow-paper-elevated hover:shadow-2xl transition-all cursor-pointer overflow-hidden select-none"
              >
                {/* Stamp */}
                <div className="absolute top-2 right-2 pointer-events-none opacity-85 z-10">
                  <Stamp
                    variant="supplied_not_authenticated"
                    text={t('evidence.unverifiedStamp')}
                    rotation={-4}
                    animate={false}
                  />
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-[#8A6446] mb-2">
                  <FileText className="w-4 h-4 text-[#D08A1E]" />
                  <span className="uppercase font-bold">{src.type.replace('_', ' ')}</span>
                </div>

                <h4 className="font-display font-bold text-base text-[#14402F] truncate pr-14">
                  {src.fileName}
                </h4>

                <div className="my-3 py-2 border-y border-dashed border-[#D6CAA8] text-xs font-mono space-y-1 text-[#7C766B]">
                  <div className="flex justify-between">
                    <span>{t('evidence.rowsParsed')}:</span>
                    <span className="text-[#2B2620] font-bold">{src.rowCount} entries</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('evidence.accountTagLabel')}:</span>
                    <span className="uppercase text-[#14402F] font-bold">{src.accountTag}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('evidence.uploadedDate')}:</span>
                    <span className="text-[#2B2620]">{src.uploadedAt.split('T')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#14402F] group-hover:text-[#D08A1E] font-bold">
                  <span>{t('evidence.viewRows')}</span>
                  <span className="text-[10px] text-[#8A6446]">Unverified Source</span>
                </div>
              </div>
            ))}
          </div>

          {/* Expanded Document Modal / Preview */}
          {selectedSource && (
            <div className="p-5 bg-[#FDFBF4] border-2 border-[#14402F] rounded-lg shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-[#D6CAA8] pb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#D08A1E]">
                    Source Document Inspection
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#14402F]">
                    {selectedSource.fileName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSourceId(null)}
                  className="px-3 py-1 rounded bg-[#F8F1DE] text-xs font-bold font-mono"
                >
                  Close Preview ✕
                </button>
              </div>

              {selectedSource.type === 'bank_csv' ? (
                <BankStatementStrip bankName="Primary Operating Account (Parsed Strip)" />
              ) : selectedSource.type === 'upi_export' ? (
                <div className="flex justify-center p-4">
                  <UpiSlip amount={1450} sender="Customer QR Settlement Batch" />
                </div>
              ) : (
                <InvoiceSheet distributorName="Shree Ganesh Wholesale Distributors" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Grouped Observations Panel */}
      {activeTab === 'observations' && (
        <div className="space-y-4">
          <div className="text-xs text-[#5A3E2B]">
            {t('evidence.obsDesc')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {observations.map((obs) => (
              <ObservationCard key={obs.id} observation={obs} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Monthly Reconciliation View */}
      {activeTab === 'reconciliation' && (
        <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift space-y-4 bg-khata-page">
          <div className="border-b border-[#D6CAA8] pb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#8A6446]">
              {t('evidence.reconHeader')}
            </span>
            <h3 className="font-display font-bold text-xl text-[#14402F]">
              {t('evidence.reconTitle')}
            </h3>
            <p className="text-xs text-[#5A3E2B] mt-1 font-sans">
              {t('evidence.reconDesc')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-[#14402F] text-white">
                  <th className="p-2 text-left">{t('evidence.colMonth')}</th>
                  <th className="p-2 text-right">{t('evidence.colDeclared')}</th>
                  <th className="p-2 text-right">{t('evidence.colCredits')}</th>
                  <th className="p-2 text-right">{t('evidence.colDiff')}</th>
                  <th className="p-2 text-left">{t('evidence.colRemark')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6CAA8]/50">
                <tr className="hover:bg-[#F8F1DE]">
                  <td className="p-2 font-bold">October 2026</td>
                  <td className="p-2 text-right font-bold text-[#14402F]">₹1,18,400</td>
                  <td className="p-2 text-right font-bold text-[#14402F]">₹1,19,250</td>
                  <td className="p-2 text-right text-[#2A6347]">+₹850</td>
                  <td className="p-2 font-sans text-[11px] text-[#7C766B]">
                    Balanced within 1% margin · Normal settlement timing
                  </td>
                </tr>
                <tr className="hover:bg-[#F8F1DE]">
                  <td className="p-2 font-bold">September 2026</td>
                  <td className="p-2 text-right font-bold text-[#14402F]">₹1,12,400</td>
                  <td className="p-2 text-right font-bold text-[#14402F]">₹1,14,100</td>
                  <td className="p-2 text-right text-[#2A6347]">+₹1,700</td>
                  <td className="p-2 font-sans text-[11px] text-[#7C766B]">
                    Weekend QR settlement posted on October 1st
                  </td>
                </tr>
                <tr className="hover:bg-[#F8F1DE]">
                  <td className="p-2 font-bold">August 2026</td>
                  <td className="p-2 text-right font-bold text-[#14402F]">₹1,24,000</td>
                  <td className="p-2 text-right font-bold text-[#14402F]">₹1,23,800</td>
                  <td className="p-2 text-right text-[#B5532F]">-₹200</td>
                  <td className="p-2 font-sans text-[11px] text-[#7C766B]">
                    Negligible variance · Complete reconciliation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

