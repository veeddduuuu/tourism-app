import { BaseAgent } from './base';
import { envelopeHint, remainingDailyHint, tripNights } from '../budgetMath';
import type { TripMemory } from '../memory';
import type { ItineraryPlan } from '../types';
import { itineraryPlanSchema } from '../types';

export class ItineraryAgent extends BaseAgent<ItineraryPlan> {
  readonly name = 'itinerary';
  readonly outputSchema = itineraryPlanSchema;
  readonly systemPrompt =
    'You are an itinerary designer. Build a realistic day-by-day plan ' +
    'using weather, lodging area, and traveler interests. Match pace ' +
    '(relaxed/moderate/packed). Put outdoor stuff on better weather days. ' +
    'STRICT RULE: sum(estimated_cost) across all days MUST fit the remaining ' +
    'budget after lodging + travel. Skip expensive add-ons ' +
    '(golf, spa packages, private guides) unless they fit the remaining money. ' +
    'Respect safety concerns (avoid flooded zones, protest areas, landslide roads). ' +
    'estimated_cost = food + activities for that day for the whole group. ' +
    'JSON keys: summary, days[{date,theme,morning,afternoon,evening,meals[],' +
    'estimated_cost,weather_note}].';

  buildUserPrompt(memory: TripMemory): string {
    const r = memory.request;
    const nights = tripNights(memory);
    const revise = memory.scratch.budget_revise as
      | { total?: number; over_by?: number }
      | undefined;
    let extra = '';
    if (revise) {
      extra =
        `\nREVISION REQUIRED: cut daily spend. Previous total ` +
        `${revise.total} was over by ${revise.over_by} ` +
        `${r.budget.currency}. Prefer free/cheap sights, local food. ` +
        'Sum of daily estimated_cost must fit the remaining pool.\n';
    }
    return (
      `Build itinerary for ${r.destination} (${r.start_date} → ${r.end_date}).\n` +
      `${envelopeHint(r.budget.amount, r.budget.currency, nights, r.travelers)}\n` +
      `${remainingDailyHint(memory)}\n` +
      `Pace=${r.preferences.pace}, interests=${r.preferences.interests}\n` +
      `${extra}` +
      `Context:\n${this.contextJson(memory)}`
    );
  }

  writeToMemory(memory: TripMemory, result: ItineraryPlan): void {
    memory.itinerary = result;
  }
}
