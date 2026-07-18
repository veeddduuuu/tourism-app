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
// AI Trip planner
// ---------------------------------------------------------------------------

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
