import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq, and, sql, SQL } from 'drizzle-orm';
import { db } from '../db';
import { traditionalFoods, recipes, states } from '../db/schema';
import { parseQuery } from '../utils/parseQuery';

const router = Router();

const foodsQuerySchema = z.object({
  state: z.string().optional(),
  category: z.enum(['veg', 'non-veg', 'vegan', 'sweet']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  search: z.string().optional(),
});

// GET /foods — paginated list with optional state/category/search filters
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = parseQuery(foodsQuerySchema, req.query);
    const { state, category, search } = parsed;
    const page = parsed.page ?? 1;
    const limit = parsed.limit ?? 20;

    const conditions: SQL[] = [];

    if (state) {
      conditions.push(eq(states.name, state));
    }

    if (category) {
      conditions.push(eq(traditionalFoods.category, category));
    }

    if (search) {
      conditions.push(
        sql`to_tsvector('english', ${traditionalFoods.name} || ' ' || COALESCE(${traditionalFoods.description}, '')) @@ plainto_tsquery('english', ${search})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countRows] = await Promise.all([
      db
        .select({
          id: traditionalFoods.id,
          stateId: traditionalFoods.stateId,
          name: traditionalFoods.name,
          category: traditionalFoods.category,
          prepTime: traditionalFoods.prepTime,
          difficulty: traditionalFoods.difficulty,
          description: traditionalFoods.description,
          imageUrl: traditionalFoods.imageUrl,
          stateName: states.name,
        })
        .from(traditionalFoods)
        .leftJoin(states, eq(traditionalFoods.stateId, states.id))
        .where(whereClause)
        .limit(limit)
        .offset((page - 1) * limit),

      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(traditionalFoods)
        .leftJoin(states, eq(traditionalFoods.stateId, states.id))
        .where(whereClause),
    ]);

    const total = countRows[0]?.count ?? 0;

    res.json({ data: rows, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// GET /foods/:id — single food with joined recipe and state
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const rows = await db
      .select({
        id: traditionalFoods.id,
        stateId: traditionalFoods.stateId,
        name: traditionalFoods.name,
        category: traditionalFoods.category,
        prepTime: traditionalFoods.prepTime,
        difficulty: traditionalFoods.difficulty,
        description: traditionalFoods.description,
        imageUrl: traditionalFoods.imageUrl,
        stateName: states.name,
        recipeId: recipes.id,
        ingredients: recipes.ingredients,
        steps: recipes.steps,
        nutritionalInfo: recipes.nutritionalInfo,
        videoUrl: recipes.videoUrl,
      })
      .from(traditionalFoods)
      .leftJoin(recipes, eq(recipes.foodId, traditionalFoods.id))
      .leftJoin(states, eq(traditionalFoods.stateId, states.id))
      .where(eq(traditionalFoods.id, id));

    if (rows.length === 0) {
      res.status(404).json({ error: 'Food not found' });
      return;
    }

    const row = rows[0];
    const { recipeId, ingredients, steps, nutritionalInfo, videoUrl, ...food } = row;

    res.json({
      ...food,
      recipe: recipeId
        ? { ingredients, steps, nutritionalInfo, videoUrl }
        : null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
