import React from 'react';
import { formatINR } from '../../lib/formatCurrency';

interface UpiSlipProps {
  amount?: number;
  sender?: string;
  timestamp?: string;
  txnRef?: string;
  isConfirmed?: boolean;
  className?: string;
}

export const UpiSlip: React.FC<UpiSlipProps> = ({
  amount = 850,
  sender = 'Ananya S. (Customer)',
  timestamp = '28 Oct 2026, 04:32 PM',
  txnRef = 'DEMO-UPI-98234710',
  isConfirmed = true,
  className = '',
}) => {
  return (
    <div
      className={`relative bg-[#F8F1DE] border border-[#D6CAA8] rounded-sm p-4 w-64 shadow-paper-lift select-none text-[#2B2620] ${className}`}
      style={{
        clipPath: 'polygon(0% 0%, 100% 0%, 100% calc(100% - 6px), 95% 100%, 90% calc(100% - 6px), 85% 100%, 80% calc(100% - 6px), 75% 100%, 70% calc(100% - 6px), 65% 100%, 60% calc(100% - 6px), 55% 100%, 50% calc(100% - 6px), 45% 100%, 40% calc(100% - 6px), 35% 100%, 30% calc(100% - 6px), 25% 100%, 20% calc(100% - 6px), 15% 100%, 10% calc(100% - 6px), 5% 100%, 0% calc(100% - 6px))',
      }}
    >
      {/* Top Banner */}
      <div className="flex justify-between items-center pb-2 border-b border-[#D6CAA8]/70">
        <div className="flex items-center space-x-1.5">
          <div className="w-4 h-4 rounded-full bg-[#14402F] flex items-center justify-center text-[10px] text-white font-bold">
            ✓
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#14402F]">
            UPI Payment Received
          </span>
        </div>
        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-[#E4EAD6] text-[#2A6347] font-semibold">
          DEMO
        </span>
      </div>

      {/* Main Rupee Figure */}
      <div className="my-3 text-center">
        <div className="text-2xl font-bold font-mono text-[#14402F] tracking-tight">
          {formatINR(amount)}
        </div>
        <div className="text-xs text-[#5A3E2B] font-medium mt-0.5">
          From: <span className="font-semibold text-[#2B2620]">{sender}</span>
        </div>
      </div>

      {/* Audit Meta */}
      <div className="pt-2 border-t border-dashed border-[#D6CAA8] text-[10px] space-y-1 font-mono text-[#7C766B]">
        <div className="flex justify-between">
          <span>Time:</span>
          <span className="text-[#2B2620]">{timestamp}</span>
        </div>
        <div className="flex justify-between">
          <span>Ref ID:</span>
          <span className="text-[#2B2620]">{txnRef}</span>
        </div>
        <div className="flex justify-between items-center text-[9px] pt-1 text-[#8A6446]">
          <span>Type: Digital Settlement</span>
          <span>{isConfirmed ? '● Confirmed' : '○ Pending'}</span>
        </div>
      </div>
    </div>
  );
};

