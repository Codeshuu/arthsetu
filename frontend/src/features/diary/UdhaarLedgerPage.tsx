import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { formatINR } from '../../lib/formatCurrency';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import { ArrowLeft, Plus, CheckCircle, Clock } from 'lucide-react';

export const UdhaarLedgerPage: React.FC = () => {
  const { t, language } = useI18n();
  const udhaarList = useArthSetuStore((s) => s.udhaar);
  const addUdhaar = useArthSetuStore((s) => s.addUdhaar);
  const settleUdhaar = useArthSetuStore((s) => s.settleUdhaar);

  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [settleTarget, setSettleTarget] = useState<{ id: string; name: string; amount: number } | null>(null);
  const [settleAmount, setSettleAmount] = useState('');

  const openList = udhaarList.filter((u) => u.status !== 'settled');
  const settledList = udhaarList.filter((u) => u.status === 'settled');

  const totalOutstanding = openList.reduce((sum, u) => {
    const settled = u.settlements.reduce((s, curr) => s + curr.amount, 0);
    return sum + (u.amount - settled);
  }, 0);

  const handleAddUdhaar = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount, 10);
    if (!customerName || isNaN(num) || num <= 0) return;

    addUdhaar({
      customerLabel: customerName,
      amount: num,
      givenOn: new Date().toISOString().split('T')[0],
    });

    setCustomerName('');
    setAmount('');
    setIsAddOpen(false);
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(settleAmount, 10);
    if (!settleTarget || isNaN(num) || num <= 0) return;

    settleUdhaar(settleTarget.id, num);
    setSettleTarget(null);
    setSettleAmount('');
  };

  const getAgeingChip = (givenOn: string) => {
    const d = new Date(givenOn);
    const now = new Date('2026-10-31');
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 7) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E4EAD6] text-[#2A6347] font-bold">
          {t('udhaar.ageing0_7', '0–7 Days')}
        </span>
      );
    }
    if (diffDays <= 30) {
      return (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F1DE] text-[#D08A1E] font-bold">
          {t('udhaar.ageing8_30', '8–30 Days')}
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8C3B0] text-[#B5532F] font-bold">
        {t('udhaar.ageing30Plus', '30+ Days')}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto font-sans"
    >
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/app/diary"
            className="p-1.5 rounded hover:bg-[#F8F1DE] text-[#14402F]"
            aria-label="Back to Diary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
              {t('udhaar.banner', '॥ ग्राहक उधारी खाता ॥')}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
              {t('udhaar.title', 'Udhaar (Credit) Ledger')}
            </h1>
          </div>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] transition-colors self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#D08A1E]" />
          <span>{t('udhaar.newCreditBtn', '+ Record New Credit')}</span>
        </button>
      </div>

      {/* Accounting Banner: Not Counted as Received Revenue */}
      <div className="p-4 rounded bg-[#F8F1DE] border border-[#D6CAA8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-paper-lift">
        <div>
          <div className="text-[11px] text-[#7C766B] uppercase font-bold">
            {t('udhaar.accountingNoticeTitle', 'Sales on credit, not yet received')}
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-[#14402F] mt-0.5">
            {formatINR(totalOutstanding)}
          </div>
          <div className="text-[11px] text-[#8A6446] font-sans mt-0.5">
            {t('udhaar.accountingNoticeDesc', 'In accordance with transparent accounting, outstanding credit is declared separately and never inflated into bank-received revenue.')}
          </div>
        </div>
        <div>
          <EvidenceChip evidenceClass="owner_declared" />
        </div>
      </div>

      {/* Add Udhaar Form Modal */}
      {isAddOpen && (
        <form
          onSubmit={handleAddUdhaar}
          className="p-4 sm:p-5 bg-[#FDFBF4] border-2 border-[#14402F] rounded-md shadow-paper-elevated space-y-3 bg-khata-page"
        >
          <div className="font-display font-bold text-base text-[#14402F]">
            {t('udhaar.newCreditBtn', 'New Credit Given')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2B2620] mb-1">
                {t('udhaar.customerCol', 'Customer Anonymous Nickname')}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Masterji Tailor, Kulkarni Sir"
                className="w-full px-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs focus:outline-none focus:border-[#14402F]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2B2620] mb-1">
                {t('udhaar.amountCol', 'Amount (₹)')}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono focus:outline-none focus:border-[#14402F]"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-3 py-1 text-xs text-[#7C766B]"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#14402F] text-white text-xs font-bold hover:bg-[#0F2E22]"
            >
              {t('common.save', 'Save Credit Entry')}
            </button>
          </div>
        </form>
      )}

      {/* Settle Modal */}
      {settleTarget && (
        <form
          onSubmit={handleConfirmSettle}
          className="p-4 sm:p-5 bg-[#FDFBF4] border-2 border-[#14402F] rounded-md shadow-paper-elevated space-y-3 bg-khata-page"
        >
          <div className="font-display font-bold text-base text-[#14402F]">
            {t('udhaar.settleModalTitle', 'Record Credit Settlement')} — {settleTarget.name}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2B2620] mb-1">
              {t('udhaar.settleAmountLabel', 'Amount Collected (₹)')}
            </label>
            <input
              type="number"
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              placeholder={`Max ${settleTarget.amount}`}
              className="w-full px-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono focus:outline-none focus:border-[#14402F]"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setSettleTarget(null)}
              className="px-3 py-1 text-xs text-[#7C766B]"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#14402F] text-white text-xs font-bold hover:bg-[#0F2E22]"
            >
              {t('udhaar.settleConfirmBtn', 'Record Settlement')}
            </button>
          </div>
        </form>
      )}

      {/* Customer Credit List */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-5 shadow-paper-lift bg-khata-page space-y-3">
        <h3 className="font-display font-bold text-lg text-[#14402F] pb-2 border-b border-[#D6CAA8]">
          {t('udhaar.activeCreditsTitle', 'Active Customer Credit Accounts')} ({openList.length})
        </h3>

        {openList.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7C766B]">
            {t('udhaar.noCreditsTitle', 'All customer credit accounts are fully settled.')}
          </div>
        ) : (
          <div className="divide-y divide-[#D6CAA8]/60">
            {openList.map((udh) => {
              const totalSettled = udh.settlements.reduce((s, curr) => s + curr.amount, 0);
              const remaining = udh.amount - totalSettled;

              return (
                <div
                  key={udh.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-[#2B2620]">
                        {udh.customerLabel}
                      </span>
                      {getAgeingChip(udh.givenOn)}
                    </div>
                    <div className="text-[11px] text-[#7C766B] font-mono mt-0.5">
                      {t('udhaar.givenOnCol', 'Given on')}: {udh.givenOn} · {t('common.all', 'Total')}: {formatINR(udh.amount)}
                      {totalSettled > 0 && ` · Settled: ${formatINR(totalSettled)}`}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-sm text-[#B5532F]">
                      {formatINR(remaining)}
                    </span>
                    <button
                      onClick={() => {
                        setSettleTarget({ id: udh.id, name: udh.customerLabel, amount: remaining });
                        setSettleAmount(remaining.toString());
                      }}
                      className="px-2.5 py-1 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono font-bold text-[#14402F] hover:bg-[#E6DAB9] transition-colors"
                    >
                      {t('udhaar.settleBtn', 'Settle')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
