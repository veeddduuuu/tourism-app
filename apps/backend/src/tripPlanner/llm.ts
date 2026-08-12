import Groq from 'groq-sdk';
import type { ZodType, ZodTypeDef } from 'zod';
import { ZodError } from 'zod';

const JSON_BLOCK = /```(?:json)?\s*([\s\S]*?)\s*```/i;

export class GroqRateLimited extends Error {
  readonly retryAfterS: number | null;

  constructor(message: string, retryAfterS: number | null = null) {
    super(message);
    this.name = 'GroqRateLimited';
    this.retryAfterS = retryAfterS;
  }
}

export class TripPlannerConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TripPlannerConfigError';
  }
}

function extractJson(text: string): unknown {
  let raw = text.trim();
  const match = JSON_BLOCK.exec(raw);
  if (match) raw = match[1].trim();
  return JSON.parse(raw);
}

function retryAfterSeconds(err: unknown): number | null {
  if (err && typeof err === 'object') {
    const headers = (err as { headers?: Record<string, string> }).headers;
    const raw = headers?.['retry-after'] ?? headers?.['Retry-After'];
    if (raw) {
      const n = Number(raw);
      if (!Number.isNaN(n)) return n;
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  const m = /try again in ([\d.]+)s/i.exec(msg);
  return m ? Number(m[1]) : null;
}

function isRateLimitError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: number; statusCode?: number }).status
    ?? (err as { statusCode?: number }).statusCode;
  if (status === 429) return true;
  const name = (err as { constructor?: { name?: string } }).constructor?.name ?? '';
  if (name.includes('RateLimit')) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /rate.?limit|429/i.test(msg);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class TripPlannerLlm {
  readonly model: string;
  private readonly client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY ?? '';
    if (!apiKey) {
      throw new TripPlannerConfigError(
        'GROQ_API_KEY is missing. Add it to .env to enable trip planning.'
      );
    }
    this.model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
    this.client = new Groq({ apiKey });
  }

  async completeJson<T>(opts: {
    system: string;
    user: string;
    schema: ZodType<T, ZodTypeDef, unknown>;
    temperature?: number;
    retries?: number;
  }): Promise<T> {
    const { system, user, schema, temperature = 0.3, retries = 1 } = opts;
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content:
          `${system}\n\n` +
          'Respond with ONLY valid JSON matching the required shape. ' +
          'Use double quotes for all keys/strings. Arrays must be JSON arrays. ' +
          'No markdown, no commentary. Keep strings concise.',
      },
      { role: 'user', content: user },
    ];

    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.createValidated(
          messages,
          schema,
          attempt === 0 ? temperature : 0.1
        );
      } catch (err) {
        if (err instanceof GroqRateLimited) throw err;
        if (
          err instanceof ZodError ||
          err instanceof SyntaxError ||
          (err instanceof Error && /json|parse|validation/i.test(err.message))
        ) {
          lastErr = err;
          messages.push({
            role: 'user',
            content:
              'Your previous reply was invalid JSON or failed schema validation. ' +
              `Error: ${err instanceof Error ? err.message : String(err)}. ` +
              'Reply again with ONLY valid JSON.',
          });
          continue;
        }
        throw err;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  }

  private async createValidated<T>(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    schema: ZodType<T, ZodTypeDef, unknown>,
    temperature: number
  ): Promise<T> {
    for (let rateTry = 0; rateTry < 3; rateTry++) {
      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages,
          temperature,
          response_format: { type: 'json_object' },
          max_tokens: 2048,
        });
        const content = completion.choices[0]?.message?.content ?? '{}';
        const data = extractJson(content);
        return schema.parse(data);
      } catch (err) {
        if (isRateLimitError(err)) {
          const wait = retryAfterSeconds(err) ?? 5;
          if (wait > 90 || rateTry === 2) {
            throw new GroqRateLimited(
              `Groq rate limit on \`${this.model}\`. ${err instanceof Error ? err.message : err}`,
              wait
            );
          }
          await sleep(Math.min((wait + 0.5) * 1000, 30_000));
          continue;
        }
        throw err;
      }
    }
    throw new GroqRateLimited(`Groq rate limit on \`${this.model}\`.`);
  }
}

let shared: TripPlannerLlm | null = null;

export function getTripPlannerLlm(): TripPlannerLlm {
  if (!shared) shared = new TripPlannerLlm();
  return shared;
}

export function resetTripPlannerLlm(): void {
  shared = null;
}
