import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { recipes, traditionalFoods } from '../../db/schema';
import { fetchIndianMeals, matchMeal } from '../clients/mealdb';
import { loadStateNameMap } from '../lookup';
import { loadFoodsPack } from '../packs';
import { IngestStats } from '../stats';
import type { FoodPackRow, IngestOptions, MealDbMeal } from '../types';

function foodCategoryFromMeal(meal: MealDbMeal, fallback: FoodPackRow['category']): FoodPackRow['category'] {
  const blob = `${meal.category ?? ''} ${meal.tags.join(' ')}`.toLowerCase();
  if (blob.includes('vegan')) return 'vegan';
  if (blob.includes('dessert') || blob.includes('sweet')) return 'sweet';
  if (blob.includes('vegetarian') || blob.includes('veg')) return 'veg';
  return fallback;
}

export async function ingestFoods(opts: IngestOptions): Promise<IngestStats> {
  const stats = new IngestStats();
  const pack = loadFoodsPack();
  const stateIds = await loadStateNameMap();
  const now = new Date();

  let meals: MealDbMeal[] = [];
  if (!opts.skipMealDb) {
    try {
      meals = await fetchIndianMeals();
      console.log(`[ingest] MealDB Indian meals: ${meals.length}`);
    } catch (err) {
      console.warn(`[ingest] MealDB unavailable, curated recipes only: ${String(err)}`);
    }
  }

  for (const row of pack) {
    try {
      const stateId = row.state ? stateIds.get(row.state) : undefined;
      if (row.state && !stateId) {
        console.warn(`[ingest] food ${row.name}: unknown state "${row.state}" — storing unlinked`);
      }

      const meal = row.mealDbName || meals.length ? matchMeal(meals, row.mealDbName || row.name) : undefined;
      const ingredients = (row.ingredients && row.ingredients.length > 0 ? row.ingredients : meal?.ingredients) ?? [];
      const steps = (row.steps && row.steps.length > 0 ? row.steps : meal?.steps) ?? [];
      const imageUrl = row.imageUrl || meal?.imageUrl || null;
      const category = meal ? foodCategoryFromMeal(meal, row.category) : row.category;
      const source = meal ? 'curated+themealdb' : 'curated';

      const existing = await db
        .select({ id: traditionalFoods.id })
        .from(traditionalFoods)
        .where(eq(traditionalFoods.externalId, row.externalId))
        .limit(1);

      const foodValues = {
        name: row.name,
        stateId: stateId ?? null,
        category,
        prepTime: row.prepTime ?? null,
        difficulty: row.difficulty ?? null,
        description: row.description,
        imageUrl,
        externalId: row.externalId,
        source,
        updatedAt: now,
      };

      if (opts.dryRun) {
        stats.record(existing[0] ? 'updated' : 'inserted');
        continue;
      }

      let foodId = existing[0]?.id;
      if (foodId) {
        await db.update(traditionalFoods).set(foodValues).where(eq(traditionalFoods.id, foodId));
        stats.record('updated');
      } else {
        const inserted = await db.insert(traditionalFoods).values(foodValues).returning({ id: traditionalFoods.id });
        foodId = inserted[0]?.id;
        stats.record('inserted');
      }

      if (!foodId || (ingredients.length === 0 && steps.length === 0)) continue;

      const recipeRow = {
        foodId,
        ingredients,
        steps,
        videoUrl: meal?.videoUrl ?? null,
        source,
        updatedAt: now,
      };

      const existingRecipe = await db
        .select({ id: recipes.id })
        .from(recipes)
        .where(eq(recipes.foodId, foodId))
        .limit(1);

      if (existingRecipe[0]) {
        await db.update(recipes).set(recipeRow).where(eq(recipes.id, existingRecipe[0].id));
      } else {
        await db.insert(recipes).values(recipeRow);
      }
    } catch (err) {
      console.warn(`[ingest] food failed ${row.name}: ${String(err)}`);
      stats.record('failed');
    }
  }

  stats.print('foods');
  return stats;
}
