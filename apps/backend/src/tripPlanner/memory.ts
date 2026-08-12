import { randomUUID } from 'crypto';
import type {
  BudgetBreakdown,
  Critique,
  HotelsPlan,
  ItineraryPlan,
  SafetyReport,
  TravelPlan,
  TripPlanRequest,
  WeatherReport,
} from './types';

/**
 * In-memory blackboard for ONE trip-planning run.
 * Agents read/write slots; orchestrator assembles the response.
 */
export class TripMemory {
  readonly request: TripPlanRequest;
  readonly trip_id: string;
  readonly created_at: string;

  weather: WeatherReport | null = null;
  safety: SafetyReport | null = null;
  travel: TravelPlan | null = null;
  hotels: HotelsPlan | null = null;
  itinerary: ItineraryPlan | null = null;
  budget: BudgetBreakdown | null = null;
  critique: Critique | null = null;

  log: string[] = [];
  scratch: Record<string, unknown> = {};
  agents_run: string[] = [];

  constructor(request: TripPlanRequest) {
    this.request = request;
    this.trip_id = randomUUID();
    this.created_at = new Date().toISOString();
  }

  note(agent: string, message: string): void {
    this.log.push(`[${agent}] ${message}`);
  }

  markRan(agent: string): void {
    if (!this.agents_run.includes(agent)) {
      this.agents_run.push(agent);
    }
  }

  /** Compact view of filled slots for agent prompts. */
  snapshot(compact = true): Record<string, unknown> {
    const out: Record<string, unknown> = {
      request: this.request,
      scratch: Object.keys(this.scratch).length ? this.scratch : null,
    };

    if (this.weather) {
      const w = this.weather;
      out.weather = {
        summary: w.summary,
        source: w.source,
        resolved_place: w.resolved_place,
        alerts: w.alerts.slice(0, 3),
        packing_tips: w.packing_tips.slice(0, 3),
        daily: (compact ? w.daily.slice(0, 7) : w.daily).map((d) => ({
          date: d.date,
          condition: d.condition,
          high_c: d.high_c,
          low_c: d.low_c,
        })),
      };
    }

    if (this.safety) {
      const s = this.safety;
      out.safety = {
        summary: s.summary,
        risk_level: s.risk_level,
        safe_to_visit: s.safe_to_visit,
        concerns: s.concerns.slice(0, 5),
        recommendations: s.recommendations.slice(0, 5),
        headlines: s.headlines.slice(0, 5).map((h) => ({
          title: h.title,
          source: h.source,
          published_at: h.published_at,
        })),
      };
    }

    if (this.travel) {
      const t = this.travel;
      out.travel = {
        summary: t.summary,
        to_destination: t.to_destination.slice(0, 4).map((leg) => ({
          mode: leg.mode,
          from: leg.from_place,
          to: leg.to_place,
          estimated_cost: leg.estimated_cost,
        })),
        tips: t.tips.slice(0, 3),
      };
    }

    if (this.hotels) {
      out.hotels = {
        summary: this.hotels.summary,
        recommendations: this.hotels.recommendations.slice(0, 3).map((h) => ({
          name: h.name,
          area: h.area,
          type: h.type,
          nights: h.nights,
          price_per_night: h.price_per_night,
          total_estimate: h.total_estimate,
        })),
      };
    }

    if (this.itinerary) {
      out.itinerary = {
        summary: this.itinerary.summary,
        days: this.itinerary.days.map((d) => ({
          date: d.date,
          theme: d.theme,
          estimated_cost: d.estimated_cost,
          morning: d.morning.slice(0, 120),
          afternoon: d.afternoon.slice(0, 120),
          evening: d.evening.slice(0, 120),
        })),
      };
    }

    if (this.budget) {
      out.budget = this.budget;
    }

    return out;
  }
}
