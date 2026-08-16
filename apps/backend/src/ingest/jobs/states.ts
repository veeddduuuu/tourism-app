import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { states } from '../../db/schema';
import { loadStatesPack } from '../packs';
import { IngestStats } from '../stats';
import type { IngestOptions } from '../types';

export async function ingestStates(opts: IngestOptions): Promise<IngestStats> {
  const stats = new IngestStats();
  const pack = loadStatesPack();
  const now = new Date();

  for (const row of pack) {
    try {
      const existing = await db.select({ id: states.id }).from(states).where(eq(states.name, row.name)).limit(1);
      const values = {
        name: row.name,
        capital: row.capital ?? null,
        region: row.region ?? null,
        language: row.language ?? null,
        description: row.description ?? null,
        bestSeason: row.bestSeason ?? null,
        source: 'curated',
        updatedAt: now,
      };

      if (opts.dryRun) {
        stats.record(existing[0] ? 'updated' : 'inserted');
        continue;
      }

      if (existing[0]) {
        await db.update(states).set(values).where(eq(states.id, existing[0].id));
        stats.record('updated');
      } else {
        await db.insert(states).values(values);
        stats.record('inserted');
      }
    } catch (err) {
      console.warn(`[ingest] state failed ${row.name}: ${String(err)}`);
      stats.record('failed');
    }
  }

  stats.print('states');
  return stats;
}
