export type ActivityCategory =
  | 'Sightseeing'
  | 'Food & Culinary'
  | 'Adventure & Nature'
  | 'Culture & Arts'
  | 'Relaxation'
  | 'Nightlife';

export interface Activity {
  id: string;
  name: string;
  type: ActivityCategory;
  cost: number;
  durationHours: number;
  description: string;
  image: string;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  assignedDate?: string;
  cityId?: string;
  location?: string;
}

export interface Stop {
  id: string;
  cityId: string;
  cityName: string;
  country: string;
  startDate: string;
  endDate: string;
  order: number;
  notes?: string;
  activities: Activity[];
  stayCostPerNight?: number;
  transportToNextCost?: number;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  coverPhoto: string;
  dailyBudget: number;
  transportCost: number;
  stayCostPerNight: number;
  stops: Stop[];
  isPublic: boolean;
  createdAt: string;
  authorId?: string;
  authorName?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Americas' | 'Africa & Middle East' | 'Oceania';
  costIndex: 1 | 2 | 3 | 4 | 5; // 1 = budget ($), 5 = luxury ($$$$$)
  popularity: number; // 0 - 100
  image: string;
  description: string;
  topAttractions: string[];
  avgDailyCost: number;
  weather: string;
  rating: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  language: string;
  currency: string;
  savedDestinations: string[]; // City IDs
  role: 'user' | 'admin';
  bio?: string;
}

export type ViewType =
  | 'dashboard'
  | 'my-trips'
  | 'itinerary-builder'
  | 'itinerary-view'
  | 'city-search'
  | 'activity-search'
  | 'budget'
  | 'calendar'
  | 'public-share'
  | 'profile'
  | 'admin'
  | 'auth';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}
