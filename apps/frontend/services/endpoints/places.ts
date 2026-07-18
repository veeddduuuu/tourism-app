import { apiGet } from "../http";
import type {
  ListResponse,
  Paginated,
  Place,
  PlaceRow,
  PlacesQuery,
} from "../contracts";

const num = (v: string | null): number | null =>
  v === null || v === "" ? null : Number(v);

/** Normalises a raw DB row (decimals as strings, images maybe null) into a Place. */
export function toPlace(row: PlaceRow): Place {
  return {
    ...row,
    lat: num(row.lat),
    lng: num(row.lng),
    rating: num(row.rating),
    images: row.images ?? [],
  };
}

/** GET /places — paginated, optionally filtered by state / category / search. */
export async function getPlaces(
  query: PlacesQuery = {},
  signal?: AbortSignal
): Promise<Paginated<Place>> {
  const res = await apiGet<ListResponse<PlaceRow>>("/places", { ...query }, { signal });
  return {
    items: res.data.map(toPlace),
    total: res.total,
    page: res.page,
    limit: res.limit,
  };
}

/** GET /places/:id — a single place with its city + state. */
export async function getPlace(id: string, signal?: AbortSignal): Promise<Place> {
  const row = await apiGet<PlaceRow>(`/places/${encodeURIComponent(id)}`, undefined, { signal });
  return toPlace(row);
}
