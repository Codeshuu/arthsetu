import { describe, it, expect } from 'vitest';
import { generateBusinessAData } from '../data/businessA_LakshmiKirana';
import {
  selectRecordedSales,
  selectRecordedSpending,
  selectNetCashMovement,
  selectSalesCashDigitalSplit,
} from './financeSelectors';
import { selectEvidenceBreakdown } from './evidenceSelectors';
import { selectFourDimensions } from './dimensionSelectors';

describe('Selectors Layer - Single Source of Truth', () => {
  const data = generateBusinessAData();

  it('computes positive recorded sales and spending for Business A', () => {
    const sales = selectRecordedSales(data.transactions);
    const spending = selectRecordedSpending(data.transactions);
    const net = selectNetCashMovement(data.transactions);

    expect(sales).toBeGreaterThan(0);
    expect(spending).toBeGreaterThan(0);
    expect(net).toEqual(sales - spending);
  });

  it('cash + digital sales equal total recorded sales', () => {
    const sales = selectRecordedSales(data.transactions);
    const split = selectSalesCashDigitalSplit(data.transactions);

    expect(split.cashTotal + split.digitalTotal).toEqual(sales);
    expect(split.cashPercent + split.digitalPercent).toBeCloseTo(100, -1);
  });

  it('enforces source_authenticated count and amount is exactly 0 in prototype', () => {
    const breakdown = selectEvidenceBreakdown(data.transactions);
    const authSegment = breakdown.find((s) => s.cls === 'source_authenticated');

    expect(authSegment).toBeDefined();
    expect(authSegment?.amount).toEqual(0);
    expect(authSegment?.count).toEqual(0);
    expect(authSegment?.percentage).toEqual(0);
  });

  it('calculates Four Dimensions independently without composite score', () => {
    const dimensions = selectFourDimensions(data.business, data.transactions, data.diaryDays);

    expect(dimensions).toHaveLength(4);
    const ids = dimensions.map((d) => d.id);
    expect(ids).toEqual(['activity', 'completeness', 'patterns', 'reliability']);

    dimensions.forEach((dim) => {
      expect(dim.scorePercent).toBeGreaterThanOrEqual(0);
      expect(dim.scorePercent).toBeLessThanOrEqual(100);
      expect(['Limited', 'Emerging', 'Substantial', 'Extensive']).toContain(dim.level);
    });
  });
});

