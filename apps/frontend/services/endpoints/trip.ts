/**
 * Multi-agent trip planner client.
 *
 * Calls the Aaroh Express backend (`POST /ai/trip/plan`), which runs the
 * embedded weather ∥ travel ∥ safety → hotels → itinerary → budget → critic pipeline.
 */

import { apiPost } from "../http";
import type { TripParams, TripPlanRequest, TripPlan } from "../contracts";

/** Convert Aaroh prefs into the trip-planner request body. */
export function toTripPlanRequest(params: TripParams): TripPlanRequest {
  return {
    destination: params.destination,
    origin: params.origin || null,
    start_date: params.startDate,
    end_date: params.endDate,
    budget: {
      amount: params.budget,
      currency: params.currency || "INR",
    },
    travelers: Math.max(1, params.travelers || 1),
    preferences: {
      pace: params.pace || "moderate",
      interests: params.interests ?? [],
      stay_type: params.stayType,
      transport_mode: params.transportMode || "any",
    },
  };
}

/**
 * POST /ai/trip/plan on the Aaroh backend.
 * Longer timeout — several agents run after a parallel fan-out.
 */
export async function planTrip(
  params: TripParams,
  signal?: AbortSignal
): Promise<TripPlan> {
  const body = toTripPlanRequest(params);
  return apiPost<TripPlan>("/ai/trip/plan", body, {
    signal,
    timeoutMs: 90_000,
  });
}

/** @deprecated Use planTrip — kept so old imports keep compiling. */
export async function planTripItinerary(
  params: TripParams,
  signal?: AbortSignal
): Promise<TripPlan> {
  return planTrip(params, signal);
}
