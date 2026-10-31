import api, { ApiResponse } from './api';

export interface BusinessProfile {
  id: string;
  owner_user_id?: string;
  legal_name: string;
  trade_name?: string;
  gstin?: string;
  pan?: string;
  business_type?: string;
  operating_since?: string;
  address?: string;
  phone?: string;
  created_at?: string;
}

export interface CreateBusinessRequest {
  legal_name: string;
  trade_name?: string;
  gstin?: string;
  pan?: string;
  business_type?: string;
  operating_since?: string;
  address?: string;
  phone?: string;
}

export const businessService = {
  async getBusinesses(): Promise<BusinessProfile[]> {
    const res = await api.get<ApiResponse<BusinessProfile[]>>('/businesses');
    return res.data.data || (res.data as any) || [];
  },

  async createBusiness(data: CreateBusinessRequest): Promise<BusinessProfile> {
    const res = await api.post<ApiResponse<BusinessProfile>>('/businesses', data);
    return res.data.data || (res.data as any);
  },

  getActiveBusinessId(): string | null {
    return localStorage.getItem('active_business_id');
  },

  setActiveBusinessId(id: string): void {
    localStorage.setItem('active_business_id', id);
  },
};

export default businessService;
