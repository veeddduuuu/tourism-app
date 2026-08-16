import { db } from '../db';
import { states } from '../db/schema';

export async function loadStateNameMap(): Promise<Map<string, string>> {
  const rows = await db.select({ id: states.id, name: states.name }).from(states);
  return new Map(rows.map((r) => [r.name, r.id]));
}
