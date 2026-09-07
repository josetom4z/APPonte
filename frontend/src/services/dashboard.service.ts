import { api } from './api';

export const dashboardService = {
  async getPublicStats(): Promise<{
    totalRequests: number;
    totalResolved: number;
    totalCities: number;
    totalCitizens: number;
    resolutionRate: number;
  }> {
    return api.get('/dashboard/public-stats');
  },

  async getCitizenDashboard(): Promise<any> {
    return api.get('/dashboard/citizen');
  },

  async getOperatorDashboard(): Promise<any> {
    return api.get('/dashboard/operator');
  },

  async getSecretaryDashboard(): Promise<any> {
    return api.get('/dashboard/secretary');
  },

  async getAdminDashboard(tenantId?: string): Promise<any> {
    return api.get('/dashboard/admin', { params: { tenantId } });
  },
};
