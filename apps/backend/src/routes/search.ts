import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sql, ilike } from 'drizzle-orm';
import { db } from '../db';
import { places, traditionalFoods, festivals } from '../db/schema';
import { parseQuery } from '../utils/parseQuery';

const router = Router();

const searchQuerySchema = z.object({
  q: z.string().min(2),
  types: z.string().default('places,foods,festivals'),
  limit: z.coerce.number().min(1).max(20).default(5),
});

// GET /search — run parallel queries across places, foods, and festivals
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = parseQuery(searchQuerySchema, req.query);
    const q = parsed.q;
    const limit = parsed.limit ?? 5;
    const typeList = (parsed.types ?? 'places,foods,festivals').split(',').map((t) => t.trim());

    const [placesResults, foodsResults, festivalsResults] = await Promise.all([
      typeList.includes('places')
        ? db
          .select({
            id: places.id,
            name: places.name,
            category: places.category,
            images: places.images,
            rating: places.rating,
          })
          .from(places)
          .where(
            sql`to_tsvector('english', ${places.name} || ' ' || COALESCE(${places.historyBrief}, '')) @@ plainto_tsquery('english', ${q})`
          )
          .limit(limit)
        : Promise.resolve([]),

      typeList.includes('foods')
        ? db
          .select({
            id: traditionalFoods.id,
            name: traditionalFoods.name,
            category: traditionalFoods.category,
            imageUrl: traditionalFoods.imageUrl,
          })
          .from(traditionalFoods)
          .where(
            sql`to_tsvector('english', ${traditionalFoods.name} || ' ' || COALESCE(${traditionalFoods.description}, '')) @@ plainto_tsquery('english', ${q})`
          )
          .limit(limit)
        : Promise.resolve([]),

      typeList.includes('festivals')
        ? db
          .select({
            id: festivals.id,
            name: festivals.name,
            month: festivals.month,
            isNational: festivals.isNational,
          })
          .from(festivals)
          .where(ilike(festivals.name, `%${q}%`))
          .limit(limit)
        : Promise.resolve([]),
    ]);

    res.json({
      query: q,
      results: {
        places: placesResults,
        foods: foodsResults,
        festivals: festivalsResults,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
