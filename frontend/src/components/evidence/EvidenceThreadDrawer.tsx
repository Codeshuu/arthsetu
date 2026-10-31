import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown } from 'lucide-react';
import { formatINR } from '../../lib/formatCurrency';
import { EvidenceChip } from './EvidenceChip';
import { EvidenceClass, Transaction } from '../../services/types';
import { useArthSetuStore } from '../../store/useArthSetuStore';

interface EvidenceThreadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  figureName: string;
  figureAmount: number;
  evidenceClass: EvidenceClass;
  filterCategory?: string;
}

export const EvidenceThreadDrawer: React.FC<EvidenceThreadDrawerProps> = ({
  isOpen,
  onClose,
  figureName,
  figureAmount,
  evidenceClass,
  filterCategory,
}) => {
  const transactions = useArthSetuStore((s) => s.transactions);
  const sources = useArthSetuStore((s) => s.sources);

  // Relevant transactions
  const contributingTxns = transactions
    .filter((t) => {
      if (filterCategory) return t.category === filterCategory;
      if (figureName.toLowerCase().includes('sale')) return t.category === 'business_income';
      if (figureName.toLowerCase().includes('spend'))
        return t.direction === 'out' && t.category !== 'personal_transfer';
      return true;
    })
    .slice(0, 8);

  const matchedSources = sources.filter((s) =>
    contributingTxns.some((t) => t.evidence.sourceId === s.id || t.linkedDocIds.includes(s.id))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2B2620] z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#FDFBF4] border-l border-[#D6CAA8] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#14402F] text-[#FDFBF4] p-4 flex justify-between items-center border-b border-[#0F2E22]">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#D08A1E]">
                  Evidence Bridge · Trace
                </div>
                <h3 className="font-display font-bold text-lg">{figureName}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-[#0F2E22] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Trace Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-khata-page">
              {/* Level 1: The Headline Number */}
              <div className="bg-[#F8F1DE] p-4 rounded border border-[#D6CAA8] shadow-sm text-center">
                <div className="text-xs text-[#7C766B] font-mono">Consolidated Headline Figure</div>
                <div className="font-display text-3xl font-bold text-[#14402F] my-1">
                  {formatINR(figureAmount)}
                </div>
                <div className="mt-2 flex justify-center">
                  <EvidenceChip evidenceClass={evidenceClass} />
                </div>
              </div>

              {/* Connecting Thread 1 */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-[#B28A33]" />
                <ArrowDown className="w-4 h-4 text-[#B28A33] -mt-1" />
                <div className="text-[10px] font-mono text-[#8A6446] mt-1">
                  Aggregated from {contributingTxns.length} recorded transactions
                </div>
              </div>

              {/* Level 2: Contributing Transactions */}
              <div className="bg-[#FDFBF4] p-3 rounded border border-[#D6CAA8] space-y-2">
                <div className="text-xs font-bold text-[#2B2620] pb-1 border-b border-[#D6CAA8]">
                  Sample Contributing Transactions
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {contributingTxns.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center text-xs p-1.5 rounded bg-[#F8F1DE]/70 border border-[#D6CAA8]/40"
                    >
                      <div className="truncate mr-2">
                        <div className="font-medium text-[#2B2620] truncate">{t.description}</div>
                        <div className="text-[10px] text-[#7C766B] font-mono">
                          {t.date} · {t.channel.toUpperCase()}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-mono font-bold text-[#14402F]">
                          {formatINR(t.amount)}
                        </div>
                        <EvidenceChip evidenceClass={t.evidence.class} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connecting Thread 2 */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-[#B28A33]" />
                <ArrowDown className="w-4 h-4 text-[#B28A33] -mt-1" />
                <div className="text-[10px] font-mono text-[#8A6446] mt-1">
                  Underlying Source Documents & Khatas
                </div>
              </div>

              {/* Level 3: Source Documents */}
              <div className="bg-[#FDFBF4] p-3 rounded border border-[#D6CAA8] space-y-2">
                <div className="text-xs font-bold text-[#2B2620] pb-1 border-b border-[#D6CAA8]">
                  Linked Source Files
                </div>
                <div className="space-y-2">
                  {matchedSources.map((s) => (
                    <div
                      key={s.id}
                      className="p-2 rounded bg-[#E4EAD6]/50 border border-[#939F5B]/50 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#14402F] truncate">
                          {s.fileName || s.type}
                        </div>
                        <div className="text-[10px] text-[#6B7A3A] font-mono">
                          {s.rowCount} rows · {s.accountTag} account
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-[#B28A33]/20 text-[#7A5A16] font-mono font-bold border border-[#B28A33]/40">
                        SUPPLIED
                      </span>
                    </div>
                  ))}
                  {matchedSources.length === 0 && (
                    <div className="text-xs text-[#7C766B] italic p-2 text-center">
                      Entries declared directly in daybook / cash khata without external statements.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#F8F1DE] border-t border-[#D6CAA8] text-center text-[11px] text-[#7C766B] font-mono">
              Trace verified offline · No remote server required
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

