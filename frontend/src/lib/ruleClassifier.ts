// Rule-based transaction classifier
// Suggests category based on counterparty, narration keywords, direction, and amount patterns

import { Direction, TransactionCategory } from '../services/types';

export interface ClassificationSuggestion {
  category: TransactionCategory;
  reason: string;
  confidence: number;
}

// Fictional distributor keywords
const WHOLESALE_KEYWORDS = [
  'wholesale',
  'distributor',
  'traders',
  'fmcg',
  'agro',
  'supply',
  'trading co',
  'kirana store supplies',
  'mandi',
  'oil mill',
  'flour mill',
  'grain agency',
];

// Operating expense keywords
const OPERATING_EXPENSE_KEYWORDS = [
  'electricity',
  'bescom',
  'torrent',
  'mahavitaran',
  'rent',
  'shop rent',
  'recharge',
  'airtel',
  'jio',
  'broadband',
  'packaging',
  'wages',
  'helper',
  'transport',
  'tempo',
  'auto freight',
];

// Household / personal keywords
const PERSONAL_TRANSFER_KEYWORDS = [
  'school',
  'fees',
  'academy',
  'wife',
  'beta',
  'son',
  'daughter',
  'self transfer',
  'atm cash wdl',
  'home loan',
  'lic premium',
  'personal',
  'hospital',
  'medical clinic',
];

export function suggestClassification(
  description: string,
  direction: Direction,
  amount: number,
  counterparty?: string
): ClassificationSuggestion | null {
  const text = `${description} ${counterparty || ''}`.toLowerCase();

  // Personal transfer heuristics
  for (const kw of PERSONAL_TRANSFER_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        category: 'personal_transfer',
        reason: `Matched personal / household term "${kw}"`,
        confidence: 0.88,
      };
    }
  }

  // Supplier / inventory heuristics
  for (const kw of WHOLESALE_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        category: 'inventory_purchase',
        reason: `Supplier name matches distributor keyword "${kw}"`,
        confidence: 0.92,
      };
    }
  }

  // Operating expense heuristics
  for (const kw of OPERATING_EXPENSE_KEYWORDS) {
    if (text.includes(kw)) {
      return {
        category: 'operating_expense',
        reason: `Utility / operating expense pattern "${kw}" detected`,
        confidence: 0.95,
      };
    }
  }

  // Direction heuristics
  if (direction === 'in') {
    if (text.includes('upi') || text.includes('qr') || text.includes('paytm') || text.includes('merchant')) {
      return {
        category: 'business_income',
        reason: 'Customer incoming digital payment pattern',
        confidence: 0.82,
      };
    }
    // High credit could be customer payment or loan
    if (amount > 50000) {
      return {
        category: 'unclassified',
        reason: 'Large incoming credit needs merchant verification',
        confidence: 0.4,
      };
    }
    return {
      category: 'business_income',
      reason: 'Standard credit receipt in trading hours',
      confidence: 0.75,
    };
  } else {
    // Large debit might be inventory
    if (amount >= 5000) {
      return {
        category: 'inventory_purchase',
        reason: 'Recurring wholesale amount threshold',
        confidence: 0.7,
      };
    }
    return {
      category: 'operating_expense',
      reason: 'General business debit',
      confidence: 0.65,
    };
  }
}

