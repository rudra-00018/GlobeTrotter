import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { Activity } from '../../src/types';

export const activityRouter = Router();

// GET /api/activities
activityRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { cityId, category, query } = req.query;
    const activities = await db.getActivities({
      cityId: cityId as string | undefined,
      category: category as string | undefined,
      query: query as string | undefined,
    });
    return res.json({ success: true, activities, count: activities.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/activities
activityRouter.post('/', async (req: Request, res: Response) => {
  try {
    const actData = req.body;
    if (!actData.name || !actData.type) {
      return res.status(400).json({ success: false, error: 'Activity name and type/category are required' });
    }

    const created = await db.createActivity({
      id: actData.id || `act-${Date.now()}`,
      name: actData.name,
      type: actData.type,
      cost: actData.cost || 0,
      durationHours: actData.durationHours || 2,
      description: actData.description || 'Exciting travel experience.',
      image: actData.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
      timeOfDay: actData.timeOfDay || 'Morning',
      cityId: actData.cityId,
      location: actData.location,
    });

    return res.status(201).json({ success: true, activity: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
