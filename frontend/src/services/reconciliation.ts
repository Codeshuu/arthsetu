import api, { ApiResponse } from './api';

export interface ReconciliationCandidate {
  reconciliation_id?: string;
  primary_transaction_id: string;
  matched_transaction_id: string;
  confidence_score: number;
  match_rule: string;
  rule_description?: string;
  primary_transaction: {
    id: string;
    transaction_date: string;
    amount: number;
    flow_type: string;
    payment_mode: string;
    description?: string;
    reference_number?: string;
    source_type?: string;
  };
  matched_transaction: {
    id: string;
    transaction_date: string;
    amount: number;
    flow_type: string;
    payment_mode: string;
    description?: string;
    reference_number?: string;
    source_type?: string;
  };
}

export interface ResolveReconciliationRequest {
  reconciliation_id: string;
  action: 'ACCEPT' | 'REJECT';
}

export interface ResolveReconciliationResponse {
  reconciliation_id: string;
  status: string;
  primary_status: string;
  matched_status: string;
}

export const reconciliationService = {
  async getCandidates(businessId: string): Promise<ReconciliationCandidate[]> {
    const res = await api.get<ApiResponse<{ candidates: ReconciliationCandidate[] }>>(
      '/reconciliation/candidates',
      { params: { business_id: businessId } }
    );
    const data = res.data.data || (res.data as any);
    return data?.candidates || (Array.isArray(data) ? data : []);
  },

  async resolveMatch(
    businessId: string,
    req: ResolveReconciliationRequest
  ): Promise<ResolveReconciliationResponse> {
    const res = await api.post<ApiResponse<ResolveReconciliationResponse>>(
      '/reconciliation/resolve',
      req,
      { params: { business_id: businessId } }
    );
    return res.data.data || (res.data as any);
  },
};

export default reconciliationService;
