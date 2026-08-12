export interface HealthResponse {
  status: string;
  ts: string;
}

// Trip planning lives in trip-planner-api; Aaroh frontend calls it directly.
// These types mirror that service for shared consumers.

export interface TripParams {
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency: string;
  travelers: number;
  pace: "relaxed" | "moderate" | "packed";
  interests: string[];
  stayType: "hostel" | "budget" | "boutique" | "luxury" | "apartment" | null;
  transportMode: "any" | "flight" | "train" | "car" | "mixed";
}

export interface TripPlan {
  trip_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  summary: string;
  weather: unknown;
  travel: unknown;
  hotels: unknown;
  itinerary: unknown;
  budget: unknown;
  critique: unknown;
  meta: {
    model: string;
    agents: string[];
    generated_at: string;
  };
}

export type TripItinerary = TripPlan;
export type TripPlanResponse = TripPlan;

// Add shared API contracts and types here
