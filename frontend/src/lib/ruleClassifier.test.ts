import { describe, it, expect } from 'vitest';
import { suggestClassification } from './ruleClassifier';
import { detectDuplicates } from './duplicateDetector';
import { Transaction } from '../services/types';

describe('Rule-Based Classifier', () => {
  it('correctly classifies wholesale grain distributor as inventory_purchase', () => {
    const suggestion = suggestClassification(
      'NEFT/Shree Ganesh Agro Wholesale Grains',
      'out',
      8500
    );
    expect(suggestion).not.toBeNull();
    expect(suggestion?.category).toBe('inventory_purchase');
    expect(suggestion?.confidence).toBeGreaterThan(0.8);
  });

  it('correctly classifies personal school fee as personal_transfer', () => {
    const suggestion = suggestClassification(
      'Podar International School Term Fees',
      'out',
      8200
    );
    expect(suggestion).not.toBeNull();
    expect(suggestion?.category).toBe('personal_transfer');
  });

  it('correctly classifies electricity utility as operating_expense', () => {
    const suggestion = suggestClassification(
      'Bescom Commercial Electricity Bill',
      'out',
      3200
    );
    expect(suggestion).not.toBeNull();
    expect(suggestion?.category).toBe('operating_expense');
  });
});

describe('Duplicate Detector', () => {
  const existing: Transaction[] = [
    {
      id: 'txn_101',
      date: '2026-10-15',
      amount: 1450,
      direction: 'in',
      channel: 'upi',
      account: 'business',
      category: 'business_income',
      classification: { value: 'business_income', suggestedBy: null, confirmed: true },
      evidence: { class: 'document_supplied', sourceId: 'src_1' },
      description: 'UPI QR Payment Sharma Ji',
      linkedDocIds: [],
      flags: [],
    },
  ];

  it('detects cross-source duplicate with same date and amount', () => {
    const incoming = [
      {
        date: '2026-10-15',
        amount: 1450,
        direction: 'in' as const,
        description: 'UPI/Sharma Ji/Payment',
      },
    ];

    const dupes = detectDuplicates(incoming, existing);
    expect(dupes.length).toBe(1);
    expect(dupes[0].confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('does not flag transactions with different dates or amounts', () => {
    const incoming = [
      {
        date: '2026-10-16',
        amount: 1450,
        direction: 'in' as const,
        description: 'UPI/Sharma Ji/Payment',
      },
      {
        date: '2026-10-15',
        amount: 1200,
        direction: 'in' as const,
        description: 'UPI/Sharma Ji/Payment',
      },
    ];

    const dupes = detectDuplicates(incoming, existing);
    expect(dupes.length).toBe(0);
  });
});

