import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { QuickEntrySheet, DiaryEntryType } from './QuickEntrySheet';
import { CloseBookModal } from './CloseBookModal';
import { formatINR } from '../../lib/formatCurrency';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import {
  ChevronLeft,
  ChevronRight,
  Coins,
  QrCode,
  Package,
  Receipt,
  Users,
  CreditCard,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const DiaryPage: React.FC = () => {
  const { t, language } = useI18n();
  const transactions = useArthSetuStore((s) => s.transactions);
  const diaryDays = useArthSetuStore((s) => s.diaryDays);
  const saveDiaryDay = useArthSetuStore((s) => s.saveDiaryDay);

  const [selectedDate, setSelectedDate] = useState<string>('2026-10-31');
  const [activeSheetType, setActiveSheetType] = useState<DiaryEntryType | null>(null);
  const [closeBookOpen, setCloseBookOpen] = useState<boolean>(false);

  // Filter transactions for this day
  const dayTxns = transactions.filter((t) => t.date === selectedDate);
  const currentDayRecord = diaryDays.find((d) => d.date === selectedDate);
  const isShopClosed = currentDayRecord ? !currentDayRecord.isOpen : false;

  const totalInflow = dayTxns
    .filter((t) => t.direction === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = dayTxns
    .filter((t) => t.direction === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  const netDay = totalInflow - totalOutflow;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToggleShopClosed = () => {
    saveDiaryDay({
      date: selectedDate,
      cashSales: 0,
      upiSales: 0,
      isOpen: !isShopClosed,
      notes: !isShopClosed ? 'Shop closed on merchant holiday' : undefined,
    });
  };

  const getTileLabel = (type: DiaryEntryType) => {
    switch (type) {
      case 'cash_sale':
        return t('diary.cashSale', 'Cash Sale');
      case 'upi_sale':
        return t('diary.upiSale', 'UPI Sale');
      case 'stock_bought':
        return t('diary.stockBought', 'Stock Bought');
      case 'expense':
        return t('diary.expense', 'Daily Expense');
      case 'paid_supplier':
        return t('diary.paidSupplier', 'Paid Supplier');
      case 'credit_given':
        return t('diary.creditGiven', 'Credit Given (Udhaar)');
      case 'credit_received':
        return t('diary.creditReceived', 'Credit Collected');
    }
  };

  const getInflowLabel = (type: DiaryEntryType) => {
    const isIn = type.includes('sale') || type === 'credit_received';
    if (language === 'hi') return isIn ? '+ आवक' : '- जावक';
    if (language === 'kn') return isIn ? '+ ಒಳಹರಿವು' : '- ಹೊರಹರಿವು';
    if (language === 'ta') return isIn ? '+ வரவு' : '- செலவு';
    return isIn ? '+ Inflow' : '- Outflow';
  };

  const quickTiles: {
    type: DiaryEntryType;
    icon: any;
    color: string;
  }[] = [
    { type: 'cash_sale', icon: Coins, color: '#14402F' },
    { type: 'upi_sale', icon: QrCode, color: '#6B7A3A' },
    { type: 'stock_bought', icon: Package, color: '#B5532F' },
    { type: 'expense', icon: Receipt, color: '#8A6446' },
    { type: 'paid_supplier', icon: Users, color: '#7A5A16' },
    { type: 'credit_given', icon: CreditCard, color: '#B5532F' },
    { type: 'credit_received', icon: CheckCircle2, color: '#14402F' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans"
    >
      {/* Top Header & Day Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('diary.banner', '॥ बही-खाता रोजनामचा ॥')}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
            {t('diary.title', 'Financial Diary (Daybook)')}
          </h1>
        </div>

        {/* Date Selector with Next/Prev and Closed toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded bg-[#FDFBF4] border border-[#D6CAA8] p-1 font-mono text-xs shadow-xs">
            <button
              onClick={handlePrevDay}
              className="p-1 text-[#7C766B] hover:text-[#14402F] rounded"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-bold text-[#14402F] px-2 focus:outline-none"
            />
            <button
              onClick={handleNextDay}
              className="p-1 text-[#7C766B] hover:text-[#14402F] rounded"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToggleShopClosed}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
              isShopClosed
                ? 'bg-[#B5532F] text-white border-[#8A6446]'
                : 'bg-[#F8F1DE] text-[#5A3E2B] border-[#D6CAA8] hover:bg-[#E6DAB9]'
            }`}
          >
            {isShopClosed ? t('diary.closedDayNotice', '✓ Documented Closed Day') : t('diary.shopClosed', 'Shop Closed Today')}
          </button>

          <Link
            to="/app/diary/udhaar"
            className="px-3 py-1.5 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold hover:bg-[#0F2E22] transition-colors font-mono shadow-xs"
          >
            {t('diary.udhaarLedger', 'Udhaar (Credit) Ledger')} →
          </Link>
        </div>
      </div>

      {/* Quick Entry Action Tiles */}
      {!isShopClosed && (
        <div>
          <div className="text-xs font-mono font-bold uppercase text-[#8A6446] mb-2 flex justify-between items-center">
            <span>{t('diary.quickRecord', 'Quick Record Entries')}</span>
            <span className="text-[10px] text-[#7C766B]">{t('diary.quickRecordSub', 'Tap any tile to record')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {quickTiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.type}
                  type="button"
                  onClick={() => setActiveSheetType(tile.type)}
                  className="p-3 rounded-md bg-[#FDFBF4] border border-[#D6CAA8] shadow-paper-lift hover:border-[#14402F] hover:shadow-paper-elevated transition-all text-left flex flex-col justify-between group active:scale-95 bg-khata-page"
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-white mb-2 shadow-xs group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: tile.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2B2620] leading-snug">
                      {getTileLabel(tile.type)}
                    </div>
                    <div className="text-[10px] text-[#8A6446] font-kalam mt-0.5 font-bold">
                      {getInflowLabel(tile.type)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Ruled Daybook Page */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md shadow-paper-elevated p-5 sm:p-7 bg-khata-page min-h-[360px] flex flex-col justify-between">
        <div>
          {/* Page Top Heading */}
          <div className="flex justify-between items-center pb-2 border-b-2 border-[#14402F] mb-4">
            <div>
              <span className="font-display font-bold text-lg sm:text-xl text-[#14402F]">
                {t('diary.dayLedgerTitle', '॥ श्री ॥ Daily Ledger Sheet')}
              </span>
              <span className="text-xs font-mono text-[#8A6446] ml-3">
                {selectedDate}
              </span>
            </div>
            <div className="text-right text-xs font-mono">
              <span className="text-[#7C766B]">{t('diary.totalEntries', 'Total entries')}:</span>{' '}
              <span className="font-bold text-[#14402F]">{dayTxns.length}</span>
            </div>
          </div>

          {/* List of Entries */}
          {isShopClosed ? (
            <div className="py-12 text-center space-y-2">
              <Lock className="w-10 h-10 text-[#8A6446] mx-auto opacity-70" />
              <div className="font-display font-bold text-lg text-[#5A3E2B]">
                {t('diary.closedDayNotice', 'Shop was documented closed on this date')}
              </div>
              <p className="text-xs text-[#7C766B] max-w-sm mx-auto">
                Documented closed days protect your Operating Continuity and do not count as gaps.
              </p>
            </div>
          ) : dayTxns.length === 0 ? (
            <div className="py-14 text-center space-y-2">
              <div className="font-kalam text-xl text-[#8A6446] font-bold">
                {t('diary.noEntriesTitle', 'No entries recorded for this date.')}
              </div>
              <p className="text-xs text-[#7C766B]">
                {t('diary.noEntriesSubtitle', 'Tap any tile above to record counter cash or UPI transactions.')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D6CAA8]/50 font-kalam text-sm sm:text-base">
              <AnimatePresence>
                {dayTxns.map((txn, index) => {
                  const isInflow = txn.direction === 'in';
                  return (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="py-2.5 flex items-center justify-between hover:bg-[#F8F1DE]/60 px-2 rounded transition-colors"
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <span className="truncate text-[#2B2620] font-bold">{txn.description}</span>
                        <EvidenceChip evidenceClass={txn.evidence.class} size="sm" />
                      </div>
                      <div
                        className={`font-mono font-bold tabular-nums whitespace-nowrap text-right ${
                          isInflow ? 'text-[#14402F]' : 'text-[#B5532F]'
                        }`}
                      >
                        {isInflow ? '+' : '-'}
                        {formatINR(txn.amount)}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Page Bottom Summary & Close Book Action */}
        {!isShopClosed && dayTxns.length > 0 && (
          <div className="mt-6 pt-3 border-t-2 border-double border-[#8A6446] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-4 font-mono text-xs">
              <div>
                <span className="text-[#7C766B]">{t('diary.inflow', 'Inflow')}:</span>{' '}
                <span className="font-bold text-[#14402F]">+{formatINR(totalInflow)}</span>
              </div>
              <div>
                <span className="text-[#7C766B]">{t('diary.outflow', 'Outflow')}:</span>{' '}
                <span className="font-bold text-[#B5532F]">-{formatINR(totalOutflow)}</span>
              </div>
              <div>
                <span className="text-[#7C766B]">{t('diary.netMovement', 'Net Cash Movement')}:</span>{' '}
                <span className="font-bold text-[#14402F]">{formatINR(netDay)}</span>
              </div>
            </div>

            <button
              onClick={() => setCloseBookOpen(true)}
              className="px-4 py-2 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold font-mono hover:bg-[#0F2E22] transition-colors shadow-sm"
            >
              {t('diary.closeBookGalla', "Close Today's Book (गल्ला मिलान)")} →
            </button>
          </div>
        )}
      </div>

      {/* Quick Entry Sheet Modal */}
      {activeSheetType && (
        <QuickEntrySheet
          isOpen={true}
          onClose={() => setActiveSheetType(null)}
          entryType={activeSheetType}
          selectedDate={selectedDate}
          onSaveSuccess={() => {}}
        />
      )}

      {/* Close Book Drawer Modal */}
      <CloseBookModal
        isOpen={closeBookOpen}
        onClose={() => setCloseBookOpen(false)}
        date={selectedDate}
        expectedCash={totalInflow}
      />
    </motion.div>
  );
};
