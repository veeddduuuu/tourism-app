import { apiGet } from "../http";
import type {
  HistoryEntry,
  HistoryQuery,
  HistoryRow,
  ListResponse,
  Paginated,
} from "../contracts";

/** GET /history — paginated timeline entries, optionally filtered by era / place. */
export async function getHistory(
  query: HistoryQuery = {},
  signal?: AbortSignal
): Promise<Paginated<HistoryEntry>> {
  const res = await apiGet<ListResponse<HistoryRow>>("/history", { ...query }, { signal });
  return {
    items: res.data,
    total: res.total,
    page: res.page,
    limit: res.limit,
  };
}

/** GET /history/:id — a single history entry with its joined place name. */
export async function getHistoryEntry(
  id: string,
  signal?: AbortSignal
): Promise<HistoryEntry> {
  return apiGet<HistoryRow>(`/history/${encodeURIComponent(id)}`, undefined, { signal });
}
