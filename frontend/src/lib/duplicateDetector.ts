// Duplicate transaction detection across sources (e.g. Bank CSV vs UPI export)

import { Transaction } from '../services/types';

export interface DuplicateMatch {
  existingTransaction: Transaction;
  incomingIndex: number;
  confidence: number;
  reason: string;
}

export function detectDuplicates(
  incomingItems: Array<{ date: string; amount: number; description: string; direction: 'in' | 'out' }>,
  existingTransactions: Transaction[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  incomingItems.forEach((incoming, idx) => {
    // Check against existing transactions
    for (const existing of existingTransactions) {
      if (existing.date === incoming.date && Math.abs(existing.amount - incoming.amount) < 0.01) {
        // Similar description or direction match
        const descA = incoming.description.toLowerCase().replace(/[^a-z0-9]/g, '');
        const descB = existing.description.toLowerCase().replace(/[^a-z0-9]/g, '');

        const isExactDesc = descA === descB;
        const isSubstring = descA.includes(descB) || descB.includes(descA);
        const directionMatch = existing.direction === incoming.direction;

        if (directionMatch && (isExactDesc || isSubstring || (existing.channel === 'upi' && descA.includes('upi')))) {
          matches.push({
            existingTransaction: existing,
            incomingIndex: idx,
            confidence: isExactDesc ? 0.98 : 0.85,
            reason: `Matches existing transaction from ${existing.date} for ₹${existing.amount}`,
          });
          break;
        }
      }
    }
  });

  return matches;
}

