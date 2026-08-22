import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { calculateTripFinancials } from '../../src/utils/tripHelpers';

export const adminRouter = Router();

// GET /api/admin/stats
adminRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const users = await db.getUsers();
    const trips = await db.getTrips();
    const cities = await db.getCities();
    const activities = await db.getActivities();

    const totalStops = trips.reduce((sum, t) => sum + t.stops.length, 0);
    const totalScheduledActivities = trips.reduce(
      (sum, t) => sum + t.stops.reduce((sSum, s) => sSum + s.activities.length, 0),
      0
    );

    const totalEstimatedSpend = trips.reduce((sum, t) => {
      const fin = calculateTripFinancials(t);
      return sum + fin.totalCost;
    }, 0);

    const avgSpendPerTrip = trips.length > 0 ? Math.round(totalEstimatedSpend / trips.length) : 0;

    // Destination popularity in trips
    const cityVisitCounts: Record<string, { name: string; country: string; count: number }> = {};
    trips.forEach((t) => {
      t.stops.forEach((s) => {
        const key = s.cityName;
        if (!cityVisitCounts[key]) {
          cityVisitCounts[key] = { name: s.cityName, country: s.country, count: 0 };
        }
        cityVisitCounts[key].count += 1;
      });
    });

    const topDestinations = Object.values(cityVisitCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Activity categories breakdown
    const categoryCounts: Record<string, number> = {};
    trips.forEach((t) => {
      t.stops.forEach((s) => {
        s.activities.forEach((a) => {
          categoryCounts[a.type] = (categoryCounts[a.type] || 0) + 1;
        });
      });
    });

    return res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalTrips: trips.length,
        totalStops,
        totalScheduledActivities,
        totalCatalogCities: cities.length,
        totalCatalogActivities: activities.length,
        totalEstimatedSpend,
        avgSpendPerTrip,
        topDestinations,
        categoryBreakdown: categoryCounts,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/reset
adminRouter.post('/reset', async (req: Request, res: Response) => {
  try {
    const freshDb = await db.resetSeed();
    return res.json({
      success: true,
      message: 'Database reset to initial sample data successfully.',
      tripsCount: freshDb.trips.length,
      citiesCount: freshDb.cities.length,
      usersCount: freshDb.users.length,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
