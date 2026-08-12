import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import type { WithAuthProp } from '@clerk/clerk-sdk-node';
import { db } from '../db';
import { aiTrips } from '../db/schema';
import { aiLimiter } from '../middleware/rateLimit';
import { optionalAuth } from '../middleware/auth';
import { cacheGet, cacheSet } from '../db/redis';
import { generateStory, StoryGenerationError } from '../services/groq';
import { parseQuery } from '../utils/parseQuery';

const router = Router();

const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

function getUserId(req: Request): string | null {
  return (req as WithAuthProp<Request>).auth?.userId ?? null;
}

/**
 * Trip planning moved to the standalone multi-agent service
 * (trip-planner-api). The Expo app calls it directly via
 * EXPO_PUBLIC_TRIP_PLANNER_URL. This stub remains so old clients get a
 * clear error instead of a silent 404.
 */
router.post('/trip/plan', (_req: Request, res: Response) => {
  res.status(410).json({
    error: 'Trip planner moved',
    detail:
      'Use the multi-agent trip-planner-api: POST /api/v1/trips/plan. ' +
      'Configure EXPO_PUBLIC_TRIP_PLANNER_URL in the frontend.',
  });
});

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

const STORY_CACHE_TTL = 604800; // 7 days

const storyQuerySchema = z.object({
  state: z.string().min(1).max(60),
});

// GET /ai/story?state=<state> — AI-generated narration for a state (cached).
router.get('/story', aiLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state } = parseQuery(storyQuerySchema, req.query);
    const key = `story:${state.trim().toLowerCase()}`;

    const cached = await cacheGet(key);
    if (cached) {
      res.json({ ...cached, cached: true });
      return;
    }

    const story = await generateStory(state);
    const payload = { state, ...story, audioUrl: null };

    await cacheSet(key, payload, STORY_CACHE_TTL);

    res.json({ ...payload, cached: false });
  } catch (err) {
    if (err instanceof StoryGenerationError) {
      res.status(502).json({ error: 'Story generation failed', detail: err.message });
      return;
    }
    next(err);
  }
});

export default router;
