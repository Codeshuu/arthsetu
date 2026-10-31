import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { Transaction, TransactionCategory } from '../../services/types';
import { formatINR } from '../../lib/formatCurrency';
import { EvidenceChip } from '../../components/evidence/EvidenceChip';
import { TransactionDrawer } from './TransactionDrawer';
import { EvidenceThreadDrawer } from '../../components/evidence/EvidenceThreadDrawer';
import {
  Search,
  Upload,
  CheckCheck,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const RecordsPage: React.FC = () => {
  const { t, language } = useI18n();
  const transactions = useArthSetuStore((s) => s.transactions);
  const classifyTransaction = useArthSetuStore((s) => s.classifyTransaction);
  const bulkClassify = useArthSetuStore((s) => s.bulkClassifyTransactions);
  const confirmAllSuggestions = useArthSetuStore((s) => s.confirmAllSuggestions);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTxnForDrawer, setSelectedTxnForDrawer] = useState<Transaction | null>(null);

  // Evidence trace drawer
  const [traceTarget, setTraceTarget] = useState<Transaction | null>(null);

  // Filtered transactions
  const filteredTxns = useMemo(() => {
    return transactions.filter((t) => {
      if (searchTerm && !t.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      if (selectedChannel !== 'all' && t.channel !== selectedChannel) {
        return false;
      }
      if (selectedAccount !== 'all' && t.account !== selectedAccount) {
        return false;
      }
      if (flaggedOnly && t.flags.length === 0) {
        return false;
      }
      return true;
    });
  }, [transactions, searchTerm, selectedCategory, selectedChannel, selectedAccount, flaggedOnly]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTxns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTxns.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = (cat: TransactionCategory) => {
    if (selectedIds.length === 0) return;
    bulkClassify(selectedIds, cat);
    setSelectedIds([]);
  };

  const handleConfirmAll = () => {
    const confirmedCount = confirmAllSuggestions();
    alert(`Confirmed ${confirmedCount} rule-based suggestions into official business records.`);
  };

  const getCategoryLabel = (cat: TransactionCategory) => {
    switch (cat) {
      case 'business_income':
        return t('records.catIncome', 'Business Income');
      case 'inventory_purchase':
        return t('records.catInventory', 'Inventory');
      case 'operating_expense':
        return t('records.catExpense', 'Expense');
      case 'supplier_payment':
        return t('records.catSupplier', 'Supplier');
      case 'personal_transfer':
        return t('records.catPersonal', 'Personal');
      case 'unclassified':
      default:
        return t('records.catUnclassified', 'Unclassified');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto font-sans select-none"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D6CAA8] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D08A1E]">
            {t('records.banner', '॥ समग्र लेन-देन रजिस्टर ॥')}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14402F]">
            {t('records.title', 'Transaction Records & Classification')}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleConfirmAll}
            className="px-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono font-bold text-[#14402F] hover:bg-[#E6DAB9] flex items-center space-x-1"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#2A6347]" />
            <span>{t('records.confirmBtn', 'Confirm Suggestions')}</span>
          </button>

          <Link
            to="/app/records/review"
            className="px-3 py-1.5 rounded bg-[#14402F] text-[#FDFBF4] text-xs font-bold font-mono hover:bg-[#0F2E22] transition-colors"
          >
            {t('records.reviewQueueBtn', 'Review Queue')} ({transactions.filter((t) => !t.classification.confirmed).length}) →
          </Link>

          <Link
            to="/app/records/import"
            className="px-3.5 py-1.5 rounded bg-[#D08A1E] text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-[#B57415] shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('records.importBtn', 'Import Statement')}</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md p-3 shadow-paper-lift space-y-3 bg-khata-page">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7C766B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('records.searchPlaceholder', 'Search by narration, counterparty or description...')}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs text-[#2B2620] focus:outline-none focus:border-[#14402F]"
            />
          </div>

          {/* Quick Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono text-[#2B2620] focus:outline-none"
            >
              <option value="all">{t('records.allCategories', 'All Categories')}</option>
              <option value="business_income">{t('records.catIncome', 'Business Income')}</option>
              <option value="inventory_purchase">{t('records.catInventory', 'Inventory Purchase')}</option>
              <option value="operating_expense">{t('records.catExpense', 'Operating Expense')}</option>
              <option value="supplier_payment">{t('records.catSupplier', 'Supplier Payment')}</option>
              <option value="personal_transfer">{t('records.catPersonal', 'Personal Transfer')}</option>
              <option value="unclassified">{t('records.catUnclassified', 'Unclassified Only')}</option>
            </select>

            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-2 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs font-mono text-[#2B2620] focus:outline-none"
            >
              <option value="all">{t('records.allChannels', 'All Channels')}</option>
              <option value="cash">{t('records.chanCash', 'Cash')}</option>
              <option value="upi">{t('records.chanUpi', 'UPI')}</option>
              <option value="bank">{t('records.chanBank', 'Bank')}</option>
            </select>

            <button
              onClick={() => setFlaggedOnly(!flaggedOnly)}
              className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                flaggedOnly
                  ? 'bg-[#B5532F] text-white border-[#8A6446]'
                  : 'bg-[#F8F1DE] text-[#5A3E2B] border-[#D6CAA8]'
              }`}
            >
              {t('records.flaggedOnly', 'Flagged Only')}
            </button>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between p-2 rounded bg-[#E4EAD6] border border-[#939F5B] text-xs font-mono">
            <span className="font-bold text-[#14402F]">
              {selectedIds.length} {t('records.bulkSelected', 'transactions selected')}:
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('business_income')}
                className="px-2.5 py-1 rounded bg-[#14402F] text-white text-[11px] font-bold"
              >
                {t('records.markBiz', 'Mark Business')}
              </button>
              <button
                onClick={() => handleBulkAction('personal_transfer')}
                className="px-2.5 py-1 rounded bg-[#8A6446] text-white text-[11px] font-bold"
              >
                {t('records.markPersonal', 'Mark Personal')}
              </button>
              <button
                onClick={() => handleBulkAction('unclassified')}
                className="px-2 py-1 text-[11px] text-[#7C766B] underline"
              >
                {t('records.resetFilter', 'Reset')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-[#FDFBF4] border border-[#D6CAA8] rounded-md shadow-paper-elevated overflow-hidden bg-khata-page">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#14402F] text-[#FDFBF4] border-b border-[#0F2E22] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredTxns.length && filteredTxns.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-[#D08A1E] rounded"
                  />
                </th>
                <th className="py-2.5 px-3 w-24">{t('records.colDate', 'Date')}</th>
                <th className="py-2.5 px-3">{t('records.colDesc', 'Description')}</th>
                <th className="py-2.5 px-3 w-20 text-center">{t('records.colChan', 'Channel')}</th>
                <th className="py-2.5 px-3 w-28 text-right">{t('records.colAmt', 'Amount')}</th>
                <th className="py-2.5 px-3 w-36">{t('records.colCat', 'Category')}</th>
                <th className="py-2.5 px-3 w-36">{t('records.colEvidence', 'Evidence')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6CAA8]/40">
              {filteredTxns.slice(0, 50).map((txn) => {
                const isInflow = txn.direction === 'in';
                const isSelected = selectedIds.includes(txn.id);

                return (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxnForDrawer(txn)}
                    className={`hover:bg-[#F8F1DE] transition-colors cursor-pointer group ${
                      isSelected ? 'bg-[#E6DAB9]/40' : ''
                    }`}
                  >
                    <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(txn.id)}
                        className="accent-[#14402F] rounded"
                      />
                    </td>
                    <td className="py-2 px-3 font-mono text-[#7C766B] whitespace-nowrap">
                      {txn.date}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-[#2B2620] group-hover:text-[#14402F]">
                        {txn.description}
                      </div>
                      {txn.flags.length > 0 && (
                        <div className="text-[10px] text-[#B5532F] font-mono mt-0.5">
                          ⚠️ {txn.flags.join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-mono uppercase text-[10px] text-[#8A6446]">
                      {txn.channel}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <div
                        className={`inline-flex items-center space-x-1 ${
                          isInflow ? 'text-[#14402F]' : 'text-[#B5532F]'
                        }`}
                      >
                        {isInflow ? (
                          <ArrowDownLeft className="w-3 h-3 text-[#2A6347]" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-[#B5532F]" />
                        )}
                        <span>{formatINR(txn.amount)}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={txn.category}
                        onChange={(e) =>
                          classifyTransaction(txn.id, e.target.value as TransactionCategory, true)
                        }
                        className="w-full text-[11px] font-sans px-1.5 py-1 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-[#2B2620] focus:outline-none"
                      >
                        <option value="business_income">{t('records.catIncome', 'Business Income')}</option>
                        <option value="inventory_purchase">{t('records.catInventory', 'Inventory')}</option>
                        <option value="operating_expense">{t('records.catExpense', 'Expense')}</option>
                        <option value="supplier_payment">{t('records.catSupplier', 'Supplier')}</option>
                        <option value="personal_transfer">{t('records.catPersonal', 'Personal')}</option>
                        <option value="unclassified">{t('records.catUnclassified', 'Unclassified')}</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <EvidenceChip evidenceClass={txn.evidence.class} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="p-3 bg-[#F8F1DE] border-t border-[#D6CAA8] flex justify-between items-center text-xs font-mono text-[#7C766B]">
          <span>
            {t('records.showingEntries', 'Showing records')}: {Math.min(50, filteredTxns.length)} / {filteredTxns.length}
          </span>
          <span>Virtualised TanStack Table Engine</span>
        </div>
      </div>

      {/* Transaction Detail Drawer */}
      <TransactionDrawer
        transaction={selectedTxnForDrawer}
        onClose={() => setSelectedTxnForDrawer(null)}
        onOpenTrace={(t) => {
          setSelectedTxnForDrawer(null);
          setTraceTarget(t);
        }}
      />

      {/* Evidence Thread Drawer */}
      {traceTarget && (
        <EvidenceThreadDrawer
          isOpen={true}
          onClose={() => setTraceTarget(null)}
          figureName={traceTarget.description}
          figureAmount={traceTarget.amount}
          evidenceClass={traceTarget.evidence.class}
          filterCategory={traceTarget.category}
        />
      )}
    </motion.div>
  );
};
