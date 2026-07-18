import { apiGet } from "../http";
import type {
  Festival,
  FestivalRow,
  FestivalsQuery,
  ListResponse,
  Paginated,
} from "../contracts";

/** GET /festivals — paginated, optionally filtered by month / state / national / search. */
export async function getFestivals(
  query: FestivalsQuery = {},
  signal?: AbortSignal
): Promise<Paginated<Festival>> {
  const res = await apiGet<ListResponse<FestivalRow>>("/festivals", { ...query }, { signal });
  return {
    items: res.data,
    total: res.total,
    page: res.page,
    limit: res.limit,
  };
}

/** GET /festivals/:id — a single festival with its joined state name. */
export async function getFestival(id: string, signal?: AbortSignal): Promise<Festival> {
  return apiGet<FestivalRow>(`/festivals/${encodeURIComponent(id)}`, undefined, { signal });
}
