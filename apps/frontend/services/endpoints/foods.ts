import { apiGet } from "../http";
import type {
  Food,
  FoodDetail,
  FoodDetailRow,
  FoodRow,
  FoodsQuery,
  ListResponse,
  Paginated,
} from "../contracts";

function toFood(row: FoodRow): Food {
  return {
    id: row.id,
    stateId: row.stateId,
    name: row.name,
    category: row.category,
    prepTime: row.prepTime,
    difficulty: row.difficulty,
    description: row.description,
    imageUrl: row.imageUrl,
    stateName: row.stateName,
  };
}

/** GET /foods — paginated, optionally filtered by state / category / search. */
export async function getFoods(
  query: FoodsQuery = {},
  signal?: AbortSignal
): Promise<Paginated<Food>> {
  const res = await apiGet<ListResponse<FoodRow>>("/foods", { ...query }, { signal });
  return {
    items: res.data.map(toFood),
    total: res.total,
    page: res.page,
    limit: res.limit,
  };
}

/** GET /foods/:id — a single food with its joined recipe (or null). */
export async function getFood(id: string, signal?: AbortSignal): Promise<FoodDetail> {
  const row = await apiGet<FoodDetailRow>(`/foods/${encodeURIComponent(id)}`, undefined, { signal });
  return { ...toFood(row), recipe: row.recipe };
}
