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
import {
  planTrip,
  tripPlanRequestSchema,
  GroqRateLimited,
  TripPlannerConfigError,
} from '../tripPlanner';

const router = Router();

const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

function getUserId(req: Request): string | null {
  return (req as WithAuthProp<Request>).auth?.userId ?? null;
}

/** Serialize travel legs with both from/to and from_place/to_place for clients. */
function serializePlan(plan: Awaited<ReturnType<typeof planTrip>>) {
  return {
    ...plan,
    travel: {
      ...plan.travel,
      to_destination: plan.travel.to_destination.map((leg) => ({
        mode: leg.mode,
        from: leg.from_place,
        to: leg.to_place,
        from_place: leg.from_place,
        to_place: leg.to_place,
        duration_hours: leg.duration_hours,
        estimated_cost: leg.estimated_cost,
        notes: leg.notes,
      })),
    },
  };
}

// POST /ai/trip/plan — multi-agent trip planner (weather∥travel∥safety → … → critic)
router.post(
  '/trip/plan',
  aiLimiter,
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = tripPlanRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Invalid trip plan request',
          detail: parsed.error.flatten(),
        });
        return;
      }

      const plan = await planTrip(parsed.data);
      const payload = serializePlan(plan);

      const userId = getUserId(req);
      if (userId) {
        try {
          const start = new Date(parsed.data.start_date + 'T00:00:00Z');
          const end = new Date(parsed.data.end_date + 'T00:00:00Z');
          const duration = Math.max(
            Math.round((end.getTime() - start.getTime()) / 86_400_000),
            1
          );
          await db.insert(aiTrips).values({
            userId,
            budget: Math.round(parsed.data.budget.amount),
            duration,
            preferences: parsed.data,
            generatedItinerary: payload,
          });
        } catch (saveErr) {
          console.error('[ai/trip/plan] failed to persist trip:', saveErr);
        }
      }

      res.json(payload);
    } catch (err) {
      if (err instanceof TripPlannerConfigError) {
        res.status(503).json({ error: 'Trip planner unavailable', detail: err.message });
        return;
      }
      if (err instanceof GroqRateLimited) {
        const wait = Math.max(1, Math.ceil(err.retryAfterS ?? 60));
        res.setHeader('Retry-After', String(wait));
        res.status(429).json({
          error: 'Groq rate limit',
          detail:
            `${err.message} Retry in ~${wait}s, or switch GROQ_MODEL to ` +
            '`llama-3.1-8b-instant` (higher free-tier token budget) and restart.',
        });
        return;
      }
      console.error('[ai/trip/plan]', err);
      res.status(502).json({
        error: 'Trip planning failed',
        detail: err instanceof Error ? err.message : String(err),
      });
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
