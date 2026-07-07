import { ZodSchema } from 'zod';

/**
 * Parses and validates query parameters against a Zod schema.
 * On validation failure, re-throws the ZodError for the errorHandler middleware to catch (→ 400).
 */
export function parseQuery<T>(schema: ZodSchema<T>, query: unknown): T {
  return schema.parse(query);
}
