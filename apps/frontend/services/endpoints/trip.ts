/**
 * Multi-agent trip planner client.
 *
 * Calls the standalone trip-planner-api (FastAPI) directly — not the Aaroh
 * Express backend. Set EXPO_PUBLIC_TRIP_PLANNER_URL (e.g. http://localhost:8080).
 */

import { ApiError } from "../http";
import type { TripParams, TripPlanRequest, TripPlan } from "../contracts";

export const TRIP_PLANNER_BASE_URL =
  process.env.EXPO_PUBLIC_TRIP_PLANNER_URL ?? "http://localhost:8080";

/** Convert Aaroh prefs into the trip-planner-api body. */
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
 * POST /api/v1/trips/plan on the multi-agent service.
 * Longer timeout — six agents run sequentially after a parallel fan-out.
 */
export async function planTrip(
  params: TripParams,
  signal?: AbortSignal
): Promise<TripPlan> {
  const body = toTripPlanRequest(params);
  const url = `${TRIP_PLANNER_BASE_URL.replace(/\/$/, "")}/api/v1/trips/plan`;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort);
  }
  const timer = setTimeout(() => controller.abort(), 90_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const detail =
        data && typeof data === "object" && data !== null && "detail" in data
          ? (data as { detail: unknown }).detail
          : data;
      throw new ApiError(
        typeof detail === "string" ? detail : `Trip planner failed (${res.status})`,
        res.status,
        { detail }
      );
    }

    return data as TripPlan;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (controller.signal.aborted) {
      throw new ApiError("Trip planner request timed out or was cancelled", 0, {
        isTimeout: true,
        isAbort: signal?.aborted,
      });
    }
    throw new ApiError(
      `Could not reach trip planner at ${TRIP_PLANNER_BASE_URL}. Is docker compose up?`,
      0
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** @deprecated Use planTrip — kept so old imports keep compiling. */
export async function planTripItinerary(
  params: TripParams,
  signal?: AbortSignal
): Promise<TripPlan> {
  return planTrip(params, signal);
}
