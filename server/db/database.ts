import fs from 'fs';
import path from 'path';
import { Activity, City, Stop, Trip, User } from '../../src/types';
import {
  DEFAULT_USER,
  MOCK_ADMIN_USER,
  MOCK_USER,
  MOCK_ACTIVITIES,
  MOCK_CITIES,
  SEED_TRIPS,
} from '../../src/data/mockData';
import { config } from '../config';

export interface DatabaseSchema {
  users: User[];
  trips: Trip[];
  cities: City[];
  activities: Activity[];
  meta: {
    version: string;
    lastUpdated: string;
  };
}

class Database {
  private filePath: string;
  private memoryCache: DatabaseSchema | null = null;
  private isWriting = false;

  constructor(filePath: string) {
    this.filePath = filePath;
    this.ensureDbExists();
  }

  private getInitialData(): DatabaseSchema {
    return {
      users: [DEFAULT_USER, MOCK_USER, MOCK_ADMIN_USER],
      trips: JSON.parse(JSON.stringify(SEED_TRIPS)),
      cities: JSON.parse(JSON.stringify(MOCK_CITIES)),
      activities: JSON.parse(JSON.stringify(MOCK_ACTIVITIES)),
      meta: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  private ensureDbExists(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      const initial = this.getInitialData();
      fs.writeFileSync(this.filePath, JSON.stringify(initial, null, 2), 'utf-8');
      this.memoryCache = initial;
    }
  }

  private async read(): Promise<DatabaseSchema> {
    try {
      if (this.memoryCache) {
        return this.memoryCache;
      }
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      this.memoryCache = JSON.parse(data);
      return this.memoryCache!;
    } catch (err) {
      console.error('Error reading database, restoring seed data:', err);
      const initial = this.getInitialData();
      await this.write(initial);
      return initial;
    }
  }

  private async write(data: DatabaseSchema): Promise<void> {
    data.meta.lastUpdated = new Date().toISOString();
    this.memoryCache = data;
    try {
      const tempPath = `${this.filePath}.tmp`;
      await fs.promises.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.promises.rename(tempPath, this.filePath);
    } catch (err) {
      console.error('Failed to write database file:', err);
      await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    }
  }

  // --- Reset to seed ---
  public async resetSeed(): Promise<DatabaseSchema> {
    const fresh = this.getInitialData();
    await this.write(fresh);
    return fresh;
  }

  // ==================== USER OPERATIONS ====================
  public async getUsers(): Promise<User[]> {
    const db = await this.read();
    return db.users;
  }

  public async getUserById(id: string): Promise<User | null> {
    const db = await this.read();
    return db.users.find((u) => u.id === id) || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.read();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async createUser(userData: Omit<User, 'id'> & { id?: string }): Promise<User> {
    const db = await this.read();
    const newUser: User = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      photo: userData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      language: userData.language || 'English (US)',
      currency: userData.currency || 'USD ($)',
      savedDestinations: userData.savedDestinations || ['paris', 'tokyo', 'rome'],
      role: userData.role || (userData.email.includes('admin') ? 'admin' : 'user'),
      bio: userData.bio || 'Passionate world explorer planning unforgettable journeys.',
    };

    db.users.push(newUser);
    await this.write(db);
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const db = await this.read();
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    db.users[index] = { ...db.users[index], ...updates };
    await this.write(db);
    return db.users[index];
  }

  public async deleteUser(id: string): Promise<boolean> {
    const db = await this.read();
    const initialLen = db.users.length;
    db.users = db.users.filter((u) => u.id !== id);
    // Also remove user's trips
    db.trips = db.trips.filter((t) => t.authorId !== id);
    if (db.users.length !== initialLen) {
      await this.write(db);
      return true;
    }
    return false;
  }

  public async toggleSavedDestination(userId: string, cityId: string): Promise<string[]> {
    const db = await this.read();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const isSaved = user.savedDestinations.includes(cityId);
    if (isSaved) {
      user.savedDestinations = user.savedDestinations.filter((id) => id !== cityId);
    } else {
      user.savedDestinations.push(cityId);
    }

    await this.write(db);
    return user.savedDestinations;
  }

  // ==================== TRIP OPERATIONS ====================
  public async getTrips(options?: { authorId?: string; isPublic?: boolean }): Promise<Trip[]> {
    const db = await this.read();
    let trips = db.trips;

    if (options?.authorId) {
      trips = trips.filter((t) => t.authorId === options.authorId || !t.authorId);
    }
    if (options?.isPublic !== undefined) {
      trips = trips.filter((t) => t.isPublic === options.isPublic);
    }

    return trips;
  }

  public async getTripById(id: string): Promise<Trip | null> {
    const db = await this.read();
    return db.trips.find((t) => t.id === id) || null;
  }

  public async createTrip(tripData: Omit<Trip, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<Trip> {
    const db = await this.read();
    const newTrip: Trip = {
      ...tripData,
      id: tripData.id || `trip-${Date.now()}`,
      createdAt: tripData.createdAt || new Date().toISOString().split('T')[0],
      stops: tripData.stops || [],
      isPublic: tripData.isPublic ?? true,
      dailyBudget: tripData.dailyBudget ?? 150,
      transportCost: tripData.transportCost ?? 0,
      stayCostPerNight: tripData.stayCostPerNight ?? 100,
    };

    db.trips.unshift(newTrip);
    await this.write(db);
    return newTrip;
  }

  public async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | null> {
    const db = await this.read();
    const index = db.trips.findIndex((t) => t.id === id);
    if (index === -1) return null;

    db.trips[index] = { ...db.trips[index], ...updates };
    await this.write(db);
    return db.trips[index];
  }

  public async deleteTrip(id: string): Promise<boolean> {
    const db = await this.read();
    const initialLen = db.trips.length;
    db.trips = db.trips.filter((t) => t.id !== id);
    if (db.trips.length !== initialLen) {
      await this.write(db);
      return true;
    }
    return false;
  }

  public async duplicateTrip(id: string, author?: { id: string; name: string }): Promise<Trip | null> {
    const db = await this.read();
    const original = db.trips.find((t) => t.id === id);
    if (!original) return null;

    const cloned: Trip = {
      ...JSON.parse(JSON.stringify(original)),
      id: `trip-clone-${Date.now()}`,
      name: `${original.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      authorId: author?.id || original.authorId,
      authorName: author?.name || original.authorName,
    };

    db.trips.unshift(cloned);
    await this.write(db);
    return cloned;
  }

  // --- Stop sub-operations ---
  public async addStop(tripId: string, stopData: Omit<Stop, 'id' | 'order' | 'activities'>): Promise<Trip | null> {
    const db = await this.read();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const newStop: Stop = {
      ...stopData,
      id: `stop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      order: trip.stops.length + 1,
      activities: [],
    };

    trip.stops.push(newStop);
    await this.write(db);
    return trip;
  }

  public async updateStop(tripId: string, stopId: string, updates: Partial<Stop>): Promise<Trip | null> {
    const db = await this.read();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const stopIndex = trip.stops.findIndex((s) => s.id === stopId);
    if (stopIndex === -1) return null;

    trip.stops[stopIndex] = { ...trip.stops[stopIndex], ...updates };
    await this.write(db);
    return trip;
  }

  public async deleteStop(tripId: string, stopId: string): Promise<Trip | null> {
    const db = await this.read();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    trip.stops = trip.stops
      .filter((s) => s.id !== stopId)
      .map((s, idx) => ({ ...s, order: idx + 1 }));

    await this.write(db);
    return trip;
  }

  public async reorderStops(tripId: string, stopIndex: number, direction: 'up' | 'down'): Promise<Trip | null> {
    const db = await this.read();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const targetIndex = direction === 'up' ? stopIndex - 1 : stopIndex + 1;
    if (targetIndex < 0 || targetIndex >= trip.stops.length) return trip;

    const temp = trip.stops[stopIndex];
    trip.stops[stopIndex] = trip.stops[targetIndex];
    trip.stops[targetIndex] = temp;

    trip.stops = trip.stops.map((s, idx) => ({ ...s, order: idx + 1 }));
    await this.write(db);
    return trip;
  }

  // --- Activity sub-operations ---
  public async addActivityToStop(tripId: string, stopId: string, activity: Activity): Promise<Trip | null> {
    const db = await this.read();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop) return null;

    const actToAdd: Activity = {
      ...activity,
      id: activity.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    stop.activities.push(actToAdd);
    await this.write(db);
    return trip;
  }

  public async removeActivityFromStop(tripId: string, stopId: string, activityId: string): Promise<Trip | null> {
    const db = await this.read();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop) return null;

    stop.activities = stop.activities.filter((a) => a.id !== activityId);
    await this.write(db);
    return trip;
  }

  public async reorderActivitiesInStop(
    tripId: string,
    stopId: string,
    actIndex: number,
    direction: 'up' | 'down'
  ): Promise<Trip | null> {
    const db = await this.read();
    const trip = db.trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const stop = trip.stops.find((s) => s.id === stopId);
    if (!stop) return null;

    const targetIdx = direction === 'up' ? actIndex - 1 : actIndex + 1;
    if (targetIdx < 0 || targetIdx >= stop.activities.length) return trip;

    const temp = stop.activities[actIndex];
    stop.activities[actIndex] = stop.activities[targetIdx];
    stop.activities[targetIdx] = temp;

    await this.write(db);
    return trip;
  }

  // ==================== CITIES & ACTIVITIES ====================
  public async getCities(filter?: { query?: string; region?: string; maxCost?: number }): Promise<City[]> {
    const db = await this.read();
    let cities = db.cities;

    if (filter?.region && filter.region !== 'All') {
      cities = cities.filter((c) => c.region === filter.region);
    }
    if (filter?.maxCost) {
      cities = cities.filter((c) => c.costIndex <= filter.maxCost!);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      cities = cities.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.topAttractions.some((a) => a.toLowerCase().includes(q))
      );
    }

    return cities;
  }

  public async getCityById(id: string): Promise<City | null> {
    const db = await this.read();
    return db.cities.find((c) => c.id.toLowerCase() === id.toLowerCase()) || null;
  }

  public async createCity(cityData: City): Promise<City> {
    const db = await this.read();
    const existingIdx = db.cities.findIndex((c) => c.id === cityData.id);
    if (existingIdx !== -1) {
      db.cities[existingIdx] = cityData;
    } else {
      db.cities.push(cityData);
    }
    await this.write(db);
    return cityData;
  }

  public async deleteCity(id: string): Promise<boolean> {
    const db = await this.read();
    const initLen = db.cities.length;
    db.cities = db.cities.filter((c) => c.id !== id);
    if (db.cities.length !== initLen) {
      await this.write(db);
      return true;
    }
    return false;
  }

  public async getActivities(filter?: { cityId?: string; category?: string; query?: string }): Promise<Activity[]> {
    const db = await this.read();
    let acts = db.activities;

    if (filter?.cityId) {
      acts = acts.filter((a) => a.cityId?.toLowerCase() === filter.cityId?.toLowerCase());
    }
    if (filter?.category && filter.category !== 'All') {
      acts = acts.filter((a) => a.type === filter.category);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      acts = acts.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.location && a.location.toLowerCase().includes(q))
      );
    }

    return acts;
  }

  public async createActivity(activityData: Activity): Promise<Activity> {
    const db = await this.read();
    const newAct: Activity = {
      ...activityData,
      id: activityData.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    db.activities.push(newAct);
    await this.write(db);
    return newAct;
  }
}

export const db = new Database(config.dbPath);
