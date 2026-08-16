export type IngestAction = 'inserted' | 'updated' | 'skipped' | 'failed';

export interface IngestOptions {
  dryRun: boolean;
  jobs: IngestJobName[];
  cityFilter?: string;
  capOverride?: number;
  skipWikipedia: boolean;
  skipMealDb: boolean;
  refreshWikipedia: boolean;
}

export const INGEST_JOBS = [
  'states',
  'cities',
  'places',
  'foods',
  'festivals',
  'history',
] as const;

export type IngestJobName = (typeof INGEST_JOBS)[number];

export interface StatePackRow {
  name: string;
  capital?: string;
  region?: string;
  language?: string;
  description?: string;
  bestSeason?: string;
}

export interface CityPackRow {
  name: string;
  state: string;
  lat: number;
  lng: number;
  wikidataId?: string;
  radiusKm?: number;
  placeCap?: number;
  description?: string;
}

export interface Ingredient {
  name: string;
  qty?: string;
  unit?: string;
}

export interface RecipeStep {
  step_no: number;
  instruction: string;
}

export interface FoodPackRow {
  externalId: string;
  name: string;
  state?: string | null;
  category: 'veg' | 'non-veg' | 'vegan' | 'sweet';
  prepTime?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  description: string;
  imageUrl?: string;
  mealDbName?: string;
  ingredients?: Ingredient[];
  steps?: RecipeStep[];
}

export interface FestivalPackRow {
  externalId: string;
  name: string;
  state?: string | null;
  month: number;
  durationDays?: number;
  description: string;
  traditions?: string;
  isNational?: boolean;
}

export interface HistoryPackRow {
  externalId: string;
  eventTitle: string;
  era: 'ancient' | 'medieval' | 'british' | 'modern';
  year?: number;
  description: string;
  mediaUrl?: string;
  placeExternalId?: string;
  placeName?: string;
}

export interface WikidataPlace {
  qid: string;
  name: string;
  lat: number;
  lng: number;
  wikipediaUrl?: string;
  imageUrl?: string;
  classIds: string[];
}

export interface WikipediaSummary {
  extract: string | null;
  url: string | null;
  thumbnail: string | null;
}

export interface MealDbMeal {
  id: string;
  name: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
  videoUrl?: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}
