import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const cityRouter = Router();

// GET /api/cities
cityRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { query, region, maxCost } = req.query;
    const cities = await db.getCities({
      query: query as string | undefined,
      region: region as string | undefined,
      maxCost: maxCost ? Number(maxCost) : undefined,
    });
    return res.json({ success: true, cities, count: cities.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cities/:id
cityRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const city = await db.getCityById(req.params.id);
    if (!city) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }
    return res.json({ success: true, city });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cities (Admin/Custom)
cityRouter.post('/', async (req: Request, res: Response) => {
  try {
    const cityData = req.body;
    if (!cityData.name || !cityData.country) {
      return res.status(400).json({ success: false, error: 'City name and country are required' });
    }

    const newCity = await db.createCity({
      id: cityData.id || cityData.name.toLowerCase().replace(/\s+/g, '-'),
      name: cityData.name,
      country: cityData.country,
      region: cityData.region || 'Europe',
      costIndex: cityData.costIndex || 3,
      popularity: cityData.popularity || 85,
      image: cityData.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
      description: cityData.description || `Explore the captivating sights and vibrant culture of ${cityData.name}.`,
      topAttractions: cityData.topAttractions || ['City Center', 'Historic Quarter', 'Local Market'],
      avgDailyCost: cityData.avgDailyCost || 120,
      weather: cityData.weather || '20°C Sunny',
      rating: cityData.rating || 4.7,
    });

    return res.status(201).json({ success: true, city: newCity });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cities/:id
cityRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await db.deleteCity(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }
    return res.json({ success: true, message: 'City deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
