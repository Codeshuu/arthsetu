import api, { ApiResponse } from './api';

export type FlowType = 'INFLOW' | 'OUTFLOW';
export type PaymentMode = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';
export type VerificationStatus = 'UNVERIFIED' | 'SELF_ATTESTED' | 'SYSTEM_RECONCILED' | 'MANUALLY_VERIFIED';

export interface BackendTransaction {
  id: string;
  business_id: string;
  source_id?: string;
  import_row_id?: string;
  transaction_date: string;
  amount: number;
  flow_type: FlowType;
  payment_mode: PaymentMode;
  category: string;
  description?: string;
  reference_number?: string;
  counterparty_name?: string;
  verification_status: VerificationStatus;
  is_duplicate: boolean;
  metadata_json?: Record<string, any>;
  created_at?: string;
}

export interface TransactionFilterParams {
  business_id: string;
  start_date?: string;
  end_date?: string;
  flow_type?: FlowType;
  page?: number;
  limit?: number;
}

export interface TransactionListResponse {
  items: BackendTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTransactionRequest {
  business_id: string;
  transaction_date: string;
  amount: number;
  flow_type: FlowType;
  payment_mode: PaymentMode;
  category: string;
  description?: string;
  reference_number?: string;
  counterparty_name?: string;
  metadata_json?: Record<string, any>;
}

export const transactionService = {
  async getTransactions(params: TransactionFilterParams): Promise<TransactionListResponse> {
    const res = await api.get<ApiResponse<TransactionListResponse>>('/transactions', {
      params,
    });
    return res.data.data || (res.data as any);
  },

  async createTransaction(data: CreateTransactionRequest): Promise<BackendTransaction> {
    const res = await api.post<ApiResponse<BackendTransaction>>('/transactions', data);
    return res.data.data || (res.data as any);
  },
};

export default transactionService;
