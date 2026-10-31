import api, { ApiResponse } from './api';

export interface SummaryMetrics {
  recorded_sales: number;
  recorded_expenses: number;
  net_recorded_cash_movement: number;
  digital_sales_share_pct: number;
  expense_to_sales_ratio: number;
  total_transactions_count: number;
  period_start?: string;
  period_end?: string;
}

export interface CompletenessMetrics {
  total_operating_days: number;
  active_days_count: number;
  operating_day_coverage_pct: number;
  longest_active_streak_days: number;
  missing_dates: string[];
  record_continuity_score: number;
}

export interface AnomalyItem {
  transaction_id: string;
  transaction_date: string;
  amount: number;
  flow_type: string;
  payment_mode: string;
  description?: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  label: string; // 'Unusual Activity Requiring Owner Verification'
}

export interface EvidenceDimension {
  name: string;
  weight: number;
  raw_score: number;
  weighted_score: number;
  description: string;
}

export interface EvidenceQualityScore {
  overall_score: number;
  tier: string;
  dimensions: EvidenceDimension[];
}

export const analysisService = {
  async getSummary(businessId: string, startDate?: string, endDate?: string): Promise<SummaryMetrics> {
    const res = await api.get<ApiResponse<SummaryMetrics>>('/analysis/summary', {
      params: { business_id: businessId, start_date: startDate, end_date: endDate },
    });
    return res.data.data || (res.data as any);
  },

  async getCompleteness(businessId: string, startDate?: string, endDate?: string): Promise<CompletenessMetrics> {
    const res = await api.get<ApiResponse<CompletenessMetrics>>('/analysis/completeness', {
      params: { business_id: businessId, start_date: startDate, end_date: endDate },
    });
    return res.data.data || (res.data as any);
  },

  async getAnomalies(businessId: string): Promise<AnomalyItem[]> {
    const res = await api.get<ApiResponse<{ anomalies: AnomalyItem[] }>>('/analysis/anomalies', {
      params: { business_id: businessId },
    });
    const data = res.data.data || (res.data as any);
    return data?.anomalies || (Array.isArray(data) ? data : []);
  },

  async getEvidenceQuality(businessId: string): Promise<EvidenceQualityScore> {
    const res = await api.get<ApiResponse<EvidenceQualityScore>>('/analysis/evidence-quality', {
      params: { business_id: businessId },
    });
    return res.data.data || (res.data as any);
  },
};

export default analysisService;
