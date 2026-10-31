import React from 'react';
import { formatINR } from '../../lib/formatCurrency';

export const CashNote: React.FC<{
  amount?: number;
  label?: string;
  className?: string;
}> = ({ amount = 500, label = 'नकद नोट (Cash)', className = '' }) => {
  return (
    <div
      className={`relative inline-flex flex-col items-center justify-between p-2.5 rounded border border-[#939F5B] bg-[#E4EAD6] text-[#14402F] shadow-sm select-none ${className}`}
      style={{ width: '130px', height: '68px' }}
    >
      <div className="w-full flex justify-between items-center text-[9px] font-mono opacity-75">
        <span>DEMO TENDER</span>
        <span>₹{amount}</span>
      </div>
      <div className="flex items-center space-x-1.5 my-auto">
        {/* Geometric currency seal */}
        <div className="w-6 h-6 rounded-full border border-dashed border-[#6B7A3A] flex items-center justify-center font-bold text-xs text-[#2A6347]">
          ₹
        </div>
        <div className="font-mono font-bold text-sm">{formatINR(amount)}</div>
      </div>
      <div className="text-[8px] font-sans text-center text-[#5A3E2B] truncate w-full">
        {label}
      </div>
    </div>
  );
};

export const ReceiptStub: React.FC<{
  storeName?: string;
  date?: string;
  amount?: number;
  category?: string;
  className?: string;
}> = ({
  storeName = 'Local Packaging Depot',
  date = '26 Oct 2026',
  amount = 640,
  category = 'Cardboard Boxes & Tape',
  className = '',
}) => {
  return (
    <div
      className={`relative bg-[#FDFBF4] border border-dashed border-[#C9C3B5] p-3 rounded-none shadow-sm font-mono text-[11px] text-[#2B2620] select-none ${className}`}
      style={{ width: '180px' }}
    >
      <div className="text-center pb-1.5 border-b border-dashed border-[#C9C3B5]">
        <div className="font-bold uppercase text-[10px] text-[#14402F]">{storeName}</div>
        <div className="text-[9px] text-[#7C766B]">{date}</div>
      </div>
      <div className="py-2 space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-[#5A3E2B] truncate">{category}</span>
          <span className="font-bold">{formatINR(amount)}</span>
        </div>
        <div className="flex justify-between text-[9px] text-[#7C766B]">
          <span>Payment:</span>
          <span>Cash Paid</span>
        </div>
      </div>
      <div className="pt-1.5 border-t border-dashed border-[#C9C3B5] text-center text-[8px] text-[#8A6446]">
        *** RETAIL CASH RECEIPT ***
      </div>
    </div>
  );
};

