import { BaseAgent } from './base';
import { envelopeHint, tripNights } from '../budgetMath';
import type { TripMemory } from '../memory';
import type { TravelPlan } from '../types';
import { travelPlanSchema } from '../types';

export class TravelAgent extends BaseAgent<TravelPlan> {
  readonly name = 'travel';
  readonly outputSchema = travelPlanSchema;
  readonly systemPrompt =
    'You are a travel logistics specialist. Suggest how to reach the ' +
    'destination and move around locally. Costs are planning estimates ' +
    "in the user's currency — not live ticket prices. " +
    'STRICT RULE: the cheapest to_destination option MUST fit the travel ' +
    'envelope of the total budget. ' +
    'Include at least one affordable option (train/bus) when the budget is tight. ' +
    'List alternatives in to_destination but do NOT assume the traveler buys all of them. ' +
    'JSON keys: summary, to_destination[{mode,from,to,duration_hours,estimated_cost,notes}], ' +
    'local_transport (array of plain strings), tips (array of plain strings). ' +
    "Use 'from' and 'to' for place names. Do NOT nest objects inside local_transport or tips.";

  buildUserPrompt(memory: TripMemory): string {
    const r = memory.request;
    const origin = r.origin || "traveler's home city (unspecified)";
    const nights = tripNights(memory);
    const revise = memory.scratch.budget_revise as
      | { over_by?: number }
      | undefined;
    let extra = '';
    if (revise) {
      extra =
        `\nREVISION REQUIRED: previous plan over by ${revise.over_by} ` +
        `${r.budget.currency}. Prefer train/bus over flights if needed.\n`;
    }
    return (
      `Origin: ${origin}\nDestination: ${r.destination}\n` +
      `Dates: ${r.start_date} → ${r.end_date}\n` +
      `${envelopeHint(r.budget.amount, r.budget.currency, nights, r.travelers)}\n` +
      `Preferred mode: ${r.preferences.transport_mode}\n` +
      `${extra}` +
      `Context:\n${this.contextJson(memory)}`
    );
  }

  writeToMemory(memory: TripMemory, result: TravelPlan): void {
    memory.travel = result;
  }
}
