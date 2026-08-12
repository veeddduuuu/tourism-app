import { BaseAgent } from './base';
import { envelopeHint, tripNights } from '../budgetMath';
import type { TripMemory } from '../memory';
import type { HotelsPlan } from '../types';
import { hotelsPlanSchema } from '../types';

export class HotelsAgent extends BaseAgent<HotelsPlan> {
  readonly name = 'hotels';
  readonly outputSchema = hotelsPlanSchema;
  readonly systemPrompt =
    'You are a lodging specialist. Recommend 2-4 stay options that FIT the ' +
    'strict hard budget cap. At least one option\'s total_estimate MUST fit ' +
    'the lodging envelope so the whole trip stays under budget. ' +
    'Prefer guesthouses/budget hotels when the cap is tight. ' +
    'total_estimate = price_per_night * nights for ALL travelers if price is ' +
    'per room; be explicit. Estimates only — not live booking. ' +
    'JSON keys: summary, recommendations[{name,area,type,nights,price_per_night,' +
    'total_estimate,why,pros[],cons[]}].';

  buildUserPrompt(memory: TripMemory): string {
    const r = memory.request;
    const nights = tripNights(memory);
    const revise = memory.scratch.budget_revise as
      | { total?: number; over_by?: number }
      | undefined;
    let extra = '';
    if (revise) {
      extra =
        `\nREVISION REQUIRED: previous total was ${revise.total} ` +
        `${r.budget.currency}, over by ${revise.over_by}. ` +
        'Pick MUCH cheaper stays. lodging envelope is strict.\n';
    }
    return (
      `Find stays in ${r.destination} (${r.start_date} to ${r.end_date}).\n` +
      `${envelopeHint(r.budget.amount, r.budget.currency, nights, r.travelers)}\n` +
      `travelers=${r.travelers}, stay_type=${r.preferences.stay_type}\n` +
      `${extra}` +
      `Context:\n${this.contextJson(memory)}`
    );
  }

  writeToMemory(memory: TripMemory, result: HotelsPlan): void {
    memory.hotels = result;
  }
}
