// Business B: Rangoli Festival Bazaar
// Strong 12-month seasonality (Holi, Raksha Bandhan, Diwali peaks)

import { Business, DiaryDay, Observation, Source, Transaction, Udhaar } from '../services/types';
import { BUSINESS_IDS } from './seedConstants';
import { createRng, seededBetween } from './seededRng';

export const businessB: Business = {
  id: BUSINESS_IDS.B_RANGOLI_BAZAAR,
  name: 'Rangoli Festival Bazaar',
  category: 'festival_goods',
  ownership: 'sole_proprietorship',
  yearsOperating: 6,
  location: {
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    area: 'Johari Bazaar Heritage Market',
  },
  operatingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
  closedOnFestivals: false, // Peaks during festivals
  language: 'en',
  isDemo: true,
};

export function generateBusinessBData(): {
  business: Business;
  transactions: Transaction[];
  sources: Source[];
  diaryDays: DiaryDay[];
  udhaar: Udhaar[];
  observations: Observation[];
} {
  const rng = createRng(2002);
  const sources: Source[] = [
    {
      id: 'src_b_bank',
      type: 'bank_csv',
      fileName: 'SBI_Jaipur_Current_Statement.csv',
      uploadedAt: '2026-10-24T12:00:00Z',
      rowCount: 310,
      accountTag: 'business',
      authenticated: false,
    },
    {
      id: 'src_b_invoices',
      type: 'invoice',
      fileName: 'Morbi_Clay_Diyas_And_Surat_Lights_Bills.pdf',
      uploadedAt: '2026-10-15T09:30:00Z',
      rowCount: 18,
      accountTag: 'business',
      authenticated: false,
    },
  ];

  const transactions: Transaction[] = [];
  const diaryDays: DiaryDay[] = [];

  const startDate = new Date('2025-11-01');
  const endDate = new Date('2026-10-31');

  let cur = new Date(startDate);
  let txnCounter = 1;

  while (cur <= endDate) {
    const dateStr = cur.toISOString().split('T')[0];
    const month = cur.getMonth(); // 0 = Jan, ..., 9 = Oct, 10 = Nov, 11 = Dec

    // Peak multipliers:
    // Diwali: Oct (month 9) & Nov (month 10) -> 5.5x
    // Holi: Feb/Mar (month 1 & 2) -> 3.5x
    // Rakhi: Aug (month 7) -> 4x
    // Off-season: Apr, May, June, July, Dec -> 0.4x - 0.7x
    let seasonalFactor = 0.5;
    if (month === 9 || month === 10) seasonalFactor = 5.2; // Diwali peak
    else if (month === 2) seasonalFactor = 3.6; // Holi peak
    else if (month === 7) seasonalFactor = 3.8; // Rakhi peak
    else if (month === 0 || month === 8) seasonalFactor = 1.1; // Moderate build-up

    const isSunday = cur.getDay() === 0;
    const isDocumentedOpen = !isSunday || seasonalFactor > 3.0; // Open on Sundays in peak seasons

    if (isDocumentedOpen) {
      const baseDaily = Math.round(seededBetween(rng, 1800, 3200) * seasonalFactor);
      const cashShare = seasonalFactor > 3 ? 0.65 : 0.45; // Higher cash in crowded street stalls
      const cashPortion = Math.round(baseDaily * cashShare);
      const upiPortion = baseDaily - cashPortion;

      diaryDays.push({
        date: dateStr,
        cashSales: cashPortion,
        upiSales: upiPortion,
        isOpen: true,
      });

      // Daily transactions
      transactions.push({
        id: `txnb_${txnCounter++}`,
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
          sourceId: 'src_b_diary',
        },
        description: 'Stall & shop cash sales',
        linkedDocIds: [],
        flags: [],
      });

      transactions.push({
        id: `txnb_${txnCounter++}`,
        date: dateStr,
        amount: upiPortion,
        direction: 'in',
        channel: 'upi',
        account: 'business',
        category: 'business_income',
        classification: {
          value: 'business_income',
          suggestedBy: 'rule',
          confirmed: true,
        },
        evidence: {
          class: 'document_supplied',
          sourceId: 'src_b_bank',
        },
        description: 'UPI customer payments',
        linkedDocIds: ['src_b_bank'],
        flags: [],
      });

      // Front-loaded inventory purchases 1 month prior to peaks:
      // September (month 8) for Diwali, January (month 0) for Holi, July (month 6) for Rakhi
      const dom = cur.getDate();
      if ((month === 8 || month === 0 || month === 6) && (dom === 5 || dom === 18)) {
        const stockBill = seededBetween(rng, 45000, 95000);
        transactions.push({
          id: `txnb_${txnCounter++}`,
          date: dateStr,
          amount: stockBill,
          direction: 'out',
          channel: 'bank',
          account: 'business',
          category: 'inventory_purchase',
          classification: {
            value: 'inventory_purchase',
            suggestedBy: 'rule',
            confirmed: true,
          },
          evidence: {
            class: 'document_supplied',
            sourceId: 'src_b_bank',
          },
          counterparty: 'Morbi Ceramics & Surat Lighting Mart',
          description: 'Advance wholesale festival stock purchase',
          linkedDocIds: ['src_b_bank', 'src_b_invoices'],
          flags: [],
        });
      }
    } else {
      diaryDays.push({
        date: dateStr,
        cashSales: 0,
        upiSales: 0,
        isOpen: false,
        notes: 'Documented off-season closure day',
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  const udhaar: Udhaar[] = [
    {
      id: 'udh_b1',
      customerLabel: 'Sharma Ji Temple Committee',
      amount: 18500,
      givenOn: '2026-10-21',
      status: 'open',
      settlements: [],
    },
  ];

  const observations: Observation[] = [
    {
      id: 'obs_b_1',
      type: 'inconsistent',
      severity: 'info',
      titleEn: 'Expected seasonal surge detected in August & October',
      titleHi: 'अगस्त और अक्टूबर में अपेक्षित मौसमी उछाल दर्ज किया गया',
      plainExplanationEn:
        'Sales fluctuate between ₹42,000 in May to ₹4,80,000 in October. Pattern analysis confirms this matches seasonal festive trading rather than irregular reporting.',
      plainExplanationHi:
        'बिक्री मई में ₹42,000 से लेकर अक्टूबर में ₹4,80,000 तक है। विश्लेषण पुष्टि करता है कि यह अनियमित रिपोर्टिंग नहीं बल्कि मौसमी व्यापार का स्वरूप है।',
      affectedTxnIds: [],
      suggestedActionEn: 'View seasonality breakdown in Analytics',
      suggestedActionHi: 'एनालिटिक्स में मौसमी विवरण देखें',
      resolved: true,
    },
  ];

  return {
    business: businessB,
    transactions,
    sources,
    diaryDays,
    udhaar,
    observations,
  };
}

