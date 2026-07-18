import { apiPost } from "../http";
import type { TripParams, TripItinerary, TripPlanResponse } from "../contracts";

/**
 * POST /ai/trip/plan — generate (or return a cached) AI itinerary.
 * The trip planner is slower than the CRUD endpoints, so it gets a longer
 * timeout than the 10s default.
 */
export async function planTrip(
  params: TripParams,
  signal?: AbortSignal
): Promise<TripPlanResponse> {
  return apiPost<TripPlanResponse>("/ai/trip/plan", params, {
    signal,
    timeoutMs: 45_000,
  });
}

/** Convenience wrapper returning just the itinerary. */
export async function planTripItinerary(
  params: TripParams,
  signal?: AbortSignal
): Promise<TripItinerary> {
  const res = await planTrip(params, signal);
  return res.data;
}
