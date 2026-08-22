import { User } from '../types';
import { apiRequest, setAuthToken } from './apiClient';

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message?: string;
}

export const authService = {
  async login(email: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async register(name: string, email: string, language?: string, currency?: string): Promise<AuthResponse> {
    const res = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, language, currency }),
    });
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<User | null> {
    try {
      const res = await apiRequest<{ success: boolean; user: User }>('/auth/me');
      return res.user || null;
    } catch {
      return null;
    }
  },

  async getDemoUsers(): Promise<User[]> {
    try {
      const res = await apiRequest<{ success: boolean; users: User[] }>('/auth/demo-users');
      return res.users || [];
    } catch {
      return [];
    }
  },

  async logout(): Promise<void> {
    setAuthToken(null);
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {}
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await apiRequest<{ success: boolean; user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.user;
  },

  async toggleSavedDestination(cityId: string): Promise<string[]> {
    const res = await apiRequest<{ success: boolean; savedDestinations: string[]; user?: User }>(
      '/users/save-destination',
      {
        method: 'POST',
        body: JSON.stringify({ cityId }),
      }
    );
    return res.savedDestinations;
  },

  async deleteAccount(): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>('/users/account', {
      method: 'DELETE',
    });
    setAuthToken(null);
    return res.success;
  },
};
