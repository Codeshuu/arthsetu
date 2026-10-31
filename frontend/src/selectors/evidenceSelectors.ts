// Evidence Class Breakdown Selectors

import { EvidenceClass, Transaction } from '../services/types';
import { EVIDENCE_CLASS_CONFIG } from '../design/tokens';

export interface EvidenceSegment {
  cls: EvidenceClass;
  amount: number;
  count: number;
  percentage: number;
  config: (typeof EVIDENCE_CLASS_CONFIG)[EvidenceClass];
}

export function selectEvidenceBreakdown(transactions: Transaction[]): EvidenceSegment[] {
  const classTotals: Record<EvidenceClass, { amount: number; count: number }> = {
    source_authenticated: { amount: 0, count: 0 }, // Locked at 0
    document_supplied: { amount: 0, count: 0 },
    owner_declared: { amount: 0, count: 0 },
    estimated: { amount: 0, count: 0 },
    unclassified: { amount: 0, count: 0 },
  };

  transactions.forEach((t) => {
    const cls = t.evidence.class;
    if (classTotals[cls]) {
      classTotals[cls].amount += t.amount;
      classTotals[cls].count += 1;
    }
  });

  const grandTotal = Object.values(classTotals).reduce((sum, item) => sum + item.amount, 0);

  const order: EvidenceClass[] = [
    'source_authenticated',
    'document_supplied',
    'owner_declared',
    'estimated',
    'unclassified',
  ];

  return order.map((cls) => {
    const { amount, count } = classTotals[cls];
    const percentage = grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0;

    return {
      cls,
      amount,
      count,
      percentage,
      config: EVIDENCE_CLASS_CONFIG[cls],
    };
  });
}

