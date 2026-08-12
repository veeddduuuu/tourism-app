import { z } from 'zod';

/** Coerce LLM string/object arrays into plain string[]. */
export function coerceStrList(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) return [String(value)];
  const out: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      out.push(item);
    } else if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      let found = false;
      for (const key of ['text', 'tip', 'note', 'summary', 'message', 'description']) {
        if (obj[key]) {
          out.push(String(obj[key]));
          found = true;
          break;
        }
      }
      if (!found) {
        const mode = obj.mode;
        if (mode && ('from' in obj || 'to' in obj)) {
          out.push(
            `${mode}: ${obj.from ?? '?'} → ${obj.to ?? '?'}` +
              (obj.notes ? ` (${obj.notes})` : '')
          );
        } else {
          out.push(JSON.stringify(item));
        }
      }
    } else {
      out.push(String(item));
    }
  }
  return out;
}

function unwrapNamedPayload(
  data: unknown,
  keys: string[],
  keepIfPresent: string[] = ['summary']
): unknown {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  const obj = data as Record<string, unknown>;
  if (keepIfPresent.some((k) => k in obj)) return data;
  for (const key of keys) {
    const nested = obj[key];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const merged = { ...(nested as Record<string, unknown>) };
      for (const [k, v] of Object.entries(obj)) {
        if (k === key) continue;
        if (!(k in merged)) merged[k] = v;
      }
      return merged;
    }
  }
  return data;
}

function asStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object') return coerceStrList([v])[0] ?? '';
  return String(v);
}

const preferencesSchema = z.object({
  pace: z.enum(['relaxed', 'moderate', 'packed']).default('moderate'),
  interests: z.array(z.string()).default([]),
  stay_type: z
    .enum(['hostel', 'budget', 'boutique', 'luxury', 'apartment'])
    .nullable()
    .optional()
    .default(null),
  transport_mode: z
    .enum(['any', 'flight', 'train', 'car', 'mixed'])
    .default('any'),
});

export const tripPlanRequestSchema = z.object({
  destination: z.string().min(1),
  origin: z.string().nullable().optional().default(null),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  budget: z.object({
    amount: z.number().positive(),
    currency: z.string().min(1).default('USD'),
  }),
  travelers: z.number().int().min(1).default(1),
  preferences: preferencesSchema.default({}),
});

export type TripPlanRequest = z.infer<typeof tripPlanRequestSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

export const weatherDaySchema = z.object({
  date: z.string().default(''),
  condition: z.string().default('varied'),
  high_c: z.coerce.number().default(0),
  low_c: z.coerce.number().default(0),
  precipitation_chance: z.coerce.number().default(0),
  notes: z.string().default(''),
});

export const weatherReportSchema = z.preprocess((raw) => {
  let data = unwrapNamedPayload(raw, [
    'weather_forecast',
    'weather',
    'forecast',
    'report',
    'data',
    'outlook',
  ]);
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data;
  const obj = { ...(data as Record<string, unknown>) };
  if (!('packing_tips' in obj)) {
    for (const alt of ['packing', 'tips', 'packingTips', 'what_to_pack']) {
      if (alt in obj) {
        obj.packing_tips = obj[alt];
        break;
      }
    }
  }
  if (!('summary' in obj)) {
    obj.summary =
      obj.overview || obj.description || obj.condition || 'Seasonal outlook';
  }
  if (Array.isArray(obj.daily)) {
    obj.daily = obj.daily.map((item) => {
      if (!item || typeof item !== 'object') {
        return {
          date: '',
          condition: String(item),
          high_c: 0,
          low_c: 0,
          precipitation_chance: 0,
          notes: '',
        };
      }
      const d = item as Record<string, unknown>;
      return {
        date: String(d.date ?? d.day ?? ''),
        condition: String(d.condition ?? d.weather ?? d.summary ?? 'varied'),
        high_c: Number(d.high_c ?? d.high ?? d.max_c ?? 0),
        low_c: Number(d.low_c ?? d.low ?? d.min_c ?? 0),
        precipitation_chance: Number(
          d.precipitation_chance ?? d.rain_chance ?? d.precip ?? 0
        ),
        notes: String(d.notes ?? d.note ?? ''),
      };
    });
  }
  return obj;
}, z.object({
  summary: z.string(),
  daily: z.array(weatherDaySchema).default([]),
  alerts: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  packing_tips: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  source: z.string().default('llm'),
  resolved_place: z.string().default(''),
}));

export type WeatherDay = z.infer<typeof weatherDaySchema>;
export type WeatherReport = z.infer<typeof weatherReportSchema>;

export const safetyHeadlineSchema = z.object({
  title: z.string(),
  source: z.string().default(''),
  url: z.string().default(''),
  published_at: z.string().default(''),
});

export const safetyReportSchema = z.preprocess((raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  let data = { ...(raw as Record<string, unknown>) };
  for (const key of ['safety', 'safety_report', 'report']) {
    const nested = data[key];
    if (
      nested &&
      typeof nested === 'object' &&
      !Array.isArray(nested) &&
      ('summary' in (nested as object) || 'risk_level' in (nested as object))
    ) {
      const merged = { ...(nested as Record<string, unknown>) };
      for (const [k, v] of Object.entries(data)) {
        if (k !== key && !(k in merged)) merged[k] = v;
      }
      data = merged;
      break;
    }
  }
  const level = String(data.risk_level ?? 'unknown')
    .toLowerCase()
    .trim();
  const aliases: Record<string, string> = {
    ok: 'low',
    safe: 'low',
    medium: 'moderate',
    med: 'moderate',
    caution: 'moderate',
    dangerous: 'high',
    unsafe: 'high',
    critical: 'high',
  };
  const allowed = new Set(['low', 'moderate', 'high', 'unknown']);
  data.risk_level = aliases[level] ?? (allowed.has(level) ? level : 'unknown');
  if (!('safe_to_visit' in data)) {
    data.safe_to_visit = ['low', 'moderate', 'unknown'].includes(
      String(data.risk_level)
    );
  }
  return data;
}, z.object({
  summary: z.string(),
  risk_level: z.enum(['low', 'moderate', 'high', 'unknown']).default('unknown'),
  safe_to_visit: z.boolean().default(true),
  concerns: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  recommendations: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  headlines: z.array(safetyHeadlineSchema).default([]),
  sources_note: z.string().default(''),
}));

export type SafetyHeadline = z.infer<typeof safetyHeadlineSchema>;
export type SafetyReport = z.infer<typeof safetyReportSchema>;

const travelLegSchema = z.preprocess((raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return raw;
  const obj = { ...(raw as Record<string, unknown>) };
  if (obj.from != null && obj.from_place == null) obj.from_place = obj.from;
  if (obj.to != null && obj.to_place == null) obj.to_place = obj.to;
  return obj;
}, z.object({
  mode: z.string(),
  from_place: z.string().default(''),
  to_place: z.string().default(''),
  duration_hours: z.coerce.number().default(0),
  estimated_cost: z.coerce.number().default(0),
  notes: z.string().default(''),
}));

export const travelPlanSchema = z.preprocess(
  (raw) => unwrapNamedPayload(raw, ['travel', 'travel_plan', 'transport']),
  z.object({
    summary: z.string(),
    to_destination: z.array(travelLegSchema).default([]),
    local_transport: z.preprocess(coerceStrList, z.array(z.string())).default([]),
    tips: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  })
);

export type TravelLeg = z.infer<typeof travelLegSchema>;
export type TravelPlan = z.infer<typeof travelPlanSchema>;

export const hotelOptionSchema = z.object({
  name: z.string(),
  area: z.string().default(''),
  type: z.string().default(''),
  nights: z.coerce.number().int().default(1),
  price_per_night: z.coerce.number().default(0),
  total_estimate: z.coerce.number().default(0),
  why: z.string().default(''),
  pros: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  cons: z.preprocess(coerceStrList, z.array(z.string())).default([]),
});

export const hotelsPlanSchema = z.preprocess(
  (raw) =>
    unwrapNamedPayload(raw, ['hotels', 'lodging', 'stays', 'accommodation']),
  z.object({
    summary: z.string(),
    recommendations: z.array(hotelOptionSchema).default([]),
  })
);

export type HotelOption = z.infer<typeof hotelOptionSchema>;
export type HotelsPlan = z.infer<typeof hotelsPlanSchema>;

export const itineraryDaySchema = z.object({
  date: z.string(),
  theme: z.preprocess(asStr, z.string()).default(''),
  morning: z.preprocess(asStr, z.string()).default(''),
  afternoon: z.preprocess(asStr, z.string()).default(''),
  evening: z.preprocess(asStr, z.string()).default(''),
  meals: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  estimated_cost: z.coerce.number().default(0),
  weather_note: z.preprocess(asStr, z.string()).default(''),
});

export const itineraryPlanSchema = z.preprocess(
  (raw) => unwrapNamedPayload(raw, ['itinerary', 'plan', 'schedule', 'days_plan']),
  z.object({
    summary: z.string(),
    days: z.array(itineraryDaySchema).default([]),
  })
);

export type ItineraryDay = z.infer<typeof itineraryDaySchema>;
export type ItineraryPlan = z.infer<typeof itineraryPlanSchema>;

export const budgetBreakdownSchema = z.object({
  travel: z.coerce.number().default(0),
  lodging: z.coerce.number().default(0),
  food: z.coerce.number().default(0),
  activities: z.coerce.number().default(0),
  misc: z.coerce.number().default(0),
  total: z.coerce.number().default(0),
  currency: z.string().default('USD'),
  within_budget: z.boolean().default(true),
  variance: z.coerce.number().default(0),
  suggestions: z.preprocess(coerceStrList, z.array(z.string())).default([]),
});

export type BudgetBreakdown = z.infer<typeof budgetBreakdownSchema>;

export const budgetAdviceSchema = z.object({
  suggestions: z.preprocess(coerceStrList, z.array(z.string())).default([]),
});

export type BudgetAdvice = z.infer<typeof budgetAdviceSchema>;

export const critiqueIssueSchema = z.object({
  severity: z.enum(['low', 'medium', 'high']),
  area: z.string(),
  message: z.string(),
  suggestion: z.string().default(''),
});

export const critiqueSchema = z.object({
  overall_score: z.coerce.number().min(0).max(10),
  strengths: z.preprocess(coerceStrList, z.array(z.string())).default([]),
  issues: z.array(critiqueIssueSchema).default([]),
  revised_priorities: z.preprocess(coerceStrList, z.array(z.string())).default([]),
});

export type CritiqueIssue = z.infer<typeof critiqueIssueSchema>;
export type Critique = z.infer<typeof critiqueSchema>;

export interface TripMeta {
  model: string;
  agents: string[];
  generated_at: string;
}

export interface TripPlanResponse {
  trip_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  summary: string;
  weather: WeatherReport;
  safety: SafetyReport;
  travel: TravelPlan;
  hotels: HotelsPlan;
  itinerary: ItineraryPlan;
  budget: BudgetBreakdown;
  critique: Critique;
  meta: TripMeta;
}
