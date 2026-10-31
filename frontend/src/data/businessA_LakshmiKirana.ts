// Business A: Lakshmi Kirana & General Stores
// 12 months of high-discipline, mature trading data

import { Business, DiaryDay, Observation, Source, Transaction, Udhaar } from '../services/types';
import { BUSINESS_IDS } from './seedConstants';
import { createRng, seededBetween } from './seededRng';

export const businessA: Business = {
  id: BUSINESS_IDS.A_LAKSHMI_KIRANA,
  name: 'Lakshmi Kirana & General Stores',
  category: 'kirana',
  ownership: 'sole_proprietorship',
  yearsOperating: 9,
  location: {
    city: 'Hubballi',
    state: 'Karnataka',
    pincode: '580020',
    area: 'Durgad Bail Commercial Area',
  },
  operatingDays: [0, 1, 2, 3, 4, 5, 6], // 7 days open
  closedOnFestivals: true,
  language: 'en',
  isDemo: true,
};

export function generateBusinessAData(): {
  business: Business;
  transactions: Transaction[];
  sources: Source[];
  diaryDays: DiaryDay[];
  udhaar: Udhaar[];
  observations: Observation[];
} {
  const rng = createRng(1001);
  const sources: Source[] = [
    {
      id: 'src_a_bank',
      type: 'bank_csv',
      fileName: 'Canara_Current_Statement_2025_2026.csv',
      uploadedAt: '2026-10-25T10:00:00Z',
      rowCount: 420,
      accountTag: 'business',
      authenticated: false,
    },
    {
      id: 'src_a_upi',
      type: 'upi_export',
      fileName: 'UPI_Merchant_Report_Oct2026.csv',
      uploadedAt: '2026-10-26T14:30:00Z',
      rowCount: 280,
      accountTag: 'business',
      authenticated: false,
    },
    {
      id: 'src_a_inv_wholesale',
      type: 'invoice',
      fileName: 'Shree_Ganesh_Agro_Invoices_Q3.pdf',
      uploadedAt: '2026-10-20T09:15:00Z',
      rowCount: 48,
      accountTag: 'business',
      authenticated: false,
    },
  ];

  const transactions: Transaction[] = [];
  const diaryDays: DiaryDay[] = [];

  // Generate 12 months: Nov 1, 2025 to Oct 31, 2026 (365 days)
  const startDate = new Date('2025-11-01');
  const endDate = new Date('2026-10-31');

  let cur = new Date(startDate);
  let txnCounter = 1;

  while (cur <= endDate) {
    const dateStr = cur.toISOString().split('T')[0];
    const isRecorded = rng() > 0.08; // 92% discipline

    if (isRecorded) {
      // Daily sales: ₹7,000 - ₹12,000 (higher on weekends)
      const dayOfWeek = cur.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseSales = seededBetween(rng, isWeekend ? 8500 : 7000, isWeekend ? 13000 : 11000);
      const cashPortion = Math.round(baseSales * 0.58);
      const upiPortion = baseSales - cashPortion;

      diaryDays.push({
        date: dateStr,
        cashSales: cashPortion,
        upiSales: upiPortion,
        isOpen: true,
        cashInDrawerCounted: cashPortion - seededBetween(rng, 0, 50),
      });

      // Daily transactions (Cash Income)
      transactions.push({
        id: `txna_${txnCounter++}`,
        date: dateStr,
        amount: cashPortion,
        direction: 'in',
        channel: 'cash',
        account: 'business',
        category: 'business_income',
        classification: {
          value: 'business_income',
          suggestedBy: null,
          confirmed: true,
        },
        evidence: {
          class: 'owner_declared',
          sourceId: 'src_a_diary',
          note: 'Recorded in daybook cash register',
        },
        description: 'Daily cash sales count',
        linkedDocIds: [],
        flags: [],
      });

      // Daily transactions (UPI Settlement)
      transactions.push({
        id: `txna_${txnCounter++}`,
        date: dateStr,
        amount: upiPortion,
        direction: 'in',
        channel: 'upi',
        account: 'business',
        category: 'business_income',
        classification: {
          value: 'business_income',
          suggestedBy: 'rule',
          confidence: 0.95,
          confirmed: true,
        },
        evidence: {
          class: 'document_supplied',
          sourceId: 'src_a_upi',
          note: 'UPI QR merchant settlement report',
        },
        description: 'UPI QR daily settlement',
        linkedDocIds: ['src_a_upi'],
        flags: [],
      });

      // Weekly inventory purchases (Thursdays & Mondays)
      if (dayOfWeek === 1 || dayOfWeek === 4) {
        const invAmount = seededBetween(rng, 18000, 32000);
        transactions.push({
          id: `txna_${txnCounter++}`,
          date: dateStr,
          amount: invAmount,
          direction: 'out',
          channel: 'bank',
          account: 'business',
          category: 'inventory_purchase',
          classification: {
            value: 'inventory_purchase',
            suggestedBy: 'rule',
            confidence: 0.98,
            reason: 'Matches distributor Shree Ganesh Agro Wholesalers',
            confirmed: true,
          },
          evidence: {
            class: 'document_supplied',
            sourceId: 'src_a_bank',
            note: 'Bank NEFT transfer to distributor',
          },
          counterparty: 'Shree Ganesh Agro Wholesalers',
          description: 'NEFT to Shree Ganesh Agro / Grains & Oil',
          linkedDocIds: ['src_a_bank', 'src_a_inv_wholesale'],
          flags: [],
        });
      }

      // Monthly expenses (Rent on 1st, Electricity on 8th, Helper wages on 5th)
      const dom = cur.getDate();
      if (dom === 1) {
        transactions.push({
          id: `txna_${txnCounter++}`,
          date: dateStr,
          amount: 14000,
          direction: 'out',
          channel: 'bank',
          account: 'business',
          category: 'operating_expense',
          classification: {
            value: 'operating_expense',
            suggestedBy: 'rule',
            confirmed: true,
          },
          evidence: {
            class: 'document_supplied',
            sourceId: 'src_a_bank',
          },
          counterparty: 'Commercial Landlord',
          description: 'Shop monthly rent transfer',
          linkedDocIds: ['src_a_bank'],
          flags: [],
        });
      }
      if (dom === 8) {
        transactions.push({
          id: `txna_${txnCounter++}`,
          date: dateStr,
          amount: seededBetween(rng, 2800, 3900),
          direction: 'out',
          channel: 'upi',
          account: 'business',
          category: 'operating_expense',
          classification: {
            value: 'operating_expense',
            suggestedBy: 'rule',
            confirmed: true,
          },
          evidence: {
            class: 'document_supplied',
            sourceId: 'src_a_bank',
          },
          counterparty: 'HESCOM Hubballi',
          description: 'Commercial electricity bill payment',
          linkedDocIds: ['src_a_bank'],
          flags: [],
        });
      }
      if (dom === 5) {
        transactions.push({
          id: `txna_${txnCounter++}`,
          date: dateStr,
          amount: 9000,
          direction: 'out',
          channel: 'cash',
          account: 'business',
          category: 'operating_expense',
          classification: {
            value: 'operating_expense',
            suggestedBy: 'user',
            confirmed: true,
          },
          evidence: {
            class: 'owner_declared',
            sourceId: 'src_a_diary',
          },
          description: 'Store helper monthly wages (Basavaraj)',
          linkedDocIds: [],
          flags: [],
        });
      }
    } else {
      // Closed or unrecorded day
      diaryDays.push({
        date: dateStr,
        cashSales: 0,
        upiSales: 0,
        isOpen: false,
        notes: 'Shop closed on festival / family occasion',
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  const udhaar: Udhaar[] = [
    {
      id: 'udh_1',
      customerLabel: 'Masterji (Tailor)',
      amount: 1450,
      givenOn: '2026-10-18',
      status: 'open',
      settlements: [],
    },
    {
      id: 'udh_2',
      customerLabel: 'Prof. Kulkarni',
      amount: 3200,
      givenOn: '2026-10-02',
      status: 'part',
      settlements: [{ date: '2026-10-15', amount: 1500, note: 'Partial cash payment' }],
    },
    {
      id: 'udh_3',
      customerLabel: 'Suresh Auto Driver',
      amount: 850,
      givenOn: '2026-09-24',
      status: 'settled',
      settlements: [{ date: '2026-10-01', amount: 850, note: 'Full settlement' }],
    },
  ];

  const observations: Observation[] = [
    {
      id: 'obs_a_1',
      type: 'reconciliation_diff',
      severity: 'info',
      titleEn: 'Slight difference between UPI diary entries and bank credits',
      titleHi: 'UPI डायरी प्रविष्टियों और बैंक क्रेडिट में मामूली अंतर',
      plainExplanationEn:
        'In September, declared UPI sales in diary was ₹1,12,400 while bank statement credits showed ₹1,14,100. This is likely due to month-end weekend settlement delay.',
      plainExplanationHi:
        'सितंबर में डायरी में घोषित UPI बिक्री ₹1,12,400 थी, जबकि बैंक में ₹1,14,100 क्रेडिट हुए। यह महीने के अंत में निपटान में देरी के कारण हो सकता है।',
      affectedTxnIds: [],
      suggestedActionEn: 'Review September 29–30 settlements',
      suggestedActionHi: '29-30 सितंबर के निपटान की जाँच करें',
      resolved: false,
    },
  ];

  return {
    business: businessA,
    transactions,
    sources,
    diaryDays,
    udhaar,
    observations,
  };
}

