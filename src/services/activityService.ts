import { Activity } from '../types';
import { apiRequest } from './apiClient';

export const activityService = {
  async getActivities(filter?: { cityId?: string; category?: string; query?: string }): Promise<Activity[]> {
    const params = new URLSearchParams();
    if (filter?.cityId) params.append('cityId', filter.cityId);
    if (filter?.category && filter.category !== 'All') params.append('category', filter.category);
    if (filter?.query) params.append('query', filter.query);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ success: boolean; activities: Activity[] }>(`/activities${qs}`);
    return res.activities || [];
  },

  async createActivity(activityData: Activity): Promise<Activity> {
    const res = await apiRequest<{ success: boolean; activity: Activity }>('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
    return res.activity;
  },
};
