import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { Trip } from '../../src/types';

export const tripRouter = Router();

// GET /api/trips
tripRouter.get('/', async (req: Request, res: Response) => {
  try {
    const authorId = req.query.authorId as string | undefined;
    const isPublicQuery = req.query.isPublic as string | undefined;
    const isPublic = isPublicQuery !== undefined ? isPublicQuery === 'true' : undefined;

    const trips = await db.getTrips({ authorId, isPublic });
    return res.json({ success: true, trips, count: trips.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trips/public
tripRouter.get('/public', async (req: Request, res: Response) => {
  try {
    const trips = await db.getTrips({ isPublic: true });
    return res.json({ success: true, trips, count: trips.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/trips/:id
tripRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const trip = await db.getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    return res.json({ success: true, trip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trips
tripRouter.post('/', async (req: Request, res: Response) => {
  try {
    const tripData = req.body;
    if (!tripData.name) {
      return res.status(400).json({ success: false, error: 'Trip name is required' });
    }

    const currentUserName = req.currentUser?.name || tripData.authorName || 'Explorer';
    const currentUserId = req.currentUser?.id || tripData.authorId;

    const newTrip = await db.createTrip({
      ...tripData,
      authorId: currentUserId,
      authorName: currentUserName,
      stops: tripData.stops || [],
    });

    return res.status(201).json({ success: true, trip: newTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/trips/:id
tripRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateTrip(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    return res.json({ success: true, trip: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id
tripRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteTrip(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    return res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/trips/:id/duplicate
tripRouter.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const author = req.currentUser ? { id: req.currentUser.id, name: req.currentUser.name } : undefined;
    const cloned = await db.duplicateTrip(req.params.id, author);
    if (!cloned) {
      return res.status(404).json({ success: false, error: 'Original trip not found' });
    }
    return res.status(201).json({ success: true, trip: cloned });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== STOP MANAGEMENT ====================

// POST /api/trips/:id/stops
tripRouter.post('/:id/stops', async (req: Request, res: Response) => {
  try {
    const { cityId, cityName, country, startDate, endDate, notes, stayCostPerNight, transportToNextCost } = req.body;
    if (!cityName) {
      return res.status(400).json({ success: false, error: 'cityName is required' });
    }

    const updatedTrip = await db.addStop(req.params.id, {
      cityId: cityId || cityName.toLowerCase().replace(/\s+/g, '-'),
      cityName,
      country: country || 'Unknown',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      notes,
      stayCostPerNight: stayCostPerNight !== undefined ? Number(stayCostPerNight) : 100,
      transportToNextCost: transportToNextCost !== undefined ? Number(transportToNextCost) : 0,
    });

    if (!updatedTrip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    return res.json({ success: true, trip: updatedTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/trips/:id/stops/:stopId
tripRouter.put('/:id/stops/:stopId', async (req: Request, res: Response) => {
  try {
    const updatedTrip = await db.updateStop(req.params.id, req.params.stopId, req.body);
    if (!updatedTrip) {
      return res.status(404).json({ success: false, error: 'Trip or Stop not found' });
    }
    return res.json({ success: true, trip: updatedTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id/stops/:stopId
tripRouter.delete('/:id/stops/:stopId', async (req: Request, res: Response) => {
  try {
    const updatedTrip = await db.deleteStop(req.params.id, req.params.stopId);
    if (!updatedTrip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    return res.json({ success: true, trip: updatedTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/trips/:id/stops/reorder
tripRouter.patch('/:id/stops/reorder', async (req: Request, res: Response) => {
  try {
    const { stopIndex, direction } = req.body;
    if (stopIndex === undefined || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Invalid stopIndex or direction' });
    }

    const updatedTrip = await db.reorderStops(req.params.id, Number(stopIndex), direction);
    if (!updatedTrip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    return res.json({ success: true, trip: updatedTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== ACTIVITY MANAGEMENT ====================

// POST /api/trips/:id/stops/:stopId/activities
tripRouter.post('/:id/stops/:stopId/activities', async (req: Request, res: Response) => {
  try {
    const activity = req.body;
    if (!activity.name) {
      return res.status(400).json({ success: false, error: 'Activity name is required' });
    }

    const updatedTrip = await db.addActivityToStop(req.params.id, req.params.stopId, activity);
    if (!updatedTrip) {
      return res.status(404).json({ success: false, error: 'Trip or Stop not found' });
    }
    return res.json({ success: true, trip: updatedTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/trips/:id/stops/:stopId/activities/:activityId
tripRouter.delete('/:id/stops/:stopId/activities/:activityId', async (req: Request, res: Response) => {
  try {
    const updatedTrip = await db.removeActivityFromStop(req.params.id, req.params.stopId, req.params.activityId);
    if (!updatedTrip) {
      return res.status(404).json({ success: false, error: 'Trip or Stop not found' });
    }
    return res.json({ success: true, trip: updatedTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/trips/:id/stops/:stopId/activities/reorder
tripRouter.patch('/:id/stops/:stopId/activities/reorder', async (req: Request, res: Response) => {
  try {
    const { actIndex, direction } = req.body;
    if (actIndex === undefined || !['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, error: 'Invalid actIndex or direction' });
    }

    const updatedTrip = await db.reorderActivitiesInStop(req.params.id, req.params.stopId, Number(actIndex), direction);
    if (!updatedTrip) {
      return res.status(404).json({ success: false, error: 'Trip or Stop not found' });
    }
    return res.json({ success: true, trip: updatedTrip });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
