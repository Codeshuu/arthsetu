import React from 'react';
import { formatINR } from '../../lib/formatCurrency';

interface BankRowProps {
  date: string;
  narration: string;
  debit?: number;
  credit?: number;
  balance?: number;
  chqNo?: string;
  className?: string;
}

export const BankRow: React.FC<BankRowProps> = ({
  date,
  narration,
  debit,
  credit,
  balance = 48250,
  chqNo = '-',
  className = '',
}) => {
  return (
    <div
      className={`font-mono text-xs flex items-center justify-between py-1.5 px-3 border-b border-[#D6CAA8]/60 hover:bg-[#F8F1DE] transition-colors select-none ${className}`}
    >
      <div className="w-20 text-[#7C766B] flex-shrink-0">{date}</div>
      <div className="flex-1 truncate px-2 text-[#2B2620]" title={narration}>
        {narration}
      </div>
      <div className="w-12 text-center text-[#7C766B] text-[10px] hidden sm:block">
        {chqNo}
      </div>
      <div className="w-20 text-right text-[#B5532F] font-medium">
        {debit ? formatINR(debit) : '-'}
      </div>
      <div className="w-20 text-right text-[#2A6347] font-semibold">
        {credit ? formatINR(credit) : '-'}
      </div>
      <div className="w-24 text-right text-[#5A3E2B] tabular-nums hidden md:block">
        {formatINR(balance)}
      </div>
    </div>
  );
};

export const BankStatementStrip: React.FC<{
  bankName?: string;
  accNo?: string;
  rows?: BankRowProps[];
  className?: string;
}> = ({
  bankName = 'Canara Commercial Bank',
  accNo = 'XXXX-XXXX-4912',
  rows = [
    { date: '28/10/26', narration: 'UPI/6382910/Kirana QR Settlement', credit: 5420, balance: 52140 },
    { date: '27/10/26', narration: 'NEFT/Shree Ganesh Agro Wholesalers', debit: 8500, balance: 46720 },
    { date: '26/10/26', narration: 'UPI/9842100/Customer Payment', credit: 1250, balance: 55220 },
    { date: '25/10/26', narration: 'ATM WDL/Hubballi City ATM', debit: 4000, balance: 53970 },
  ],
  className = '',
}) => {
  return (
    <div
      className={`bg-[#FDFBF4] border border-[#D6CAA8] rounded shadow-paper-lift overflow-hidden text-[#2B2620] ${className}`}
    >
      <div className="bg-[#14402F] text-[#FDFBF4] px-3 py-2 flex justify-between items-center text-xs">
        <div className="font-semibold">{bankName} · Statement Extract</div>
        <div className="font-mono text-[10px] opacity-80">A/C: {accNo} (Demo)</div>
      </div>
      <div className="bg-[#F1E8D0] text-[10px] font-mono font-semibold text-[#5A3E2B] flex py-1 px-3 border-b border-[#D6CAA8]">
        <div className="w-20 flex-shrink-0">Txn Date</div>
        <div className="flex-1 px-2">Narration / Particulars</div>
        <div className="w-12 text-center hidden sm:block">Chq/Ref</div>
        <div className="w-20 text-right">Debit (Dr)</div>
        <div className="w-20 text-right">Credit (Cr)</div>
        <div className="w-24 text-right hidden md:block">Balance</div>
      </div>
      <div className="divide-y divide-[#D6CAA8]/40">
        {rows.map((r, i) => (
          <BankRow key={i} {...r} />
        ))}
      </div>
    </div>
  );
};

