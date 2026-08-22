import { apiRequest } from './apiClient';

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalStops: number;
  totalScheduledActivities: number;
  totalCatalogCities: number;
  totalCatalogActivities: number;
  totalEstimatedSpend: number;
  avgSpendPerTrip: number;
  topDestinations: Array<{ name: string; country: string; count: number }>;
  categoryBreakdown: Record<string, number>;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const res = await apiRequest<{ success: boolean; stats: AdminStats }>('/admin/stats');
    return res.stats;
  },

  async resetSeedData(): Promise<{ success: boolean; message: string }> {
    const res = await apiRequest<{ success: boolean; message: string }>('/admin/reset', {
      method: 'POST',
    });
    return res;
  },

  async checkHealth(): Promise<{ status: string; geminiConfigured: boolean; database: any }> {
    try {
      return await apiRequest('/health');
    } catch (e: any) {
      return { status: 'offline', geminiConfigured: false, database: null };
    }
  },
};
