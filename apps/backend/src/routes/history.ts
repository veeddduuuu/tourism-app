import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq, and, asc, sql, SQL } from 'drizzle-orm';
import { db } from '../db';
import { historyEntries, places } from '../db/schema';
import { parseQuery } from '../utils/parseQuery';

const router = Router();

const historyQuerySchema = z.object({
  era: z.enum(['ancient', 'medieval', 'british', 'modern']).optional(),
  placeId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

const selectedFields = {
  id: historyEntries.id,
  placeId: historyEntries.placeId,
  era: historyEntries.era,
  year: historyEntries.year,
  eventTitle: historyEntries.eventTitle,
  description: historyEntries.description,
  mediaUrl: historyEntries.mediaUrl,
  placeName: places.name,
};

// GET /history — paginated list with optional era/placeId filters, ordered by year ASC NULLS LAST
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = parseQuery(historyQuerySchema as any, req.query) as z.infer<typeof historyQuerySchema>;
    const { era, placeId } = parsed;
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 20;

    const conditions: SQL[] = [];

    if (era !== undefined) {
      conditions.push(eq(historyEntries.era, era));
    }

    if (placeId !== undefined) {
      conditions.push(eq(historyEntries.placeId, placeId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db
        .select(selectedFields)
        .from(historyEntries)
        .leftJoin(places, eq(historyEntries.placeId, places.id))
        .where(whereClause)
        .orderBy(sql`${historyEntries.year} ASC NULLS LAST`)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(historyEntries)
        .leftJoin(places, eq(historyEntries.placeId, places.id))
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;

    res.json({ data: rows, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /history/:id — single history entry with joined place name
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const rows = await db
      .select(selectedFields)
      .from(historyEntries)
      .leftJoin(places, eq(historyEntries.placeId, places.id))
      .where(eq(historyEntries.id, id));

    if (rows.length === 0) {
      res.status(404).json({ error: 'History entry not found' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
