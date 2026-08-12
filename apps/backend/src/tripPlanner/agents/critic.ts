import { BaseAgent } from './base';
import type { TripMemory } from '../memory';
import type { Critique } from '../types';
import { critiqueSchema } from '../types';

export class CriticAgent extends BaseAgent<Critique> {
  readonly name = 'critic';
  readonly outputSchema = critiqueSchema;
  readonly systemPrompt =
    'You are a skeptical trip critic. Review the full draft for ' +
    'unrealistic timing, budget lies, weather clashes, missing buffers, ' +
    'weak lodging choices, and safety red flags. ' +
    'The user has a STRICT hard budget cap; ' +
    'the API enforces total ≤ budget, so flag unrealistic activity ' +
    'descriptions that no longer match scaled costs. ' +
    'If safety.risk_level is high or safe_to_visit is false, severity must ' +
    'be high for safety. Score 0-10. ' +
    'Be specific and constructive. ' +
    'JSON keys: overall_score, strengths[], issues[{severity,area,message,suggestion}], ' +
    'revised_priorities[].';

  buildUserPrompt(memory: TripMemory): string {
    return (
      'Critique this trip plan. Flag real problems, not nitpicks.\n' +
      this.contextJson(memory)
    );
  }

  writeToMemory(memory: TripMemory, result: Critique): void {
    memory.critique = result;
  }
}
