import { api } from './api';
import { AdvertisementItem, AdPlacement, PaginatedResponse } from '../types';

export const adsService = {
  async serveAds(placement: AdPlacement, tenantId?: string, limit = 2): Promise<AdvertisementItem[]> {
    return api.get('/advertisements/serve', {
      params: { placement, tenantId, limit },
    });
  },

  async trackClick(id: string): Promise<{ success: boolean; targetUrl: string }> {
    return api.post(`/advertisements/${id}/click`);
  },

  async getAll(params?: any): Promise<PaginatedResponse<AdvertisementItem>> {
    return api.get('/advertisements', { params });
  },

  async create(data: any): Promise<AdvertisementItem> {
    return api.post('/advertisements', data);
  },

  async delete(id: string): Promise<{ message: string }> {
    return api.delete(`/advertisements/${id}`);
  },
};
