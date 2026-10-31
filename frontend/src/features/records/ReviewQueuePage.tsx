import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { formatINR } from '../../lib/formatCurrency';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import { TransactionCategory } from '../../services/types';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles, Building, User, HelpCircle, Undo2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReviewQueuePage: React.FC = () => {
  const { t } = useI18n();
  const transactions = useArthSetuStore((s) => s.transactions);
  const classifyTransaction = useArthSetuStore((s) => s.classifyTransaction);

  const pendingItems = transactions.filter(
    (t) => !t.classification.confirmed || t.category === 'unclassified'
  );

  const totalToReview = transactions.length;
  const reviewedCount = totalToReview - pendingItems.length;
  const [history, setHistory] = useState<{ id: string; prevCat: TransactionCategory }[]>([]);

  const currentItem = pendingItems[0];

  const handleDecision = (category: TransactionCategory) => {
    if (!currentItem) return;
    setHistory([...history, { id: currentItem.id, prevCat: currentItem.category }]);
    classifyTransaction(currentItem.id, category, true);

    if (pendingItems.length === 1) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    classifyTransaction(last.id, last.prevCat, false);
    setHistory(history.slice(0, -1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentItem) return;
      if (e.key === 'b' || e.key === 'B') handleDecision('business_income');
      if (e.key === 'p' || e.key === 'P') handleDecision('personal_transfer');
      if (e.key === 'u' || e.key === 'U') handleDecision('unclassified');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-2xl mx-auto font-sans select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-[#D6CAA8] pb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/app/records"
            className="p-1.5 rounded hover:bg-[#F8F1DE] text-[#14402F]"
            aria-label="Back to Records"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
              {t('review.badge', 'Classification Assistant')}
            </span>
            <h1 className="font-display text-2xl font-bold text-[#14402F]">
              {t('review.title', 'Review & Cleaning Queue')}
            </h1>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleUndo}
            className="flex items-center space-x-1 text-xs font-mono text-[#7C766B] hover:text-[#14402F] px-2 py-1 rounded border border-[#D6CAA8]"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono text-[#8A6446] mb-1.5 font-bold">
          <span>{t('review.progressLabel', 'PROGRESS')}</span>
          <span>
            {reviewedCount} / {totalToReview} ({pendingItems.length} {t('review.remainingLabel', 'remaining')})
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#E6DAB9] overflow-hidden p-0.5 border border-[#D6CAA8]">
          <div
            className="h-full rounded-full bg-[#14402F] transition-all duration-300"
            style={{ width: `${(reviewedCount / totalToReview) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Review Card */}
      {currentItem ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ scale: 0.96, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="bg-[#FDFBF4] border-2 border-[#14402F] rounded-lg p-6 sm:p-8 shadow-paper-elevated space-y-5 bg-khata-page"
          >
            {/* Top metadata */}
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#5A3E2B] font-bold">
                {currentItem.date} · {currentItem.channel.toUpperCase()}
              </span>
              <EvidenceChip evidenceClass={currentItem.evidence.class} size="sm" />
            </div>

            {/* Description & Amount */}
            <div className="text-center py-4">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2B2620]">
                {currentItem.description}
              </h3>
              <div
                className={`font-display text-4xl sm:text-5xl font-bold mt-2 tabular-nums ${
                  currentItem.direction === 'in' ? 'text-[#14402F]' : 'text-[#B5532F]'
                }`}
              >
                {currentItem.direction === 'in' ? '+' : '-'}
                {formatINR(currentItem.amount)}
              </div>
            </div>

            {/* Suggestion Reason Callout */}
            {currentItem.classification.reason && (
              <div className="p-3 rounded bg-[#E4EAD6] border border-[#939F5B] text-xs">
                <div className="flex items-center space-x-1.5 text-[#14402F] font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#D08A1E]" />
                  <span>{t('review.suggestionLabel', 'ArthSetu Classification Suggestion')}:</span>
                </div>
                <p className="text-[#14402F] mt-1 font-sans font-medium">
                  "{currentItem.classification.reason}"
                </p>
              </div>
            )}

            {/* Decision Buttons */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    handleDecision(
                      currentItem.direction === 'in' ? 'business_income' : 'inventory_purchase'
                    )
                  }
                  className="p-3.5 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow"
                >
                  <Building className="w-4 h-4 text-[#D08A1E]" />
                  <span>{t('review.markBizBtn', 'Mark as Business (B)')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('personal_transfer')}
                  className="p-3.5 rounded bg-[#8A6446] text-[#FDFBF4] text-xs font-bold hover:bg-[#5A3E2B] flex items-center justify-center space-x-2 transition-transform active:scale-95 shadow"
                >
                  <User className="w-4 h-4 text-[#E8D6A3]" />
                  <span>{t('review.markPersonalBtn', 'Mark as Personal (P)')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleDecision('unclassified')}
                className="w-full py-2.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-bold text-[#5A3E2B] hover:bg-[#E6DAB9] flex items-center justify-center space-x-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t('review.notSureBtn', 'Not Sure / Leave for Later (U)')}</span>
              </button>
            </div>

            {/* Desktop Keyboard helper */}
            <div className="text-center text-[11px] font-mono text-[#7C766B] pt-2 border-t border-[#D6CAA8]/60 hidden sm:block">
              {t('review.shortcutsNotice', 'Shortcuts: Press B for Business · P for Personal · U for Not Sure')}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-lg p-10 text-center space-y-3 shadow-paper-lift bg-khata-page">
          <div className="w-12 h-12 rounded-full bg-[#E4EAD6] text-[#2A6347] flex items-center justify-center mx-auto shadow-sm">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-2xl text-[#14402F]">
            {t('review.allDoneTitle', 'All Transactions Reviewed!')}
          </h3>
          <p className="text-xs text-[#5A3E2B] max-w-sm mx-auto leading-relaxed">
            {t('review.allDoneDesc', 'Your Financial Record Completeness has significantly improved. Head to the dashboard to see your updated Four Dimensions.')}
          </p>
          <div className="pt-2">
            <Link
              to="/app"
              className="inline-block px-5 py-2.5 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] shadow-xs"
            >
              {t('review.returnDashboard', 'View Updated Dashboard')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
