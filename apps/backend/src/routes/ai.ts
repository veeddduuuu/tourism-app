import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import type { WithAuthProp } from '@clerk/clerk-sdk-node';
import { db } from '../db';
import { aiTrips } from '../db/schema';
import { aiLimiter } from '../middleware/rateLimit';
import { optionalAuth } from '../middleware/auth';
import { cacheGet, cacheSet } from '../db/redis';
import { generateTripPlan, TripGenerationError, TripParams } from '../services/groq';
import { parseQuery } from '../utils/parseQuery';

const router = Router();

const TRIP_CACHE_TTL = 86400; // 24 hours

const tripSchema = z.object({
  destination: z.string().min(1),
  startCity: z.string().min(1),
  duration: z.coerce.number().int().min(1).max(30),
  budget: z.coerce.number().int().positive(),
  travelStyle: z.string().min(1),
  groupType: z.string().min(1),
  month: z.string().min(1),
  interests: z.array(z.string()).default([]),
});

const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// Pulls the Clerk user id when a session is present, otherwise null. The
// optionalAuth middleware always sets `req.auth`, but `userId` is null for
// anonymous callers.
function getUserId(req: Request): string | null {
  return (req as WithAuthProp<Request>).auth?.userId ?? null;
}

// Builds a deterministic cache key from the request params so identical requests
// hit the cache regardless of key ordering in the request body.
function buildCacheKey(params: TripParams): string {
  const canonical = {
    destination: params.destination.trim().toLowerCase(),
    startCity: params.startCity.trim().toLowerCase(),
    duration: params.duration,
    budget: params.budget,
    travelStyle: params.travelStyle.trim().toLowerCase(),
    groupType: params.groupType.trim().toLowerCase(),
    month: params.month.trim().toLowerCase(),
    interests: [...params.interests].map((i) => i.trim().toLowerCase()).sort(),
  };
  return `trip:${JSON.stringify(canonical)}`;
}

// POST /ai/trip/plan — generate (or serve cached) itinerary, persist to ai_trips
router.post(
  '/trip/plan',
  aiLimiter,
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = tripSchema.parse(req.body) as TripParams;
      const cacheKey = buildCacheKey(params);

      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.json({ data: cached, cached: true });
        return;
      }

      const itinerary = await generateTripPlan(params);

      // Best-effort cache; failure here must not break the response.
      await cacheSet(cacheKey, itinerary, TRIP_CACHE_TTL);

      await db.insert(aiTrips).values({
        userId: getUserId(req),
        budget: params.budget,
        duration: params.duration,
        preferences: params,
        generatedItinerary: itinerary,
      });

      res.json({ data: itinerary, cached: false });
    } catch (err) {
      if (err instanceof TripGenerationError) {
        res.status(502).json({ error: 'Trip generation failed', detail: err.message });
        return;
      }
      next(err);
    }
  }
);

// GET /ai/trip/history — the caller's saved trips (empty for anonymous users)
router.get(
  '/trip/history',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = parseQuery(historyQuerySchema, req.query);
      const page = parsed.page ?? 1;
      const limit = parsed.limit ?? 20;
      const userId = getUserId(req);

      if (!userId) {
        res.json({ data: [], total: 0, page, limit });
        return;
      }

      const [rows, countRows] = await Promise.all([
        db
          .select()
          .from(aiTrips)
          .where(eq(aiTrips.userId, userId))
          .orderBy(desc(aiTrips.createdAt))
          .limit(limit)
          .offset((page - 1) * limit),

        db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(aiTrips)
          .where(eq(aiTrips.userId, userId)),
      ]);

      const total = countRows[0]?.count ?? 0;

      res.json({ data: rows, total, page, limit });
    } catch (err) {
      next(err);
    }
  }
);

// GET /ai/trip/:id — a single saved trip
router.get('/trip/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const rows = await db.select().from(aiTrips).where(eq(aiTrips.id, id));

    if (rows.length === 0) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
