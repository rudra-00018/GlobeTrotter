import { City } from '../types';
import { apiRequest } from './apiClient';

export const cityService = {
  async getCities(filter?: { query?: string; region?: string; maxCost?: number }): Promise<City[]> {
    const params = new URLSearchParams();
    if (filter?.query) params.append('query', filter.query);
    if (filter?.region && filter.region !== 'All') params.append('region', filter.region);
    if (filter?.maxCost) params.append('maxCost', String(filter.maxCost));

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ success: boolean; cities: City[] }>(`/cities${qs}`);
    return res.cities || [];
  },

  async getCityById(id: string): Promise<City> {
    const res = await apiRequest<{ success: boolean; city: City }>(`/cities/${id}`);
    return res.city;
  },

  async createCity(cityData: City): Promise<City> {
    const res = await apiRequest<{ success: boolean; city: City }>('/cities', {
      method: 'POST',
      body: JSON.stringify(cityData),
    });
    return res.city;
  },

  async deleteCity(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/cities/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },
};
