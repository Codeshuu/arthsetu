import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Split, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { Transaction, TransactionCategory } from '../../services/types';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { formatINR } from '../../lib/formatCurrency';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onOpenTrace: (t: Transaction) => void;
}

const CATEGORY_OPTIONS: { id: TransactionCategory; label: string }[] = [
  { id: 'business_income', label: 'Business Income (बिक्री आवक)' },
  { id: 'inventory_purchase', label: 'Inventory / Wholesale Stock (माल खरीद)' },
  { id: 'operating_expense', label: 'Operating Expense (दुकान खर्च)' },
  { id: 'supplier_payment', label: 'Supplier Payment (सप्लायर भुगतान)' },
  { id: 'personal_transfer', label: 'Personal Transfer (व्यक्तिगत खर्च)' },
  { id: 'refund', label: 'Customer Refund (रिफंड)' },
  { id: 'unclassified', label: 'Unclassified (अवर्गीकृत)' },
];

export const TransactionDrawer: React.FC<TransactionDrawerProps> = ({
  transaction,
  onClose,
  onOpenTrace,
}) => {
  const classifyTransaction = useArthSetuStore((s) => s.classifyTransaction);
  const splitTransaction = useArthSetuStore((s) => s.splitTransaction);

  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>(
    transaction?.category || 'unclassified'
  );
  const [splitMode, setSplitMode] = useState(false);
  const [splitBizAmount, setSplitBizAmount] = useState<string>('');
  const [splitPersonalAmount, setSplitPersonalAmount] = useState<string>('');

  if (!transaction) return null;

  const handleApplyClassification = (cat: TransactionCategory) => {
    setSelectedCategory(cat);
    classifyTransaction(transaction.id, cat, true);
  };

  const handleApplySplit = (e: React.FormEvent) => {
    e.preventDefault();
    const bAmt = parseFloat(splitBizAmount);
    const pAmt = parseFloat(splitPersonalAmount);
    if (isNaN(bAmt) || isNaN(pAmt) || bAmt + pAmt !== transaction.amount) {
      alert(`Split amounts must equal total transaction amount (${formatINR(transaction.amount)})`);
      return;
    }

    splitTransaction(transaction.id, [
      { amount: bAmt, category: 'business_income', description: 'Business portion of mixed deposit' },
      { amount: pAmt, category: 'personal_transfer', description: 'Personal portion of mixed deposit' },
    ]);
    setSplitMode(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2B2620]"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md bg-[#FDFBF4] border-l border-[#D6CAA8] shadow-2xl h-full flex flex-col justify-between z-10 select-none font-sans"
        >
          {/* Header */}
          <div className="bg-[#14402F] text-[#FDFBF4] p-4 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-mono text-[#D08A1E] uppercase font-bold">
                Transaction Detail
              </span>
              <h3 className="font-display font-bold text-lg">
                {transaction.description}
              </h3>
            </div>
            <button onClick={onClose} className="p-1 rounded text-[#FDFBF4]/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex-1 overflow-y-auto space-y-5 bg-khata-page">
            {/* Amount Banner */}
            <div className="p-4 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-center">
              <div className="text-xs font-mono text-[#7C766B]">Transaction Amount</div>
              <div
                className={`font-display text-3xl font-bold my-1 ${
                  transaction.direction === 'in' ? 'text-[#14402F]' : 'text-[#B5532F]'
                }`}
              >
                {transaction.direction === 'in' ? '+' : '-'}
                {formatINR(transaction.amount)}
              </div>
              <div className="mt-1 flex justify-center">
                <EvidenceChip evidenceClass={transaction.evidence.class} />
              </div>
            </div>

            {/* Core Metadata */}
            <div className="bg-[#FDFBF4] p-3.5 rounded border border-[#D6CAA8] text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-[#D6CAA8]/50 pb-1">
                <span className="text-[#7C766B]">Date:</span>
                <span className="text-[#2B2620] font-bold">{transaction.date}</span>
              </div>
              <div className="flex justify-between border-b border-[#D6CAA8]/50 pb-1">
                <span className="text-[#7C766B]">Payment Channel:</span>
                <span className="uppercase text-[#14402F] font-bold">{transaction.channel}</span>
              </div>
              <div className="flex justify-between border-b border-[#D6CAA8]/50 pb-1">
                <span className="text-[#7C766B]">Account Tag:</span>
                <span className="uppercase text-[#8A6446]">{transaction.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7C766B]">Status:</span>
                <span className="text-[#2A6347] font-bold">
                  {transaction.classification.confirmed ? 'Confirmed by You' : 'Suggested (Needs Confirm)'}
                </span>
              </div>
            </div>

            {/* Classification Suggestion Reason */}
            {transaction.classification.reason && (
              <div className="p-3 rounded bg-[#E4EAD6]/50 border border-[#939F5B]/50 text-xs">
                <div className="text-[10px] font-mono font-bold uppercase text-[#2A6347]">
                  ArthSetu Suggestion Note
                </div>
                <div className="text-[#14402F] mt-0.5 font-sans">
                  "{transaction.classification.reason}"
                </div>
              </div>
            )}

            {/* Classification Controls */}
            {!splitMode ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#2B2620] font-mono">
                    CLASSIFY THIS RECORD:
                  </label>
                  <button
                    onClick={() => {
                      setSplitMode(true);
                      setSplitBizAmount((transaction.amount * 0.7).toFixed(0));
                      setSplitPersonalAmount((transaction.amount * 0.3).toFixed(0));
                    }}
                    className="text-xs text-[#7A5A16] font-bold flex items-center space-x-1 hover:underline font-mono"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split (Mixed Record)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleApplyClassification(opt.id)}
                      className={`px-3 py-2 rounded text-left text-xs font-medium border flex items-center justify-between transition-all ${
                        transaction.category === opt.id
                          ? 'bg-[#14402F] text-[#FDFBF4] border-[#0F2E22] font-bold'
                          : 'bg-[#F8F1DE] text-[#2B2620] border-[#D6CAA8] hover:bg-[#E6DAB9]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {transaction.category === opt.id && <Check className="w-4 h-4 text-[#D08A1E]" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Split Form */
              <form onSubmit={handleApplySplit} className="p-3 bg-[#F8F1DE] rounded border border-[#D6CAA8] space-y-3 text-xs">
                <div className="font-bold text-[#14402F] flex justify-between items-center">
                  <span>Split Mixed Amount</span>
                  <button type="button" onClick={() => setSplitMode(false)} className="text-[11px] text-[#7C766B]">
                    Cancel
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] text-[#2B2620] mb-1">Business Portion (₹)</label>
                  <input
                    type="number"
                    value={splitBizAmount}
                    onChange={(e) => setSplitBizAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D6CAA8] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#2B2620] mb-1">Personal Portion (₹)</label>
                  <input
                    type="number"
                    value={splitPersonalAmount}
                    onChange={(e) => setSplitPersonalAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded bg-white border border-[#D6CAA8] font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded bg-[#14402F] text-white font-bold text-xs"
                >
                  Save Split Transactions
                </button>
              </form>
            )}

            {/* Evidence Thread trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenTrace(transaction)}
                className="w-full py-2.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-bold text-[#14402F] hover:bg-[#E6DAB9] flex items-center justify-center space-x-1.5 transition-colors font-mono"
              >
                <span>View Full Evidence Bridge</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#D08A1E]" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#F8F1DE] border-t border-[#D6CAA8] text-center text-[11px] font-mono text-[#7C766B]">
            All changes update the 4 Dimensions & Evidence Ribbon instantly
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

