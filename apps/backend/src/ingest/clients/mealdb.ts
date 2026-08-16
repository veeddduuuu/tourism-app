import { fetchJson, sleep } from '../http';
import type { Ingredient, MealDbMeal, RecipeStep } from '../types';

interface MealDbListItem {
  idMeal: string;
  strMeal: string;
}

interface MealDbDetail {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
  strCategory?: string;
  strTags?: string | null;
  strYoutube?: string | null;
  strInstructions?: string | null;
  [key: string]: string | null | undefined;
}

function parseIngredients(m: MealDbDetail): Ingredient[] {
  const out: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (m[`strIngredient${i}`] ?? '').trim();
    const measure = (m[`strMeasure${i}`] ?? '').trim();
    if (!name) continue;
    out.push({ name, qty: measure || undefined });
  }
  return out;
}

function parseSteps(instructions: string | null | undefined): RecipeStep[] {
  if (!instructions?.trim()) return [];
  const parts = instructions
    .split(/\r?\n+/)
    .map((s) => s.replace(/^\d+[\).:\s]+/, '').trim())
    .filter((s) => s.length > 8);
  return parts.map((instruction, i) => ({ step_no: i + 1, instruction }));
}

function toMeal(m: MealDbDetail): MealDbMeal {
  return {
    id: m.idMeal,
    name: m.strMeal,
    imageUrl: m.strMealThumb || undefined,
    category: m.strCategory || undefined,
    tags: (m.strTags ?? '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    videoUrl: m.strYoutube || undefined,
    ingredients: parseIngredients(m),
    steps: parseSteps(m.strInstructions),
  };
}

export function normalizeDishName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export async function fetchIndianMeals(): Promise<MealDbMeal[]> {
  const list = await fetchJson<{ meals: MealDbListItem[] | null }>(
    'https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian'
  );
  const items = list.meals ?? [];
  const meals: MealDbMeal[] = [];
  for (const item of items) {
    try {
      const detail = await fetchJson<{ meals: MealDbDetail[] | null }>(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${item.idMeal}`
      );
      const row = detail.meals?.[0];
      if (row) meals.push(toMeal(row));
    } catch (err) {
      console.warn(`[ingest] MealDB lookup failed for ${item.idMeal}: ${String(err)}`);
    }
    await sleep(120);
  }
  return meals;
}

export function matchMeal(meals: MealDbMeal[], name: string, aliases: string[] = []): MealDbMeal | undefined {
  const keys = [name, ...aliases].map(normalizeDishName);
  return meals.find((m) => {
    const n = normalizeDishName(m.name);
    return keys.some((k) => n === k || n.includes(k) || k.includes(n));
  });
}
