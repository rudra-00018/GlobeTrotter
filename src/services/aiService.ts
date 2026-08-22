import { Trip } from '../types';
import { apiRequest } from './apiClient';

export interface GenerateItineraryParams {
  destination: string;
  durationDays: number;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  vibe: 'culture' | 'foodie' | 'adventure' | 'relaxation' | 'balanced';
  travelers: 'solo' | 'couple' | 'family' | 'friends';
}

export const aiService = {
  async generateItinerary(params: GenerateItineraryParams): Promise<{ trip: Trip; source: string }> {
    const res = await apiRequest<{ success: boolean; trip: Trip; source: string }>('/ai/generate-itinerary', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return { trip: res.trip, source: res.source };
  },

  async suggestActivities(cityName: string, category?: string, interest?: string): Promise<any[]> {
    const res = await apiRequest<{ success: boolean; suggestions: any[]; source: string }>(
      '/ai/suggest-activities',
      {
        method: 'POST',
        body: JSON.stringify({ cityName, category, interest }),
      }
    );
    return res.suggestions || [];
  },

  async askCopilot(prompt: string, tripContext?: any): Promise<string> {
    const res = await apiRequest<{ success: boolean; advice: string; source: string }>('/ai/travel-copilot', {
      method: 'POST',
      body: JSON.stringify({ prompt, tripContext }),
    });
    return res.advice;
  },
};
