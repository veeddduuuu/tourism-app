export interface HealthResponse {
  status: string;
  ts: string;
}

// --- Trip planner contracts (POST /api/ai/trip/plan) ---

export interface TripParams {
  destination: string;
  startCity: string;
  duration: number;
  budget: number;
  travelStyle: string;
  groupType: string;
  month: string;
  interests: string[];
}

export interface TripDay {
  day: number;
  title: string;
  city: string;
  activities: string[];
  estimated_cost_inr: number;
  hotel: { name: string; type: string; price_per_night: number };
  transport: { from: string; to: string; mode: string; cost: number };
}

export interface TripItinerary {
  title: string;
  total_cost_inr: number;
  budget_breakdown: {
    accommodation_pct: number;
    transport_pct: number;
    food_pct: number;
    activities_pct: number;
  };
  days: TripDay[];
  cultural_notes: string[];
  best_time_to_visit: string;
  weather_warning: string | null;
}

export interface TripPlanResponse {
  data: TripItinerary;
  cached: boolean;
}

// Add shared API contracts and types here
