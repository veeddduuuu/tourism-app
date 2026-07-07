import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq, and, sql, SQL } from 'drizzle-orm';
import { db } from '../db';
import { places, cities, states } from '../db/schema';
import { parseQuery } from '../utils/parseQuery';

const router = Router();

const placesQuerySchema = z.object({
  state: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().optional(),
});

// GET /places — paginated list with optional state/category/search filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = parseQuery(placesQuerySchema, req.query);
    const state = parsed.state;
    const category = parsed.category;
    const search = parsed.search;
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 20;

    const conditions: SQL[] = [];

    if (state) {
      conditions.push(eq(states.name, state));
    }

    if (category) {
      conditions.push(eq(places.category, category));
    }

    if (search) {
      conditions.push(
        sql`to_tsvector('english', ${places.name} || ' ' || COALESCE(${places.historyBrief}, '')) @@ plainto_tsquery('english', ${search})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db
        .select({
          id: places.id,
          name: places.name,
          category: places.category,
          lat: places.lat,
          lng: places.lng,
          rating: places.rating,
          entryFee: places.entryFee,
          timings: places.timings,
          historyBrief: places.historyBrief,
          images: places.images,
          wikipediaUrl: places.wikipediaUrl,
          cityId: places.cityId,
          cityName: cities.name,
          stateId: cities.stateId,
          stateName: states.name,
        })
        .from(places)
        .leftJoin(cities, eq(places.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
        .where(whereClause)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(places)
        .leftJoin(cities, eq(places.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;

    res.json({ data: rows, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /places/:id — single place with city + state
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const rows = await db
      .select({
        id: places.id,
        name: places.name,
        category: places.category,
        lat: places.lat,
        lng: places.lng,
        rating: places.rating,
        entryFee: places.entryFee,
        timings: places.timings,
        historyBrief: places.historyBrief,
        images: places.images,
        wikipediaUrl: places.wikipediaUrl,
        cityId: places.cityId,
        cityName: cities.name,
        stateId: cities.stateId,
        stateName: states.name,
      })
      .from(places)
      .leftJoin(cities, eq(places.cityId, cities.id))
      .leftJoin(states, eq(cities.stateId, states.id))
      .where(eq(places.id, id));

    if (rows.length === 0) {
      res.status(404).json({ error: 'Place not found' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
