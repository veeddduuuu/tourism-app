import type { ZodType, ZodTypeDef } from 'zod';
import type { TripPlannerLlm } from '../llm';
import { getTripPlannerLlm } from '../llm';
import type { TripMemory } from '../memory';

/** An agent = role prompt + read memory + call LLM + write memory. */
export abstract class BaseAgent<T> {
  abstract readonly name: string;
  abstract readonly systemPrompt: string;
  abstract readonly outputSchema: ZodType<T, ZodTypeDef, unknown>;

  protected llm: TripPlannerLlm;

  constructor(llm?: TripPlannerLlm) {
    this.llm = llm ?? getTripPlannerLlm();
  }

  abstract buildUserPrompt(memory: TripMemory): string;
  abstract writeToMemory(memory: TripMemory, result: T): void;

  async run(memory: TripMemory): Promise<T> {
    memory.note(this.name, 'started');
    const userPrompt = this.buildUserPrompt(memory);
    const result = await this.llm.completeJson({
      system: this.systemPrompt,
      user: userPrompt,
      schema: this.outputSchema,
    });
    this.writeToMemory(memory, result);
    memory.markRan(this.name);
    memory.note(this.name, 'finished');
    return result;
  }

  protected contextJson(memory: TripMemory): string {
    return JSON.stringify(memory.snapshot(), null, 2);
  }
}
