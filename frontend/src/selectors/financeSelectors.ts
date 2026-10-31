// Financial Metrics & Aggregations Selectors (Single Source of Truth)

import { Business, DiaryDay, Transaction } from '../services/types';

export interface MonthSummary {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string; // 'Nov 2025'
  sales: number;
  cashSales: number;
  digitalSales: number;
  spending: number;
  netCashMovement: number;
}

export function selectRecordedSales(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.category === 'business_income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function selectRecordedSpending(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.direction === 'out' && t.category !== 'personal_transfer')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function selectNetCashMovement(transactions: Transaction[]): number {
  return selectRecordedSales(transactions) - selectRecordedSpending(transactions);
}

export function selectSalesCashDigitalSplit(transactions: Transaction[]): {
  cashTotal: number;
  digitalTotal: number;
  cashPercent: number;
  digitalPercent: number;
} {
  const salesTxns = transactions.filter((t) => t.category === 'business_income');
  const cashTotal = salesTxns
    .filter((t) => t.channel === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);
  const digitalTotal = salesTxns
    .filter((t) => t.channel !== 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const total = cashTotal + digitalTotal;
  const cashPercent = total > 0 ? Math.round((cashTotal / total) * 100) : 0;
  const digitalPercent = total > 0 ? 100 - cashPercent : 0;

  return { cashTotal, digitalTotal, cashPercent, digitalPercent };
}

export function selectMonthlyTrends(transactions: Transaction[]): MonthSummary[] {
  const monthMap = new Map<string, MonthSummary>();

  transactions.forEach((t) => {
    const monthKey = t.date.substring(0, 7);
    if (!monthMap.has(monthKey)) {
      const [year, month] = monthKey.split('-');
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthMap.set(monthKey, {
        monthKey,
        monthLabel: `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        sales: 0,
        cashSales: 0,
        digitalSales: 0,
        spending: 0,
        netCashMovement: 0,
      });
    }

    const m = monthMap.get(monthKey)!;
    if (t.category === 'business_income') {
      m.sales += t.amount;
      if (t.channel === 'cash') {
        m.cashSales += t.amount;
      } else {
        m.digitalSales += t.amount;
      }
    } else if (t.direction === 'out' && t.category !== 'personal_transfer') {
      m.spending += t.amount;
    }
  });

  const sortedMonths = Array.from(monthMap.values()).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey)
  );

  sortedMonths.forEach((m) => {
    m.netCashMovement = m.sales - m.spending;
  });

  return sortedMonths;
}

export function selectExpenseBreakdown(transactions: Transaction[]): Array<{
  category: string;
  labelEn: string;
  labelHi: string;
  amount: number;
  percentage: number;
}> {
  const spendTxns = transactions.filter(
    (t) => t.direction === 'out' && t.category !== 'personal_transfer'
  );
  const totalSpend = spendTxns.reduce((s, t) => s + t.amount, 0);

  const catMap = new Map<string, number>();
  spendTxns.forEach((t) => {
    catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
  });

  const categoryLabels: Record<string, { en: string; hi: string }> = {
    inventory_purchase: { en: 'Inventory & Wholesale Stock', hi: 'थोक माल खरीद' },
    operating_expense: { en: 'Operating Expenses & Utilities', hi: 'दुकान खर्च व बिजली' },
    supplier_payment: { en: 'Supplier Payments', hi: 'सप्लायर भुगतान' },
    refund: { en: 'Refunds & Returns', hi: 'रिफंड' },
    unclassified: { en: 'Unclassified Outflow', hi: 'अवर्गीकृत जावक' },
  };

  return Array.from(catMap.entries())
    .map(([cat, amount]) => ({
      category: cat,
      labelEn: categoryLabels[cat]?.en || cat,
      labelHi: categoryLabels[cat]?.hi || cat,
      amount,
      percentage: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function selectOperatingContinuity(
  business: Business,
  diaryDays: DiaryDay[]
): {
  expectedDays: number;
  recordedDays: number;
  coveragePercent: number;
  documentedClosedDays: number;
  gapDays: number;
} {
  const recordedDays = diaryDays.filter((d) => d.cashSales > 0 || d.upiSales > 0).length;
  const documentedClosedDays = diaryDays.filter((d) => !d.isOpen).length;
  const totalDays = diaryDays.length;

  const coveragePercent = totalDays > 0 ? Math.min(100, Math.round((recordedDays / (totalDays - documentedClosedDays || 1)) * 100)) : 0;
  const gapDays = Math.max(0, totalDays - recordedDays - documentedClosedDays);

  return {
    expectedDays: totalDays - documentedClosedDays,
    recordedDays,
    coveragePercent,
    documentedClosedDays,
    gapDays,
  };
}

