import api, { ApiResponse } from './api';

export interface GeneratePassportRequest {
  business_id: string;
  period_start?: string;
  period_end?: string;
}

export interface PassportMetadata {
  token: string;
  business_id: string;
  period_start: string;
  period_end: string;
  sha256_hash: string;
  overall_evidence_score: number;
  download_url: string;
  created_at: string;
  metrics_snapshot?: Record<string, any>;
}

export const passportService = {
  async generatePassport(req: GeneratePassportRequest): Promise<PassportMetadata> {
    const res = await api.post<ApiResponse<PassportMetadata>>('/passports/generate', req);
    return res.data.data || (res.data as any);
  },

  async getPassportMetadata(token: string): Promise<PassportMetadata> {
    const res = await api.get<ApiResponse<PassportMetadata>>(`/passports/${token}`);
    return res.data.data || (res.data as any);
  },

  async downloadPassportPdf(token: string): Promise<Blob> {
    const res = await api.get(`/passports/${token}/download`, {
      responseType: 'blob',
    });
    return res.data;
  },
};

export default passportService;
