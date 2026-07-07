import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq, and, ilike, sql, SQL } from 'drizzle-orm';
import { db } from '../db';
import { festivals, states } from '../db/schema';
import { parseQuery } from '../utils/parseQuery';

const router = Router();

const festivalsQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  state: z.string().optional(),
  isNational: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

// GET /festivals — paginated list with optional month/state/isNational/search filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = parseQuery(festivalsQuerySchema as any, req.query) as z.infer<typeof festivalsQuerySchema>;
    const { month, state, isNational, search } = parsed;
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 20;

    const conditions: SQL[] = [];

    if (month !== undefined) {
      conditions.push(eq(festivals.month, month));
    }

    if (state) {
      conditions.push(eq(states.name, state));
    }

    if (isNational !== undefined) {
      conditions.push(eq(festivals.isNational, isNational));
    }

    if (search) {
      conditions.push(ilike(festivals.name, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db
        .select({
          id: festivals.id,
          stateId: festivals.stateId,
          name: festivals.name,
          month: festivals.month,
          durationDays: festivals.durationDays,
          description: festivals.description,
          traditions: festivals.traditions,
          isNational: festivals.isNational,
          stateName: states.name,
        })
        .from(festivals)
        .leftJoin(states, eq(festivals.stateId, states.id))
        .where(whereClause)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(festivals)
        .leftJoin(states, eq(festivals.stateId, states.id))
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;

    res.json({ data: rows, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /festivals/:id — single festival with joined state name
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const rows = await db
      .select({
        id: festivals.id,
        stateId: festivals.stateId,
        name: festivals.name,
        month: festivals.month,
        durationDays: festivals.durationDays,
        description: festivals.description,
        traditions: festivals.traditions,
        isNational: festivals.isNational,
        stateName: states.name,
      })
      .from(festivals)
      .leftJoin(states, eq(festivals.stateId, states.id))
      .where(eq(festivals.id, id));

    if (rows.length === 0) {
      res.status(404).json({ error: 'Festival not found' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
