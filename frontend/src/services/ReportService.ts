// ReportService interface & Local implementation
// NOTE: In a future enterprise setup, a RemoteReportService could sign reports
// using a hardware security module (HSM) or PKI certificate. Here, client-side Web Crypto
// computes standard SHA-256 hashes of canonicalized JSON.

import { useArthSetuStore } from '../store/useArthSetuStore';
import { generateSha256Fingerprint } from '../lib/cryptoFingerprint';

export interface CanonicalPassportPayload {
  version: '1.0';
  business: {
    name: string;
    category: string;
    city: string;
    state: string;
    yearsOperating: number;
  };
  observationPeriod: {
    startDate: string;
    endDate: string;
  };
  dimensions: {
    activity: string;
    completeness: string;
    patterns: string;
    reliability: string;
  };
  totals: {
    recordedSales: number;
    recordedSpending: number;
    netCashMovement: number;
    operatingDaysCovered: number;
  };
  evidenceBreakdown: Record<string, number>;
  generatedAt: string;
}

export interface IReportService {
  buildCanonicalJson(): CanonicalPassportPayload;
  computeFingerprint(payload?: CanonicalPassportPayload): Promise<string>;
  exportJsonFile(): void;
}

class LocalReportService implements IReportService {
  buildCanonicalJson(): CanonicalPassportPayload {
    const state = useArthSetuStore.getState();
    const txns = state.transactions;

    const recordedSales = txns
      .filter((t) => t.category === 'business_income')
      .reduce((s, t) => s + t.amount, 0);

    const recordedSpending = txns
      .filter((t) => t.direction === 'out' && t.category !== 'personal_transfer')
      .reduce((s, t) => s + t.amount, 0);

    const evidenceBreakdown: Record<string, number> = {};
    txns.forEach((t) => {
      const cls = t.evidence.class;
      evidenceBreakdown[cls] = (evidenceBreakdown[cls] || 0) + t.amount;
    });

    return {
      version: '1.0',
      business: {
        name: state.business.name,
        category: state.business.category,
        city: state.business.location.city,
        state: state.business.location.state,
        yearsOperating: state.business.yearsOperating,
      },
      observationPeriod: {
        startDate: '2025-11-01',
        endDate: '2026-10-31',
      },
      dimensions: {
        activity: 'Substantial',
        completeness: 'Substantial',
        patterns: 'Extensive',
        reliability: 'Substantial',
      },
      totals: {
        recordedSales,
        recordedSpending,
        netCashMovement: recordedSales - recordedSpending,
        operatingDaysCovered: state.diaryDays.filter((d) => d.cashSales > 0 || d.upiSales > 0).length,
      },
      evidenceBreakdown,
      generatedAt: '2026-10-31T00:00:00.000Z',
    };
  }

  async computeFingerprint(customPayload?: CanonicalPassportPayload): Promise<string> {
    const payload = customPayload || this.buildCanonicalJson();
    // Sort keys canonically
    const canonicalString = JSON.stringify(payload, Object.keys(payload).sort());
    return generateSha256Fingerprint(canonicalString);
  }

  exportJsonFile(): void {
    const payload = this.buildCanonicalJson();
    const str = JSON.stringify(payload, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArthSetu_Passport_${payload.business.name.replace(/\s+/g, '_')}_2026.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const reportService: IReportService = new LocalReportService();

