import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatINR } from '../../lib/formatCurrency';
import { useArthSetuStore } from '../../store/useArthSetuStore';

interface CloseBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  expectedCash: number;
}

export const CloseBookModal: React.FC<CloseBookModalProps> = ({
  isOpen,
  onClose,
  date,
  expectedCash,
}) => {
  const [countedCash, setCountedCash] = useState<string>(expectedCash.toString());
  const [reasonNote, setReasonNote] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const saveDiaryDay = useArthSetuStore((s) => s.saveDiaryDay);

  const numCounted = parseInt(countedCash || '0', 10);
  const difference = numCounted - expectedCash;

  const handleSubmit = () => {
    saveDiaryDay({
      date,
      cashSales: expectedCash,
      upiSales: 0,
      isOpen: true,
      cashInDrawerCounted: numCounted,
      notes: reasonNote ? `Close book note: ${reasonNote}` : undefined,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2B2620]"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-[#FDFBF4] border-2 border-[#14402F] rounded-lg p-5 max-w-sm w-full shadow-2xl z-10 select-none font-sans"
        >
          {submitted ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-[#2A6347] mx-auto animate-bounce" />
              <h3 className="font-display font-bold text-lg text-[#14402F]">
                गल्ला बंद · Book Closed
              </h3>
              <p className="text-xs text-[#7C766B]">
                Drawer cash reconciled and saved to daybook.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-[#D6CAA8] pb-2">
                <div>
                  <span className="text-[10px] font-mono text-[#D08A1E] uppercase font-bold">
                    Daily Drawer Reconciliation
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#14402F]">
                    Close Today's Book ({date})
                  </h3>
                </div>
                <button onClick={onClose} className="p-1 rounded text-[#7C766B]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#F8F1DE] p-3 rounded border border-[#D6CAA8] space-y-2 text-xs">
                <div className="flex justify-between text-[#5A3E2B]">
                  <span>Expected Cash (From Records):</span>
                  <span className="font-mono font-bold text-[#14402F]">
                    {formatINR(expectedCash)}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2B2620] mb-1">
                    Cash Actually Counted in Drawer (₹):
                  </label>
                  <input
                    type="number"
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-[#FDFBF4] border border-[#D6CAA8] font-mono text-base font-bold text-[#14402F] focus:outline-none focus:border-[#14402F]"
                  />
                </div>

                {/* Difference Indicator */}
                <div
                  className={`p-2 rounded text-xs flex items-center justify-between font-mono ${
                    difference === 0
                      ? 'bg-[#E4EAD6] text-[#2A6347]'
                      : 'bg-[#FDFBF4] border border-[#D6CAA8] text-[#5A3E2B]'
                  }`}
                >
                  <span className="font-sans">Difference from Expected:</span>
                  <span className="font-bold">
                    {difference > 0 ? `+${formatINR(difference)}` : formatINR(difference)}
                  </span>
                </div>
              </div>

              {difference !== 0 && (
                <div className="space-y-1">
                  <label className="block text-[11px] text-[#7C766B]">
                    Optional explanation (e.g. small change reserve, chai cash):
                  </label>
                  <input
                    type="text"
                    value={reasonNote}
                    onChange={(e) => setReasonNote(e.target.value)}
                    placeholder="e.g. ₹50 kept in drawer for morning coins"
                    className="w-full px-2.5 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs text-[#2B2620]"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2.5 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] transition-colors"
              >
                Confirm & Close Day's Register
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

