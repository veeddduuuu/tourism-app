import { BaseAgent } from './base';
import { reconcileBudget } from '../budgetMath';
import type { TripMemory } from '../memory';
import type { BudgetAdvice, BudgetBreakdown } from '../types';
import { budgetAdviceSchema } from '../types';

export class BudgetAgent extends BaseAgent<BudgetAdvice> {
  readonly name = 'budget';
  readonly outputSchema = budgetAdviceSchema;
  readonly systemPrompt =
    'You are a trip budget coach. The numeric totals are computed separately ' +
    'and the hard cap is absolute (total must be ≤ budget). ' +
    'Given the plan and whether it is over/under the hard cap, return ONLY ' +
    'practical cut or keep suggestions as plain strings. ' +
    'JSON: {"suggestions": ["..."]}.';

  buildUserPrompt(memory: TripMemory): string {
    const r = memory.request;
    const draft = reconcileBudget(memory);
    const status = draft.within_budget ? 'within budget' : 'OVER BUDGET';
    return (
      `STRICT hard cap: ${r.budget.amount} ${r.budget.currency} (must not exceed). ` +
      `Current rollup total=${draft.total} (${status}, variance=${draft.variance}). ` +
      `Breakdown: travel=${draft.travel}, lodging=${draft.lodging}, ` +
      `food=${draft.food}, activities=${draft.activities}.\n` +
      'If over budget, suggest concrete cuts. If under, optional upgrades.\n' +
      `Context:\n${this.contextJson(memory)}`
    );
  }

  writeToMemory(memory: TripMemory, result: BudgetAdvice): void {
    memory.budget = reconcileBudget(memory, result.suggestions);
  }

  async run(memory: TripMemory): Promise<BudgetBreakdown> {
    memory.note(this.name, 'started');
    const advice = await this.llm.completeJson({
      system: this.systemPrompt,
      user: this.buildUserPrompt(memory),
      schema: this.outputSchema,
      temperature: 0.2,
    });
    this.writeToMemory(memory, advice);
    memory.markRan(this.name);
    memory.note(this.name, 'finished');
    if (!memory.budget) throw new Error('budget missing after budget agent');
    return memory.budget;
  }
}
