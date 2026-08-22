import { Activity, Stop, Trip } from '../types';
import { apiRequest } from './apiClient';

export const tripService = {
  async getTrips(authorId?: string): Promise<Trip[]> {
    const query = authorId ? `?authorId=${encodeURIComponent(authorId)}` : '';
    const res = await apiRequest<{ success: boolean; trips: Trip[] }>(`/trips${query}`);
    return res.trips || [];
  },

  async getPublicTrips(): Promise<Trip[]> {
    const res = await apiRequest<{ success: boolean; trips: Trip[] }>('/trips/public');
    return res.trips || [];
  },

  async getTripById(id: string): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(`/trips/${id}`);
    return res.trip;
  },

  async createTrip(tripData: Omit<Trip, 'id' | 'createdAt'> & { id?: string }): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
    return res.trip;
  },

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.trip;
  },

  async deleteTrip(id: string): Promise<boolean> {
    const res = await apiRequest<{ success: boolean }>(`/trips/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async duplicateTrip(id: string): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(`/trips/${id}/duplicate`, {
      method: 'POST',
    });
    return res.trip;
  },

  // Stop Actions
  async addStop(tripId: string, stopData: Omit<Stop, 'id' | 'order' | 'activities'>): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(`/trips/${tripId}/stops`, {
      method: 'POST',
      body: JSON.stringify(stopData),
    });
    return res.trip;
  },

  async updateStop(tripId: string, stopId: string, updates: Partial<Stop>): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(`/trips/${tripId}/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return res.trip;
  },

  async deleteStop(tripId: string, stopId: string): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(`/trips/${tripId}/stops/${stopId}`, {
      method: 'DELETE',
    });
    return res.trip;
  },

  async reorderStops(tripId: string, stopIndex: number, direction: 'up' | 'down'): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(`/trips/${tripId}/stops/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ stopIndex, direction }),
    });
    return res.trip;
  },

  // Activity Actions
  async addActivityToStop(tripId: string, stopId: string, activity: Activity): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(
      `/trips/${tripId}/stops/${stopId}/activities`,
      {
        method: 'POST',
        body: JSON.stringify(activity),
      }
    );
    return res.trip;
  },

  async removeActivityFromStop(tripId: string, stopId: string, activityId: string): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(
      `/trips/${tripId}/stops/${stopId}/activities/${activityId}`,
      {
        method: 'DELETE',
      }
    );
    return res.trip;
  },

  async reorderActivities(
    tripId: string,
    stopId: string,
    actIndex: number,
    direction: 'up' | 'down'
  ): Promise<Trip> {
    const res = await apiRequest<{ success: boolean; trip: Trip }>(
      `/trips/${tripId}/stops/${stopId}/activities/reorder`,
      {
        method: 'PATCH',
        body: JSON.stringify({ actIndex, direction }),
      }
    );
    return res.trip;
  },
};
