import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { db } from '../db/database';
import { Activity, Stop, Trip } from '../../src/types';

export const aiRouter = Router();

// Helper to safely initialize Gemini
const getGeminiClient = () => {
  if (config.geminiApiKey && config.geminiApiKey !== 'MY_GEMINI_API_KEY') {
    try {
      return new GoogleGenAI({ apiKey: config.geminiApiKey });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return null;
};

// POST /api/ai/generate-itinerary
aiRouter.post('/generate-itinerary', async (req: Request, res: Response) => {
  try {
    const {
      destination = 'Paris & Rome',
      durationDays = 7,
      budgetTier = 'moderate',
      vibe = 'balanced',
      travelers = 'solo',
    } = req.body;

    const availableCities = await db.getCities();
    const availableActivities = await db.getActivities();

    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const prompt = `You are a world-class luxury travel concierge. Create a detailed multi-stop travel itinerary for:
- Destination(s): ${destination}
- Duration: ${durationDays} days
- Budget Tier: ${budgetTier} (budget = $75/day, moderate = $150/day, luxury = $350/day)
- Vibe / Travel Style: ${vibe}
- Travelers: ${travelers}

Respond ONLY with valid JSON (no markdown formatting, no code fences) following this exact schema:
{
  "name": "Trip Title (e.g. Grand Italian & French Discovery)",
  "description": "Engaging 2-sentence summary of the journey",
  "coverPhoto": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  "dailyBudget": 150,
  "transportCost": 200,
  "stayCostPerNight": 120,
  "stops": [
    {
      "cityName": "Paris",
      "country": "France",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "stayCostPerNight": 140,
      "notes": "Explore romantic landmarks and culinary quarters",
      "activities": [
        {
          "name": "Sunset Seine River Cruise",
          "type": "Sightseeing",
          "cost": 35,
          "durationHours": 2,
          "description": "Glide past illuminated monuments with champagne.",
          "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
          "timeOfDay": "Evening"
        }
      ]
    }
  ]
}`;

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);

        const now = new Date();
        const start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week from now
        const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const generatedTrip: Omit<Trip, 'id' | 'createdAt'> = {
          name: parsed.name || `${destination} Adventure`,
          description: parsed.description || `A customized ${durationDays}-day journey exploring ${destination}.`,
          coverPhoto: parsed.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          dailyBudget: parsed.dailyBudget || (budgetTier === 'luxury' ? 350 : budgetTier === 'budget' ? 75 : 150),
          transportCost: parsed.transportCost || 180,
          stayCostPerNight: parsed.stayCostPerNight || 120,
          isPublic: true,
          authorName: req.currentUser?.name || 'AI Concierge',
          authorId: req.currentUser?.id,
          stops: (parsed.stops || []).map((s: any, idx: number) => ({
            id: `stop-ai-${Date.now()}-${idx}`,
            cityId: s.cityName?.toLowerCase().replace(/\s+/g, '-') || `city-${idx}`,
            cityName: s.cityName,
            country: s.country || 'Destination',
            startDate: s.startDate || start.toISOString().split('T')[0],
            endDate: s.endDate || end.toISOString().split('T')[0],
            order: idx + 1,
            notes: s.notes || 'Explore top landmarks and hidden gems.',
            stayCostPerNight: s.stayCostPerNight || 120,
            transportToNextCost: s.transportToNextCost || 45,
            activities: (s.activities || []).map((a: any, aIdx: number) => ({
              id: `act-ai-${Date.now()}-${idx}-${aIdx}`,
              name: a.name,
              type: a.type || 'Sightseeing',
              cost: a.cost || 25,
              durationHours: a.durationHours || 2,
              description: a.description || 'Curated travel activity.',
              image: a.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
              timeOfDay: a.timeOfDay || 'Morning',
            })),
          })),
        };

        const savedTrip = await db.createTrip(generatedTrip);
        return res.json({ success: true, trip: savedTrip, source: 'gemini' });
      } catch (geminiError) {
        console.warn('Gemini generation fallback triggered:', geminiError);
      }
    }

    // Heuristic Smart Generator (Fallback & Offline)
    const targetCityNames = destination.split(/[,&+/|]+/).map((s: string) => s.trim().toLowerCase());
    let matchedCities = availableCities.filter((c) =>
      targetCityNames.some((query: string) => c.name.toLowerCase().includes(query) || query.includes(c.name.toLowerCase()))
    );

    if (matchedCities.length === 0) {
      matchedCities = [availableCities[0], availableCities[1] || availableCities[0]];
    }

    const today = new Date();
    const startDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const daysPerStop = Math.max(1, Math.floor(durationDays / matchedCities.length));

    const stops: Stop[] = matchedCities.map((city, idx) => {
      const stopStart = new Date(startDate.getTime() + idx * daysPerStop * 24 * 60 * 60 * 1000);
      const stopEnd = new Date(stopStart.getTime() + daysPerStop * 24 * 60 * 60 * 1000);

      const cityActivities = availableActivities.filter((a) => a.cityId === city.id);
      const chosenActs = (cityActivities.length > 0 ? cityActivities : availableActivities).slice(0, 3);

      return {
        id: `stop-ai-${Date.now()}-${idx}`,
        cityId: city.id,
        cityName: city.name,
        country: city.country,
        startDate: stopStart.toISOString().split('T')[0],
        endDate: stopEnd.toISOString().split('T')[0],
        order: idx + 1,
        notes: `Focus on ${vibe} experiences in ${city.name}. Top highlights: ${city.topAttractions.join(', ')}.`,
        stayCostPerNight: city.avgDailyCost,
        transportToNextCost: idx < matchedCities.length - 1 ? 50 : 0,
        activities: chosenActs.map((a, aIdx) => ({
          ...a,
          id: `act-ai-${Date.now()}-${idx}-${aIdx}`,
          assignedDate: stopStart.toISOString().split('T')[0],
        })),
      };
    });

    const budgetMultiplier = budgetTier === 'luxury' ? 2.2 : budgetTier === 'budget' ? 0.7 : 1.2;
    const baseDaily = Math.round(
      (matchedCities.reduce((acc, c) => acc + c.avgDailyCost, 0) / matchedCities.length) * budgetMultiplier
    );

    const fallbackTrip = await db.createTrip({
      name: `${matchedCities.map((c) => c.name).join(' & ')} ${vibe.charAt(0).toUpperCase() + vibe.slice(1)} Tour`,
      description: `A masterfully curated ${durationDays}-day journey through ${matchedCities.map((c) => c.name).join(' and ')}, tailored for ${travelers} with ${budgetTier} budget priorities.`,
      coverPhoto: matchedCities[0]?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dailyBudget: baseDaily,
      transportCost: matchedCities.length * 60,
      stayCostPerNight: Math.round(baseDaily * 0.75),
      isPublic: true,
      authorName: req.currentUser?.name || 'AI Travel Concierge',
      authorId: req.currentUser?.id,
      stops,
    });

    return res.json({ success: true, trip: fallbackTrip, source: 'smart-generator' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/suggest-activities
aiRouter.post('/suggest-activities', async (req: Request, res: Response) => {
  try {
    const { cityName, category, interest } = req.body;
    if (!cityName) {
      return res.status(400).json({ success: false, error: 'cityName is required' });
    }

    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const prompt = `Suggest 3 top rated, authentic travel activities for ${cityName}. Category focus: ${category || 'Sightseeing'}, Interest: ${interest || 'culture and landmarks'}.
Respond with JSON array of objects with keys: name, type, cost, durationHours, description, timeOfDay.`;

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const suggestions = JSON.parse(response.text || '[]');
        return res.json({ success: true, suggestions, source: 'gemini' });
      } catch (e) {
        console.warn('Gemini activity suggestion error:', e);
      }
    }

    // Fallback suggestions
    const dbActivities = await db.getActivities({ query: cityName });
    const suggestions = dbActivities.length > 0 ? dbActivities.slice(0, 3) : [
      {
        name: `Highlights & Heritage Walk in ${cityName}`,
        type: 'Sightseeing',
        cost: 25,
        durationHours: 2.5,
        description: `Immerse in the historic quarters and iconic landmarks of ${cityName} with local storyteller.`,
        timeOfDay: 'Morning',
      },
      {
        name: `Authentic Gourmet & Street Food Trail`,
        type: 'Food & Culinary',
        cost: 45,
        durationHours: 3,
        description: `Sample regional delicacies, artisan bakeries, and seasonal tastings in ${cityName}.`,
        timeOfDay: 'Afternoon',
      },
      {
        name: `Sunset Panoramic Rooftop Experience`,
        type: 'Relaxation',
        cost: 30,
        durationHours: 2,
        description: `Enjoy breathtaking golden hour views overlooking ${cityName}'s skyline with refreshments.`,
        timeOfDay: 'Evening',
      },
    ];

    return res.json({ success: true, suggestions, source: 'curated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/ai/travel-copilot
aiRouter.post('/travel-copilot', async (req: Request, res: Response) => {
  try {
    const { prompt, tripContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const gemini = getGeminiClient();
    if (gemini) {
      try {
        const fullPrompt = `You are GlobeTrotter AI, a savvy travel advisor.
Context on current trip: ${JSON.stringify(tripContext || {})}
User question: ${prompt}

Provide helpful, clear, bulleted recommendations, packing hints, or budget saving strategies. Keep response under 150 words.`;

        const response = await gemini.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: fullPrompt,
        });

        return res.json({ success: true, advice: response.text, source: 'gemini' });
      } catch (e) {
        console.warn('Gemini copilot error:', e);
      }
    }

    return res.json({
      success: true,
      advice: `💡 **Travel Concierge Tips:**
• **Timing**: Visit popular landmarks early in the morning (before 10 AM) to avoid tourist crowds and long queues.
• **Budgeting**: Look for combined city museum passes that include unlimited local metro transportation.
• **Local Flavor**: Explore local neighborhoods away from main tourist squares for the best culinary experiences at half the price!`,
      source: 'heuristic',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
