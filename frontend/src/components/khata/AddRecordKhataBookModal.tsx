import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { TransactionCategory, AccountTag } from '../../services/types';
import { X, BookOpen, Paperclip, CheckCircle2, ArrowRight } from 'lucide-react';

interface AddRecordKhataBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RecordType =
  | 'cash_sale'
  | 'upi_sale'
  | 'inventory_purchase'
  | 'operating_expense'
  | 'supplier_payment'
  | 'udhaar_given'
  | 'udhaar_collected';

export const AddRecordKhataBookModal: React.FC<AddRecordKhataBookModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();
  const addTransaction = useArthSetuStore((s) => s.addTransaction);
  const addUdhaar = useArthSetuStore((s) => s.addUdhaar);

  const [recordType, setRecordType] = useState<RecordType>('cash_sale');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState<'cash' | 'upi'>('cash');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('business_income');
  const [hasDocument, setHasDocument] = useState<boolean>(false);
  const [documentName, setDocumentName] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Sync channel & category when record type changes
  const handleTypeChange = (type: RecordType) => {
    setRecordType(type);
    switch (type) {
      case 'cash_sale':
        setChannel('cash');
        setCategory('business_income');
        if (!description) setDescription('Counter Cash Sale');
        break;
      case 'upi_sale':
        setChannel('upi');
        setCategory('business_income');
        if (!description) setDescription('UPI QR Customer Payment');
        break;
      case 'inventory_purchase':
        setChannel('upi');
        setCategory('inventory_purchase');
        if (!description) setDescription('Wholesale Stock Procurement');
        break;
      case 'operating_expense':
        setChannel('cash');
        setCategory('operating_expense');
        if (!description) setDescription('Shop Operational Expense');
        break;
      case 'supplier_payment':
        setChannel('upi');
        setCategory('supplier_payment');
        if (!description) setDescription('Supplier Invoice Settlement');
        break;
      case 'udhaar_given':
        setChannel('cash');
        setCategory('business_income');
        if (!description) setDescription('Customer Credit (Udhaar)');
        break;
      case 'udhaar_collected':
        setChannel('cash');
        setCategory('business_income');
        if (!description) setDescription('Customer Udhaar Recovery');
        break;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHasDocument(true);
      setDocumentName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const isIncome = recordType === 'cash_sale' || recordType === 'upi_sale' || recordType === 'udhaar_collected';
    const direction = isIncome ? 'in' : 'out';
    const evidenceClass = hasDocument
      ? 'document_supplied'
      : channel === 'cash'
      ? 'owner_declared'
      : 'document_supplied';

    const account: AccountTag = 'business';

    addTransaction({
      date,
      description: description || 'Daily recorded transaction',
      amount: numAmount,
      direction,
      channel,
      account,
      category,
      evidence: {
        class: evidenceClass,
        sourceId: 'src_manual_diary',
        note: hasDocument ? documentName : undefined,
      },
      classification: {
        value: category,
        suggestedBy: 'user',
        confirmed: true,
      },
      linkedDocIds: hasDocument ? [`doc_${Date.now()}`] : [],
      flags: [],
      counterparty: description.split(' ')[0] || undefined,
    });

    if (recordType === 'udhaar_given') {
      addUdhaar({
        customerLabel: description || 'Customer Credit',
        amount: numAmount,
        givenOn: date,
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setAmount('');
      setDescription('');
      setHasDocument(false);
      setDocumentName('');
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#241A14]/70 backdrop-blur-sm"
        />

        {/* 3D Khatabook Container */}
        <div className="relative w-full max-w-2xl z-10 perspective-[1200px] my-auto">
          {/* Outer Cover Flap Animation */}
          <motion.div
            initial={{ rotateY: -75, opacity: 0.2 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -60, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
            className="bg-[#FDFBF4] rounded-xl border-4 border-[#A64D3D] shadow-2xl overflow-hidden relative"
          >
            {/* Khatabook Leather/Cloth Spine Header */}
            <div className="bg-[#A64D3D] text-[#F4E6CE] px-5 py-3.5 flex items-center justify-between border-b-2 border-[#8A2A1A]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#8A2A1A] flex items-center justify-center text-[#E8A04B] border border-[#E8A04B]/40 shadow-inner">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white tracking-wide">
                    {t('khata.bookTitle', 'Daily Khatabook')}
                  </h2>
                  <p className="text-[10px] font-mono text-[#F4E6CE]/80">
                    {t('khata.bookSubtitle', 'Traditional Ledger Entry')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-[#F4E6CE] hover:bg-[#8A2A1A] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Khatabook Ruled Ledger Page Interior */}
            <div className="p-5 sm:p-7 bg-[#FDFBF4] relative bg-ledger-ruled">
              {/* Traditional Red Margin Lines on left */}
              <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-[#B94F35]/30 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-14 w-0.5 bg-[#B94F35]/15 pointer-events-none" />

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#D99A28]/20 text-[#B94F35] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-[#B94F35]" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#39332E]">
                    {t('khata.successMsg', 'Entry stitched into daybook successfully!')}
                  </h3>
                  <p className="text-xs font-mono text-[#76513B]">
                    Updated in your local financial diary and statement instantly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10 pl-6 sm:pl-8">
                  {/* Transaction Type Pills */}
                  <div>
                    <label className="block text-xs font-bold font-mono text-[#76513B] uppercase mb-1.5">
                      {t('khata.txnType', 'Transaction Type')}:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'cash_sale', label: t('khata.typeCashSale', 'Cash Sale') },
                        { id: 'upi_sale', label: t('khata.typeUpiSale', 'UPI Sale') },
                        { id: 'inventory_purchase', label: t('khata.typeStock', 'Stock Purchase') },
                        { id: 'operating_expense', label: t('khata.typeExpense', 'Shop Expense') },
                        { id: 'supplier_payment', label: t('khata.typeSupplier', 'Supplier Pay') },
                        { id: 'udhaar_given', label: t('khata.typeUdhaarGiven', 'Customer Credit') },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTypeChange(item.id as RecordType)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            recordType === item.id
                              ? 'bg-[#B94F35] text-white shadow-sm'
                              : 'bg-[#F4E6CE] text-[#39332E] border border-[#D8BDA0] hover:bg-[#E8D6A3]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount & Date in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold font-mono text-[#76513B] uppercase mb-1">
                        {t('khata.amountLabel', 'Amount (INR)')} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-base font-bold text-[#B94F35]">
                          ₹
                        </span>
                        <input
                          type="number"
                          step="any"
                          required
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          autoFocus
                          className="w-full pl-8 pr-3 py-2 rounded-lg bg-white border border-[#D8BDA0] text-lg font-bold text-[#39332E] focus:outline-none focus:border-[#B94F35] focus:ring-1 focus:ring-[#B94F35]"
                        />
                      </div>
                      {/* Quick chip buttons */}
                      <div className="flex gap-1.5 mt-2">
                        {['150', '350', '500', '1200', '5000'].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setAmount(chip)}
                            className="px-2 py-0.5 rounded bg-[#F4E6CE] hover:bg-[#E8D6A3] text-[10px] font-mono text-[#76513B] border border-[#D8BDA0]"
                          >
                            ₹{chip}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-mono text-[#76513B] uppercase mb-1">
                        {t('khata.dateLabel', 'Date')} *
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#D8BDA0] text-xs font-mono text-[#39332E] focus:outline-none focus:border-[#B94F35]"
                      />

                      <div className="mt-3">
                        <label className="block text-[11px] font-bold font-mono text-[#76513B] uppercase mb-1">
                          {t('khata.modeLabel', 'Payment Channel')}:
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setChannel('cash')}
                            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                              channel === 'cash'
                                ? 'bg-[#76513B] text-white shadow-xs'
                                : 'bg-white border border-[#D8BDA0] text-[#76513B]'
                            }`}
                          >
                            {t('khata.modeCash', 'Cash')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setChannel('upi')}
                            className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${
                              channel === 'upi'
                                ? 'bg-[#A64D3D] text-white shadow-xs'
                                : 'bg-white border border-[#D8BDA0] text-[#A64D3D]'
                            }`}
                          >
                            {t('khata.modeUpi', 'UPI / Digital')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold font-mono text-[#76513B] uppercase mb-1">
                      {t('khata.descLabel', 'Description / Narration')}
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('khata.descPlaceholder', 'e.g. Counter cash sales, Wholesale grocery bill')}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#D8BDA0] text-xs text-[#39332E] focus:outline-none focus:border-[#B94F35]"
                    />
                  </div>

                  {/* Supporting Document Attachment Simulation */}
                  <div className="p-3 bg-[#F4E6CE]/70 rounded-lg border border-[#D8BDA0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-[#B94F35] flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#39332E]">
                          {hasDocument ? documentName : t('khata.docLabel', 'Supporting Document (Optional)')}
                        </div>
                        <div className="text-[10px] text-[#76513B] font-mono">
                          {hasDocument ? t('khata.docSelected') : t('khata.docUploadText')}
                        </div>
                      </div>
                    </div>
                    <label className="px-3 py-1.5 rounded bg-white border border-[#D8BDA0] text-xs font-bold text-[#B94F35] hover:bg-[#E8D6A3] cursor-pointer text-center">
                      <span>{hasDocument ? 'Change Bill' : '+ Attach Receipt'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Evidence Transparency Preview */}
                  <div className="p-2.5 rounded bg-white border border-[#D8BDA0] flex items-center justify-between text-xs font-mono">
                    <span className="text-[#76513B]">{t('khata.evidencePreview', 'Evidence Status')}:</span>
                    <span className="font-bold text-[#B94F35]">
                      {hasDocument
                        ? t('khata.evidenceDoc', 'Document Supplied (Unauthenticated Bill)')
                        : channel === 'cash'
                        ? t('khata.evidenceOwner', 'Owner Declared (Diary Entry)')
                        : t('khata.evidenceDoc', 'Document Supplied (Digital Statement)')}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#D8BDA0]">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-[#76513B] hover:bg-[#F4E6CE]"
                    >
                      {t('common.cancel', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-lg bg-[#B94F35] text-white text-xs font-bold tracking-wide hover:bg-[#A64D3D] shadow-md transition-all active:scale-95 flex items-center space-x-2"
                    >
                      <span>{t('khata.saveBtn', 'Record in Khatabook')}</span>
                      <ArrowRight className="w-4 h-4 text-[#E8A04B]" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
