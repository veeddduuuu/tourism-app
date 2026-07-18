import Groq from 'groq-sdk';

// Parameters that describe a trip request. Kept in sync with the Zod schema in
// routes/ai.ts and the shared TripParams type used by the frontend.
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

/**
 * Thrown when the upstream model fails or returns unparseable output. The route
 * layer maps this to a 502 rather than a generic 500.
 */
export class TripGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TripGenerationError';
  }
}

/** Thrown when the story model fails or returns unparseable output → 502. */
export class StoryGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoryGenerationError';
  }
}

export interface StoryContent {
  title: string;
  monument: string;
  narration: string;
}

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TRIP_SYSTEM_PROMPT = `You are an expert India travel guide with 20+ years of experience.
When given a travel request, respond ONLY with a JSON object in this exact format:
{
  "title": "string",
  "total_cost_inr": number,
  "budget_breakdown": { "accommodation_pct": 40, "transport_pct": 25, "food_pct": 20, "activities_pct": 15 },
  "days": [{
    "day": 1, "title": "string", "city": "string",
    "activities": ["string"],
    "estimated_cost_inr": number,
    "hotel": { "name": "string", "type": "string", "price_per_night": number },
    "transport": { "from": "string", "to": "string", "mode": "string", "cost": number }
  }],
  "cultural_notes": ["string"],
  "best_time_to_visit": "string",
  "weather_warning": "string or null"
}
All prices in INR. No preamble, no markdown — only valid JSON.`;

/**
 * Generates a trip itinerary via Groq's Llama 3.3 70B model, returning the
 * parsed JSON. Throws TripGenerationError on an empty response or invalid JSON.
 */
export async function generateTripPlan(params: TripParams): Promise<TripItinerary> {
  const userPrompt = `Plan a ${params.duration}-day trip to ${params.destination}.
Budget: Rs ${params.budget.toLocaleString('en-IN')} total.
Travel style: ${params.travelStyle}. Group: ${params.groupType}.
Starting from: ${params.startCity}. Month: ${params.month}.
Interests: ${params.interests.join(', ')}.`;

  let content: string | null;
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: TRIP_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });
    content = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    throw new TripGenerationError(`Groq request failed: ${message}`);
  }

  if (!content) {
    throw new TripGenerationError('Groq returned an empty response');
  }

  try {
    return JSON.parse(content) as TripItinerary;
  } catch {
    throw new TripGenerationError('Groq returned invalid JSON');
  }
}

const STORY_SYSTEM_PROMPT = `You are a master storyteller who narrates the history, culture and spirit of Indian states as an immersive audio experience.
Given an Indian state, respond ONLY with a JSON object in this exact format:
{
  "title": "string — an evocative title for the story",
  "monument": "string — one iconic monument or landmark of that state",
  "narration": "string — a vivid second-person narration of 150-250 words that opens by inviting the listener to close their eyes and imagine the scene, then tells the state's most compelling historical or cultural story in short, flowing sentences"
}
No preamble, no markdown — only valid JSON.`;

/**
 * Generates an AI narration for an Indian state via Groq's Llama 3.3 70B model.
 * Throws StoryGenerationError on an empty response or invalid JSON.
 */
export async function generateStory(state: string): Promise<StoryContent> {
  const userPrompt = `Tell the story of the Indian state of ${state}.`;

  let content: string | null;
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: STORY_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    content = completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    throw new StoryGenerationError(`Groq request failed: ${message}`);
  }

  if (!content) {
    throw new StoryGenerationError('Groq returned an empty response');
  }

  try {
    return JSON.parse(content) as StoryContent;
  } catch {
    throw new StoryGenerationError('Groq returned invalid JSON');
  }
}
