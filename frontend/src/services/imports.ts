import api, { ApiResponse } from './api';

export interface ImportUploadResponse {
  batch_id: string;
  file_name: string;
  file_hash: string;
  total_rows_detected: number;
  raw_columns: string[];
  sample_rows: Record<string, any>[];
  source_type: string;
  is_duplicate_batch: boolean;
}

export interface ColumnMappingDict {
  date_col?: string;
  amount_col?: string;
  credit_col?: string;
  debit_col?: string;
  description_col?: string;
  reference_col?: string;
  counterparty_col?: string;
  payment_mode_col?: string;
}

export interface ColumnMappingResponse {
  batch_id: string;
  valid_count: number;
  error_count: number;
  preview: Array<{
    transaction_date: string;
    amount: number;
    flow_type: string;
    payment_mode: string;
    category: string;
    description?: string;
    is_duplicate: boolean;
    validation_status: string;
    validation_errors?: string[];
  }>;
}

export interface BatchCommitResponse {
  batch_id: string;
  total_committed: number;
  duplicates_skipped: number;
  batch_status: string;
}

export const importService = {
  async uploadFile(
    file: File,
    businessId: string,
    sourceType: string = 'BANK_STATEMENT'
  ): Promise<ImportUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('business_id', businessId);
    formData.append('source_type', sourceType);

    const res = await api.post<ApiResponse<ImportUploadResponse>>('/imports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data || (res.data as any);
  },

  async mapColumns(
    batchId: string,
    businessId: string,
    mapping: ColumnMappingDict
  ): Promise<ColumnMappingResponse> {
    const res = await api.post<ApiResponse<ColumnMappingResponse>>(
      `/imports/${batchId}/map-columns`,
      { mapping },
      { params: { business_id: businessId } }
    );
    return res.data.data || (res.data as any);
  },

  async commitBatch(
    batchId: string,
    businessId: string,
    overwriteDuplicates: boolean = false
  ): Promise<BatchCommitResponse> {
    const res = await api.post<ApiResponse<BatchCommitResponse>>(
      `/imports/${batchId}/commit`,
      { overwrite_duplicates: overwriteDuplicates },
      { params: { business_id: businessId } }
    );
    return res.data.data || (res.data as any);
  },

  async getBatch(batchId: string, businessId: string): Promise<any> {
    const res = await api.get<ApiResponse<any>>(`/imports/${batchId}`, {
      params: { business_id: businessId },
    });
    return res.data.data || (res.data as any);
  },
};

export default importService;
