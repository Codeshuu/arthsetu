import React from 'react';
import { formatINR } from '../../lib/formatCurrency';
import { Stamp } from './Stamp';

interface InvoiceItem {
  name: string;
  qty: string;
  rate: number;
  total: number;
}

interface InvoiceSheetProps {
  distributorName?: string;
  invoiceNo?: string;
  date?: string;
  items?: InvoiceItem[];
  gstNo?: string;
  isPaid?: boolean;
  className?: string;
}

const DEFAULT_INVOICE_ITEMS: InvoiceItem[] = [
  { name: 'Sona Masoori Rice (25kg)', qty: '4 Bags', rate: 1450, total: 5800 },
  { name: 'Toor Dal Premium (30kg)', qty: '1 Bag', rate: 4200, total: 4200 },
  { name: 'Refined Sunflower Oil (15L)', qty: '2 Tins', rate: 2150, total: 4300 },
  { name: 'Tata Salt Crystal (1kg x 24)', qty: '2 Cartons', rate: 580, total: 1160 },
];

export const InvoiceSheet: React.FC<InvoiceSheetProps> = ({
  distributorName = 'Shree Ganesh Wholesale Agro Traders',
  invoiceNo = 'INV-2026-DEMO-8841',
  date = '25 Oct 2026',
  items = DEFAULT_INVOICE_ITEMS,
  gstNo = '29ABCDE1234F1Z5 (Fictional)',
  isPaid = true,
  className = '',
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const gstAmount = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gstAmount;

  return (
    <div
      className={`relative bg-[#FDFBF4] border border-[#D6CAA8] p-4 sm:p-5 shadow-paper-lift select-none text-[#2B2620] ${className}`}
    >
      {/* Rubber Stamp on corner */}
      {isPaid && (
        <div className="absolute top-8 right-6 z-10 opacity-90 pointer-events-none">
          <Stamp
            variant="supplied_not_authenticated"
            text="SUPPLIED BILL"
            rotation={-6}
            animate={false}
          />
        </div>
      )}

      {/* Letterhead */}
      <div className="border-b-2 border-[#14402F] pb-2 mb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-[#14402F]">
              {distributorName}
            </h3>
            <p className="text-[10px] text-[#7C766B]">
              APMC Grain Yard, Sector 4 · GSTIN: {gstNo}
            </p>
          </div>
          <div className="text-right font-mono text-[11px] text-[#5A3E2B]">
            <div className="font-bold">TAX INVOICE</div>
            <div>{invoiceNo}</div>
            <div className="text-[#7C766B]">Date: {date}</div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="text-[11px] text-[#5A3E2B] mb-2 bg-[#F8F1DE]/60 p-1.5 rounded border border-[#D6CAA8]/50">
        <span className="font-semibold text-[#14402F]">Billed To:</span> Local Retail Merchant (Kirana Account)
      </div>

      {/* Table */}
      <table className="w-full text-[11px] border-collapse mb-3">
        <thead>
          <tr className="border-b border-[#D6CAA8] bg-[#F1E8D0]/50 text-[#5A3E2B] font-semibold">
            <th className="py-1 text-left">Description</th>
            <th className="py-1 text-center">Qty</th>
            <th className="py-1 text-right">Rate</th>
            <th className="py-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D6CAA8]/40">
          {items.map((item, i) => (
            <tr key={i} className="font-mono text-[#2B2620]">
              <td className="py-1 font-sans text-[#2B2620]">{item.name}</td>
              <td className="py-1 text-center text-[#7C766B]">{item.qty}</td>
              <td className="py-1 text-right">{formatINR(item.rate)}</td>
              <td className="py-1 text-right font-bold">{formatINR(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-[#D6CAA8] pt-1.5 text-[11px] space-y-0.5">
        <div className="flex justify-between text-[#7C766B]">
          <span>Subtotal:</span>
          <span className="font-mono">{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[#7C766B]">
          <span>GST (5% Approx):</span>
          <span className="font-mono">{formatINR(gstAmount)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-[#14402F] border-t border-[#14402F] pt-1">
          <span>Total Payable:</span>
          <span className="font-mono">{formatINR(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
};

