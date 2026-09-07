import { api } from './api';
import { Tenant, PaginatedResponse } from '../types';

export const tenantService = {
  async getActiveCities(): Promise<Tenant[]> {
    return api.get('/tenants/active-cities');
  },

  async getBySlug(slug: string): Promise<Tenant> {
    return api.get(`/tenants/by-slug/${slug}`);
  },

  async getById(id: string): Promise<Tenant> {
    return api.get(`/tenants/${id}`);
  },

  async getAll(params?: any): Promise<PaginatedResponse<Tenant>> {
    return api.get('/tenants', { params });
  },

  async create(data: any): Promise<Tenant> {
    return api.post('/tenants', data);
  },

  async update(id: string, data: any): Promise<Tenant> {
    return api.put(`/tenants/${id}`, data);
  },
};
