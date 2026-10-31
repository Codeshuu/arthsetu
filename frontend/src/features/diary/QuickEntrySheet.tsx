import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Camera, Check } from 'lucide-react';
import { formatINR } from '../../lib/formatCurrency';
import { useArthSetuStore } from '../../store/useArthSetuStore';
import { useI18n } from '../../i18n/i18nContext';
import { Stamp } from '../../components/fragments/Stamp';

export type DiaryEntryType =
  | 'cash_sale'
  | 'upi_sale'
  | 'stock_bought'
  | 'expense'
  | 'paid_supplier'
  | 'credit_given'
  | 'credit_received';

interface QuickEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: DiaryEntryType;
  selectedDate: string;
  onSaveSuccess: () => void;
}

const TYPE_CONFIG: Record<
  DiaryEntryType,
  {
    titleEn: string;
    titleHi: string;
    direction: 'in' | 'out';
    channel: 'cash' | 'upi';
    category: any;
    color: string;
  }
> = {
  cash_sale: {
    titleEn: 'Cash Sale',
    titleHi: 'नकद बिक्री दर्ज करें',
    direction: 'in',
    channel: 'cash',
    category: 'business_income',
    color: '#14402F',
  },
  upi_sale: {
    titleEn: 'UPI Sale',
    titleHi: 'UPI बिक्री दर्ज करें',
    direction: 'in',
    channel: 'upi',
    category: 'business_income',
    color: '#6B7A3A',
  },
  stock_bought: {
    titleEn: 'Stock Bought',
    titleHi: 'थोक माल खरीद',
    direction: 'out',
    channel: 'cash',
    category: 'inventory_purchase',
    color: '#B5532F',
  },
  expense: {
    titleEn: 'Daily Expense',
    titleHi: 'दुकान खर्च',
    direction: 'out',
    channel: 'cash',
    category: 'operating_expense',
    color: '#8A6446',
  },
  paid_supplier: {
    titleEn: 'Paid Supplier',
    titleHi: 'सप्लायर को भुगतान',
    direction: 'out',
    channel: 'cash',
    category: 'supplier_payment',
    color: '#7A5A16',
  },
  credit_given: {
    titleEn: 'Credit Given (Udhaar)',
    titleHi: 'ग्राहक को उधार दिया',
    direction: 'out',
    channel: 'cash',
    category: 'unclassified',
    color: '#B5532F',
  },
  credit_received: {
    titleEn: 'Credit Received (Wassoli)',
    titleHi: 'उधार वसूली',
    direction: 'in',
    channel: 'cash',
    category: 'business_income',
    color: '#14402F',
  },
};

export const QuickEntrySheet: React.FC<QuickEntrySheetProps> = ({
  isOpen,
  onClose,
  entryType,
  selectedDate,
  onSaveSuccess,
}) => {
  const { language } = useI18n();
  const config = TYPE_CONFIG[entryType];
  const addTransaction = useArthSetuStore((s) => s.addTransaction);

  const [rawAmount, setRawAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showSaveAnimation, setShowSaveAnimation] = useState<boolean>(false);

  const numAmount = parseInt(rawAmount || '0', 10);

  const handleKeypadPress = (digit: string) => {
    if (rawAmount.length >= 7) return; // Prevent overflow
    setRawAmount((prev) => (prev === '' && digit === '0' ? '' : prev + digit));
  };

  const handleDelete = () => {
    setRawAmount((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setRawAmount('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
    }
  };

  const handleSave = () => {
    if (numAmount <= 0) return;

    // Trigger recorded animation
    setShowSaveAnimation(true);

    setTimeout(() => {
      addTransaction({
        date: selectedDate,
        amount: numAmount,
        direction: config.direction,
        channel: config.channel,
        account: 'business',
        category: config.category,
        classification: {
          value: config.category,
          suggestedBy: 'user',
          confirmed: true,
        },
        evidence: {
          class: 'owner_declared',
          sourceId: 'src_diary',
          note: note || `${config.titleEn} entry`,
        },
        description: note || `${config.titleEn} (Daybook entry)`,
        linkedDocIds: photoUrl ? ['receipt_photo'] : [],
        flags: [],
      });

      setShowSaveAnimation(false);
      setRawAmount('');
      setNote('');
      setPhotoUrl(null);
      onSaveSuccess();
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#2B2620]"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#FDFBF4] border-t-4 sm:border-2 border-[#14402F] rounded-t-xl sm:rounded-xl shadow-2xl p-5 z-10 select-none font-sans"
        >
          {showSaveAnimation && (
            <div className="absolute inset-0 bg-[#FDFBF4]/90 z-20 flex flex-col items-center justify-center space-y-2">
              <Stamp variant="recorded" rotation={-5} animate={true} />
              <div className="text-sm font-kalam font-bold text-[#14402F]">
                दर्ज किया गया · Recorded into Book
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center pb-2 border-b border-[#D6CAA8]">
            <div>
              <span className="text-[10px] font-mono text-[#8A6446] uppercase font-bold">
                {selectedDate} · DIARY ENTRY
              </span>
              <h3 className="font-display font-bold text-lg text-[#14402F]">
                {language === 'hi' ? config.titleHi : config.titleEn}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#7C766B] hover:bg-[#F8F1DE]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Money Display */}
          <div className="my-3 text-center py-2 bg-[#F8F1DE] rounded border border-[#D6CAA8]">
            <div className="text-xs text-[#7C766B] font-mono">Amount in Rupees</div>
            <div className="font-display text-4xl font-bold text-[#14402F] tracking-tight tabular-nums mt-0.5">
              {formatINR(numAmount)}
            </div>
          </div>

          {/* Note & Receipt Upload */}
          <div className="space-y-2 mb-3">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add remark or customer/item name (optional)"
              className="w-full px-3 py-1.5 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xs text-[#2B2620] focus:outline-none focus:border-[#14402F]"
            />

            <div className="flex items-center justify-between text-xs text-[#7C766B]">
              <label className="flex items-center space-x-1.5 cursor-pointer hover:text-[#14402F]">
                <Camera className="w-4 h-4 text-[#8A6446]" />
                <span>{photoUrl ? 'Receipt attached ✓' : 'Attach photo of receipt'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="font-mono text-[10px]">Owner-declared</span>
            </div>
          </div>

          {/* Custom Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 my-2 font-mono">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-3 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xl font-bold text-[#2B2620] hover:bg-[#E6DAB9] active:scale-95 transition-transform"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 rounded bg-[#E6DAB9] text-xs font-bold text-[#5A3E2B] hover:bg-[#D9CBA3]"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 rounded bg-[#F8F1DE] border border-[#D6CAA8] text-xl font-bold text-[#2B2620] hover:bg-[#E6DAB9] active:scale-95 transition-transform"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-3 rounded bg-[#E6DAB9] flex items-center justify-center text-[#5A3E2B] hover:bg-[#D9CBA3]"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={numAmount <= 0}
            className={`w-full py-3 rounded text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow ${
              numAmount > 0
                ? 'bg-[#14402F] text-[#FDFBF4] hover:bg-[#0F2E22]'
                : 'bg-[#D6CAA8] text-[#7C766B] cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Record Entry (हिसाब जोड़ें)</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

