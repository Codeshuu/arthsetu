// BusinessRepository interface & Local implementation
// NOTE: In a future cloud-backed architecture, a RemoteBusinessRepository would
// make REST/GraphQL calls to GET/PUT /api/v1/business/:id.

import { Business } from './types';
import { useArthSetuStore } from '../store/useArthSetuStore';

export interface IBusinessRepository {
  getActiveBusiness(): Business;
  updateBusiness(data: Partial<Business>): Promise<Business>;
  switchBusiness(businessId: string): Promise<Business>;
  resetToDemo(): Promise<void>;
}

class LocalBusinessRepository implements IBusinessRepository {
  getActiveBusiness(): Business {
    return useArthSetuStore.getState().business;
  }

  async updateBusiness(data: Partial<Business>): Promise<Business> {
    useArthSetuStore.getState().updateBusiness(data);
    return useArthSetuStore.getState().business;
  }

  async switchBusiness(businessId: string): Promise<Business> {
    useArthSetuStore.getState().switchBusiness(businessId);
    return useArthSetuStore.getState().business;
  }

  async resetToDemo(): Promise<void> {
    useArthSetuStore.getState().resetDemoData();
  }
}

export const businessRepository: IBusinessRepository = new LocalBusinessRepository();

