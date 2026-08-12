import { BudgetAgent } from './agents/budget';
import { CriticAgent } from './agents/critic';
import { HotelsAgent } from './agents/hotels';
import { ItineraryAgent } from './agents/itinerary';
import { SafetyAgent } from './agents/safety';
import { TravelAgent } from './agents/travel';
import { WeatherAgent } from './agents/weather';
import { enforceHardCap, reconcileBudget } from './budgetMath';
import { getTripPlannerLlm } from './llm';
import { TripMemory } from './memory';
import type { TripPlanRequest, TripPlanResponse } from './types';

/**
 * Pipeline:
 *  1) weather + travel + safety in parallel
 *  2) hotels → itinerary → budget
 *  3) if over budget → full revise pass
 *  4) if still over → itinerary-only cut pass
 *  5) deterministic hard-cap enforce
 *  6) critic
 *  7) assemble response
 */
export class Orchestrator {
  private weather: WeatherAgent;
  private safety: SafetyAgent;
  private travel: TravelAgent;
  private hotels: HotelsAgent;
  private itinerary: ItineraryAgent;
  private budget: BudgetAgent;
  private critic: CriticAgent;

  constructor() {
    const llm = getTripPlannerLlm();
    this.weather = new WeatherAgent(llm);
    this.safety = new SafetyAgent(llm);
    this.travel = new TravelAgent(llm);
    this.hotels = new HotelsAgent(llm);
    this.itinerary = new ItineraryAgent(llm);
    this.budget = new BudgetAgent(llm);
    this.critic = new CriticAgent(llm);
  }

  async plan(request: TripPlanRequest): Promise<TripPlanResponse> {
    const memory = new TripMemory(request);
    memory.note('orchestrator', 'pipeline started');

    await Promise.all([
      this.weather.run(memory),
      this.travel.run(memory),
      this.safety.run(memory),
    ]);

    await this.hotels.run(memory);
    await this.itinerary.run(memory);
    await this.budget.run(memory);

    if (memory.budget && !memory.budget.within_budget) {
      const over = memory.budget.variance;
      memory.scratch.budget_revise = {
        total: memory.budget.total,
        over_by: over,
        pass: 'full',
      };
      memory.note('orchestrator', `over budget by ${over}; running full revise pass`);
      await this.travel.run(memory);
      await this.hotels.run(memory);
      await this.itinerary.run(memory);
      await this.budget.run(memory);
    }

    if (memory.budget && !memory.budget.within_budget) {
      const over = memory.budget.variance;
      memory.scratch.budget_revise = {
        total: memory.budget.total,
        over_by: over,
        pass: 'itinerary',
      };
      memory.note('orchestrator', `still over by ${over}; itinerary-only cut pass`);
      await this.itinerary.run(memory);
      await this.budget.run(memory);
    }

    const cutNotes = enforceHardCap(memory);
    if (cutNotes.length) {
      memory.note('orchestrator', 'hard-cap enforce: ' + cutNotes.join('; '));
    }
    const prior = memory.budget?.suggestions ?? [];
    memory.budget = reconcileBudget(memory, [...prior, ...cutNotes]);
    if (!memory.budget.within_budget) {
      throw new Error('hard-cap enforce must leave plan under budget');
    }

    await this.critic.run(memory);

    memory.note('orchestrator', 'pipeline finished');
    return this.toResponse(memory);
  }

  private toResponse(memory: TripMemory): TripPlanResponse {
    if (
      !memory.weather ||
      !memory.safety ||
      !memory.travel ||
      !memory.hotels ||
      !memory.itinerary ||
      !memory.budget ||
      !memory.critique
    ) {
      throw new Error('incomplete trip memory after pipeline');
    }

    const summaryBits = [
      memory.weather.summary,
      memory.safety.summary,
      memory.itinerary.summary,
      `Safety: ${memory.safety.risk_level} (safe_to_visit=${memory.safety.safe_to_visit}).`,
      `Budget ok: ${memory.budget.within_budget}.`,
      `Critic score: ${memory.critique.overall_score}/10.`,
    ];

    return {
      trip_id: memory.trip_id,
      destination: memory.request.destination,
      start_date: memory.request.start_date,
      end_date: memory.request.end_date,
      summary: summaryBits.join(' '),
      weather: memory.weather,
      safety: memory.safety,
      travel: memory.travel,
      hotels: memory.hotels,
      itinerary: memory.itinerary,
      budget: memory.budget,
      critique: memory.critique,
      meta: {
        model: getTripPlannerLlm().model,
        agents: memory.agents_run,
        generated_at: new Date().toISOString(),
      },
    };
  }
}

export async function planTrip(request: TripPlanRequest): Promise<TripPlanResponse> {
  const orchestrator = new Orchestrator();
  return orchestrator.plan(request);
}
