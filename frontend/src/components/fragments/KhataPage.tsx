import React from 'react';
import { formatINR } from '../../lib/formatCurrency';

export type KhataVariant = 'sales' | 'udhaar' | 'purchase';

interface KhataEntry {
  particular: string;
  amount: number;
  isStruckThrough?: boolean;
  tally?: string;
  note?: string;
}

interface KhataPageProps {
  title?: string;
  date?: string;
  pageNo?: number;
  variant?: KhataVariant;
  entries?: KhataEntry[];
  totalLabel?: string;
  className?: string;
  showBindingHoles?: boolean;
}

const DEFAULT_SALES_ENTRIES: KhataEntry[] = [
  { particular: 'सुबह नकद बिक्री (Morning Cash)', amount: 4850, tally: '卌 卌 卌' },
  { particular: 'चावल व दाल (50kg Bag)', amount: 3200 },
  { particular: 'दूध व दही काउंटर बिक्री', amount: 1420, tally: '卌 卌' },
  { particular: 'गलत प्रविष्टि (रद्द)', amount: 450, isStruckThrough: true },
  { particular: 'शाम की नकद बिक्री (Evening)', amount: 6100, tally: '卌 卌 卌 卌' },
];

export const KhataPage: React.FC<KhataPageProps> = ({
  title = 'दैनिक बिक्री खाता (Daybook)',
  date = '28 Oct 2026',
  pageNo = 142,
  variant = 'sales',
  entries = DEFAULT_SALES_ENTRIES,
  totalLabel = 'कुल योग (Total)',
  className = '',
  showBindingHoles = true,
}) => {
  const activeEntries = entries;
  const netTotal = activeEntries
    .filter((e) => !e.isStruckThrough)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div
      className={`relative bg-[#FDFBF4] border border-[#D6CAA8] rounded shadow-paper-lift p-4 sm:p-6 overflow-hidden select-none font-kalam text-[#5A3E2B] ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(to right, transparent 52px, rgba(181, 83, 47, 0.4) 52px, rgba(181, 83, 47, 0.4) 54px, transparent 54px),
          linear-gradient(to bottom, rgba(214, 202, 168, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 32px',
        lineHeight: '32px',
      }}
    >
      {/* Binding punch holes */}
      {showBindingHoles && (
        <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-[#E6DAB9] border border-[#D6CAA8] shadow-inner" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#E6DAB9] border border-[#D6CAA8] shadow-inner" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#E6DAB9] border border-[#D6CAA8] shadow-inner" />
        </div>
      )}

      {/* Folded paper corner on top right */}
      <div className="absolute top-0 right-0 w-6 h-6 overflow-hidden pointer-events-none">
        <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#E6DAB9] border-b border-l border-[#D6CAA8] rotate-45 transform origin-bottom-left" />
      </div>

      {/* Page Header */}
      <div className="ml-10 sm:ml-12 flex justify-between items-baseline border-b border-[#D6CAA8] pb-1 mb-2">
        <div>
          <span className="text-base sm:text-lg font-bold tracking-wide text-[#2B2620]">
            ॥ श्री ॥ {title}
          </span>
          <span className="text-xs ml-3 text-[#8A6446]">तारीख: {date}</span>
        </div>
        <div className="text-xs font-mono text-[#8A6446]">पृष्ठ {pageNo}</div>
      </div>

      {/* Ruled entries */}
      <div className="ml-10 sm:ml-12 space-y-0 min-h-[160px]">
        {activeEntries.map((item, idx) => (
          <div
            key={idx}
            className={`flex justify-between items-center text-sm sm:text-base border-b border-transparent ${
              item.isStruckThrough ? 'line-through text-stone-500 opacity-60' : ''
            }`}
            style={{ height: '32px' }}
          >
            <div className="flex items-center space-x-2 truncate pr-2">
              <span className="truncate">{item.particular}</span>
              {item.tally && (
                <span className="text-xs text-[#B28A33] font-mono tracking-tighter opacity-75">
                  ({item.tally})
                </span>
              )}
            </div>
            <div className="font-bold whitespace-nowrap tabular-nums text-right">
              {formatINR(item.amount)}
            </div>
          </div>
        ))}
      </div>

      {/* Ruled Total Line */}
      <div
        className="ml-10 sm:ml-12 mt-2 pt-1 border-t-2 border-double border-[#8A6446] flex justify-between items-center text-base sm:text-lg font-bold text-[#14402F]"
        style={{ height: '36px' }}
      >
        <span>{totalLabel}</span>
        <span className="text-xl tabular-nums font-mono font-bold text-[#14402F]">
          {formatINR(netTotal)}
        </span>
      </div>
    </div>
  );
};

