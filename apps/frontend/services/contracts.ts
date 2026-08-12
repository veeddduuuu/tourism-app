/**
 * Strongly-typed contracts for the Aaroh backend.
 *
 *  - `*Row` types mirror exactly what each endpoint SELECTs (decimals arrive as
 *    strings from Postgres, jsonb as unknown, etc.).
 *  - Domain models (`Place`, `Food`, …) are the normalised shapes the app should
 *    consume: numbers parsed, images defaulted to arrays.
 *
 * The endpoint modules map `*Row` → domain model, so UI code never touches raw
 * database representations.
 */

// ---------------------------------------------------------------------------
// Envelopes
// ---------------------------------------------------------------------------

/** Shape returned by every paginated list endpoint. */
export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/** Normalised pagination result handed to the app. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------

export interface PlaceRow {
  id: string;
  name: string;
  category: string | null;
  lat: string | null;
  lng: string | null;
  rating: string | null;
  entryFee: number | null;
  timings: string | null;
  historyBrief: string | null;
  images: string[] | null;
  wikipediaUrl: string | null;
  cityId: string | null;
  cityName: string | null;
  stateId: string | null;
  stateName: string | null;
}

export interface Place {
  id: string;
  name: string;
  category: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  entryFee: number | null;
  timings: string | null;
  historyBrief: string | null;
  images: string[];
  wikipediaUrl: string | null;
  cityId: string | null;
  cityName: string | null;
  stateId: string | null;
  stateName: string | null;
}

export interface PlacesQuery {
  state?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Foods (+ recipe on detail)
// ---------------------------------------------------------------------------

export interface FoodRow {
  id: string;
  stateId: string | null;
  name: string;
  category: string | null;
  prepTime: number | null;
  difficulty: string | null;
  description: string | null;
  imageUrl: string | null;
  stateName: string | null;
}

export interface RecipeRow {
  ingredients: unknown;
  steps: unknown;
  nutritionalInfo: unknown;
  videoUrl: string | null;
}

export type FoodDetailRow = FoodRow & { recipe: RecipeRow | null };

export interface Food {
  id: string;
  stateId: string | null;
  name: string;
  category: string | null;
  prepTime: number | null;
  difficulty: string | null;
  description: string | null;
  imageUrl: string | null;
  stateName: string | null;
}

export type Recipe = RecipeRow;
export type FoodDetail = Food & { recipe: Recipe | null };

export interface FoodsQuery {
  state?: string;
  category?: "veg" | "non-veg" | "vegan" | "sweet";
  search?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Festivals
// ---------------------------------------------------------------------------

export interface FestivalRow {
  id: string;
  stateId: string | null;
  name: string;
  month: number | null;
  durationDays: number | null;
  description: string | null;
  traditions: string | null;
  isNational: boolean | null;
  stateName: string | null;
}

export type Festival = FestivalRow;

export interface FestivalsQuery {
  month?: number;
  state?: string;
  isNational?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export interface HistoryRow {
  id: string;
  placeId: string | null;
  era: string | null;
  year: number | null;
  eventTitle: string;
  description: string | null;
  mediaUrl: string | null;
  placeName: string | null;
}

export type HistoryEntry = HistoryRow;

export interface HistoryQuery {
  era?: "ancient" | "medieval" | "british" | "modern";
  placeId?: string;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchPlaceHit {
  id: string;
  name: string;
  category: string | null;
  images: string[] | null;
  rating: string | null;
}
export interface SearchFoodHit {
  id: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
}
export interface SearchFestivalHit {
  id: string;
  name: string;
  month: number | null;
  isNational: boolean | null;
}

export interface SearchResponse {
  query: string;
  results: {
    places: SearchPlaceHit[];
    foods: SearchFoodHit[];
    festivals: SearchFestivalHit[];
  };
}

export interface SearchResults {
  query: string;
  places: SearchPlaceHit[];
  foods: SearchFoodHit[];
  festivals: SearchFestivalHit[];
}

export interface SearchQuery {
  q: string;
  types?: Array<"places" | "foods" | "festivals">;
  limit?: number;
}

// ---------------------------------------------------------------------------
// AI Trip planner — powered by standalone trip-planner-api
// ---------------------------------------------------------------------------

/** Prefs collected in-app. Mapped 1:1 onto TripPlanRequest. */
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

export interface TripPlanRequest {
  destination: string;
  origin?: string | null;
  start_date: string;
  end_date: string;
  budget: { amount: number; currency: string };
  travelers?: number;
  preferences?: {
    pace?: "relaxed" | "moderate" | "packed";
    interests?: string[];
    stay_type?: "hostel" | "budget" | "boutique" | "luxury" | "apartment" | null;
    transport_mode?: "any" | "flight" | "train" | "car" | "mixed";
  };
}

export interface WeatherDay {
  date: string;
  condition: string;
  high_c: number;
  low_c: number;
  precipitation_chance: number;
  notes: string;
}

export interface WeatherReport {
  summary: string;
  daily: WeatherDay[];
  alerts: string[];
  packing_tips: string[];
}

export interface TravelLeg {
  mode: string;
  from?: string;
  to?: string;
  from_place?: string;
  to_place?: string;
  duration_hours: number;
  estimated_cost: number;
  notes: string;
}

export interface TravelPlan {
  summary: string;
  to_destination: TravelLeg[];
  local_transport: string[];
  tips: string[];
}

export interface HotelOption {
  name: string;
  area: string;
  type: string;
  nights: number;
  price_per_night: number;
  total_estimate: number;
  why: string;
  pros: string[];
  cons: string[];
}

export interface HotelsPlan {
  summary: string;
  recommendations: HotelOption[];
}

export interface ItineraryDay {
  date: string;
  theme: string;
  morning: string;
  afternoon: string;
  evening: string;
  meals: string[];
  estimated_cost: number;
  weather_note: string;
}

export interface ItineraryPlan {
  summary: string;
  days: ItineraryDay[];
}

export interface BudgetBreakdown {
  travel: number;
  lodging: number;
  food: number;
  activities: number;
  misc: number;
  total: number;
  currency: string;
  within_budget: boolean;
  variance: number;
  suggestions: string[];
}

export interface CritiqueIssue {
  severity: "low" | "medium" | "high";
  area: string;
  message: string;
  suggestion: string;
}

export interface Critique {
  overall_score: number;
  strengths: string[];
  issues: CritiqueIssue[];
  revised_priorities: string[];
}

/** Full multi-agent response from POST /api/v1/trips/plan */
export interface TripPlan {
  trip_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  summary: string;
  weather: WeatherReport;
  travel: TravelPlan;
  hotels: HotelsPlan;
  itinerary: ItineraryPlan;
  budget: BudgetBreakdown;
  critique: Critique;
  meta: {
    model: string;
    agents: string[];
    generated_at: string;
  };
}

/** @deprecated Old Aaroh backend shape — use TripPlan */
export type TripItinerary = TripPlan;
export type TripPlanResponse = TripPlan;

// ---------------------------------------------------------------------------
// AI Story (GET /ai/story)
// ---------------------------------------------------------------------------

export interface Story {
  state: string;
  title: string;
  monument: string;
  narration: string;
  /** Hosted audio narration, or null when none is available. */
  audioUrl: string | null;
}
