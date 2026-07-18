import { apiGet } from "../http";
import type { SearchQuery, SearchResponse, SearchResults } from "../contracts";

/**
 * GET /search — parallel full-text search across places, foods and festivals.
 * Flattens the `{ query, results }` envelope into a single object.
 */
export async function search(
  query: SearchQuery,
  signal?: AbortSignal
): Promise<SearchResults> {
  const res = await apiGet<SearchResponse>(
    "/search",
    {
      q: query.q,
      types: query.types?.join(","),
      limit: query.limit,
    },
    { signal }
  );

  return {
    query: res.query,
    places: res.results.places ?? [],
    foods: res.results.foods ?? [],
    festivals: res.results.festivals ?? [],
  };
}
