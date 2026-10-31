// Business C: Sunita Variety Store
// 7 months, deliberately incomplete data showcasing the review and improvement journey

import { Business, DiaryDay, Observation, Source, Transaction, Udhaar } from '../services/types';
import { BUSINESS_IDS } from './seedConstants';
import { createRng, seededBetween } from './seededRng';

export const businessC: Business = {
  id: BUSINESS_IDS.C_SUNITA_VARIETY,
  ownerId: 'usr_sunita',
  name: 'Sunita Variety Store',
  category: 'general_retail',
  ownership: 'family_run',
  yearsOperating: 3,
  location: {
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    area: 'Kothrud Residential Colony',
  },
  operatingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
  closedOnFestivals: true,
  language: 'en',
  isDemo: true,
};

export function generateBusinessCData(): {
  business: Business;
  transactions: Transaction[];
  sources: Source[];
  diaryDays: DiaryDay[];
  udhaar: Udhaar[];
  observations: Observation[];
} {
  const rng = createRng(3003);
  const sources: Source[] = [
    {
      id: 'src_c_mixed_bank',
      type: 'bank_csv',
      fileName: 'SBI_Savings_Personal_And_Store_Statement.csv',
      uploadedAt: '2026-10-22T16:00:00Z',
      rowCount: 184,
      accountTag: 'mixed',
      authenticated: false,
    },
    {
      id: 'src_c_upi_export',
      type: 'upi_export',
      fileName: 'UPI_QR_Export_May_Oct_2026.csv',
      uploadedAt: '2026-10-23T11:20:00Z',
      rowCount: 120,
      accountTag: 'mixed',
      authenticated: false,
    },
  ];

  const transactions: Transaction[] = [];
  const diaryDays: DiaryDay[] = [];

  // 7 months: April 1, 2026 to October 31, 2026
  const startDate = new Date('2026-04-01');
  const endDate = new Date('2026-10-31');

  let cur = new Date(startDate);
  let txnCounter = 1;

  while (cur <= endDate) {
    const dateStr = cur.toISOString().split('T')[0];
    const month = cur.getMonth(); // 3 = Apr, 4 = May, 5 = Jun, 6 = Jul, 7 = Aug, 8 = Sep, 9 = Oct
    const dom = cur.getDate();

    // 3 Diary Gaps:
    // Gap 1: May 8 to May 24 (family wedding)
    // Gap 2: July 12 to July 29 (monsoon illness)
    // Gap 3: Sept 10 to Sept 22
    const inGap1 = month === 4 && dom >= 8 && dom <= 24;
    const inGap2 = month === 6 && dom >= 12 && dom <= 29;
    const inGap3 = month === 8 && dom >= 10 && dom <= 22;
    const isDiaryRecorded = !inGap1 && !inGap2 && !inGap3;

    if (isDiaryRecorded && cur.getDay() !== 0) {
      const dailySales = seededBetween(rng, 3500, 6800);
      const cashPortion = Math.round(dailySales * 0.5);
      const upiPortion = dailySales - cashPortion;

      diaryDays.push({
        date: dateStr,
        cashSales: cashPortion,
        upiSales: upiPortion,
        isOpen: true,
      });

      // Daily cash sales
      transactions.push({
        id: `txnc_${txnCounter++}`,
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
          sourceId: 'src_c_diary',
        },
        description: 'Cash sales from daybook',
        linkedDocIds: [],
        flags: [],
      });
    }

    // Bank Statement imported credits & debits (Mixed Account)
    if (dom % 3 === 0) {
      const creditAmt = seededBetween(rng, 1200, 4800);
      // 30% of credits unclassified
      const isUnclassified = rng() < 0.32;

      transactions.push({
        id: `txnc_${txnCounter++}`,
        date: dateStr,
        amount: creditAmt,
        direction: 'in',
        channel: 'bank',
        account: 'mixed',
        category: isUnclassified ? 'unclassified' : 'business_income',
        classification: {
          value: isUnclassified ? 'unclassified' : 'business_income',
          suggestedBy: 'rule',
          confidence: isUnclassified ? 0.45 : 0.85,
          reason: isUnclassified
            ? 'Incoming credit in mixed personal/store account'
            : 'Identified regular customer UPI QR credit',
          confirmed: !isUnclassified,
        },
        evidence: {
          class: isUnclassified ? 'unclassified' : 'document_supplied',
          sourceId: 'src_c_mixed_bank',
        },
        description: isUnclassified
          ? `UPI/CR/${seededBetween(rng, 100000, 999999)}/Transfer (Unreviewed)`
          : 'UPI/CR/Kirana QR Settlement',
        linkedDocIds: ['src_c_mixed_bank'],
        flags: isUnclassified ? ['unreviewed_credit'] : [],
      });
    }

    // Household/Personal debits mixed in account
    if (dom === 5) {
      transactions.push({
        id: `txnc_${txnCounter++}`,
        date: dateStr,
        amount: 8200,
        direction: 'out',
        channel: 'bank',
        account: 'mixed',
        category: 'personal_transfer',
        classification: {
          value: 'personal_transfer',
          suggestedBy: 'rule',
          confidence: 0.94,
          reason: 'Matches household school fees keyword',
          confirmed: true,
        },
        evidence: {
          class: 'document_supplied',
          sourceId: 'src_c_mixed_bank',
        },
        counterparty: 'Podar International School',
        description: 'School term fees - Children education',
        linkedDocIds: ['src_c_mixed_bank'],
        flags: ['personal_in_mixed_account'],
      });
    }

    if (dom === 10) {
      transactions.push({
        id: `txnc_${txnCounter++}`,
        date: dateStr,
        amount: 12500,
        direction: 'out',
        channel: 'bank',
        account: 'mixed',
        category: 'personal_transfer',
        classification: {
          value: 'personal_transfer',
          suggestedBy: 'rule',
          confidence: 0.96,
          reason: 'Identified home loan EMI debit',
          confirmed: true,
        },
        evidence: {
          class: 'document_supplied',
          sourceId: 'src_c_mixed_bank',
        },
        counterparty: 'HDFC Home Finance',
        description: 'Home loan monthly EMI debit',
        linkedDocIds: ['src_c_mixed_bank'],
        flags: ['personal_in_mixed_account'],
      });
    }

    // Inventory purchases without invoice receipts
    if (dom === 14 || dom === 27) {
      const invAmt = seededBetween(rng, 12000, 24000);
      transactions.push({
        id: `txnc_${txnCounter++}`,
        date: dateStr,
        amount: invAmt,
        direction: 'out',
        channel: 'bank',
        account: 'mixed',
        category: 'inventory_purchase',
        classification: {
          value: 'inventory_purchase',
          suggestedBy: 'rule',
          confidence: 0.9,
          reason: 'Transfer to wholesale distributor',
          confirmed: true,
        },
        evidence: {
          class: 'document_supplied',
          sourceId: 'src_c_mixed_bank',
          note: 'Bank record present; physical purchase receipt missing',
        },
        counterparty: 'Pune Central Variety Wholesale Depot',
        description: 'NEFT to Pune Central Variety Wholesale',
        linkedDocIds: ['src_c_mixed_bank'],
        flags: ['missing_receipt'],
      });
    }

    cur.setDate(cur.getDate() + 1);
  }

  // Inject 2 visible duplicate pairs (same date, same amount, bank CSV vs UPI export)
  transactions.push({
    id: `txnc_${txnCounter++}`,
    date: '2026-10-15',
    amount: 1450,
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
      sourceId: 'src_c_upi_export',
    },
    description: 'UPI QR Payment - Sharma Household',
    linkedDocIds: ['src_c_upi_export'],
    flags: ['potential_duplicate'],
  });

  const udhaar: Udhaar[] = [
    {
      id: 'udh_c1',
      customerLabel: 'Building 4 Society Watchman',
      amount: 620,
      givenOn: '2026-10-10',
      status: 'open',
      settlements: [],
    },
    {
      id: 'udh_c2',
      customerLabel: 'Gupta Sweets Worker',
      amount: 1800,
      givenOn: '2026-09-15',
      status: 'open',
      settlements: [],
    },
  ];

  const observations: Observation[] = [
    {
      id: 'obs_c_1',
      type: 'missing_record',
      severity: 'attention',
      titleEn: '3 gaps in financial daybook entries (total 46 unrecorded days)',
      titleHi: 'वित्तीय डायरी में 3 अंतराल (कुल 46 दिन हिसाब दर्ज नहीं हुआ)',
      plainExplanationEn:
        'Between May 8–24 and July 12–29, no sales entries were recorded. If the shop was open, documenting cash sales will significantly improve your Activity Visibility.',
      plainExplanationHi:
        '8-24 मई और 12-29 जुलाई के बीच बिक्री दर्ज नहीं हुई। यदि दुकान खुली थी, तो नकद बिक्री दर्ज करने से आपकी गतिविधि दृश्यता में बड़ा सुधार होगा।',
      affectedTxnIds: [],
      suggestedActionEn: 'Backfill or mark as documented closures in Diary',
      suggestedActionHi: 'डायरी में छूटे दिनों का हिसाब भरें या अवकाश दर्ज करें',
      resolved: false,
    },
    {
      id: 'obs_c_2',
      type: 'mixed_personal_business',
      severity: 'attention',
      titleEn: 'Personal expenses detected in primary bank account',
      titleHi: 'मुख्य बैंक खाते में व्यक्तिगत और पारिवारिक खर्च पाए गए',
      plainExplanationEn:
        'Transactions including school fees (₹8,200) and home loan EMIs (₹12,500) are mixed with store supplier debits in this account.',
      plainExplanationHi:
        'स्कूल फीस (₹8,200) और होम लोन ईएमआई (₹12,500) सहित व्यक्तिगत लेनदेन व्यावसायिक खाते में मिश्रित हैं।',
      affectedTxnIds: [],
      suggestedActionEn: 'Tag as Personal Transfers to exclude from business expenses',
      suggestedActionHi: 'इन्हें व्यक्तिगत लेनदेन के रूप में चिह्नित करें',
      potentialValueShift: {
        fromClass: 'unclassified',
        toClass: 'document_supplied',
        amount: 20700,
      },
      resolved: false,
    },
    {
      id: 'obs_c_3',
      type: 'duplicate',
      severity: 'attention',
      titleEn: 'Potential duplicate transaction between Bank and UPI export',
      titleHi: 'बैंक और UPI रिपोर्ट के बीच संभावित दोहराव (Duplicate)',
      plainExplanationEn:
        'Transaction on Oct 15 for ₹1,450 appears in both the bank account statement and the UPI merchant report.',
      plainExplanationHi:
        '15 अक्टूबर को ₹1,450 का लेनदेन बैंक स्टेटमेंट और UPI मर्चेंट रिपोर्ट दोनों में मौजूद है।',
      affectedTxnIds: [`txnc_${txnCounter - 1}`],
      suggestedActionEn: 'Review and merge duplicate entry',
      suggestedActionHi: 'दोहराव की समीक्षा करें और एक प्रविष्टि हटाएं',
      resolved: false,
    },
    {
      id: 'obs_c_4',
      type: 'incomplete_expense_docs',
      severity: 'info',
      titleEn: '70% of wholesale purchases lack attached invoices',
      titleHi: '70% थोक खरीदारी के साथ बिल / रसीद संलग्न नहीं है',
      plainExplanationEn:
        'Supplier bank debits are recorded, but physical bill copies have not been linked. Attaching bills strengthens your Reliability score.',
      plainExplanationHi:
        'सप्लायर के बैंक डेबिट दर्ज हैं, लेकिन बिल संलग्न नहीं हैं। रसीदें जोड़ने से विश्वसनीयता में सुधार होता है।',
      affectedTxnIds: [],
      suggestedActionEn: 'Attach invoices in Evidence Centre',
      suggestedActionHi: 'प्रमाण केंद्र में बिल जोड़ें',
      resolved: false,
    },
  ];

  return {
    business: businessC,
    transactions,
    sources,
    diaryDays,
    udhaar,
    observations,
  };
}

