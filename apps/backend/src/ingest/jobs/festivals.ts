import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { festivals } from '../../db/schema';
import { loadStateNameMap } from '../lookup';
import { loadFestivalsPack } from '../packs';
import { IngestStats } from '../stats';
import type { IngestOptions } from '../types';

export async function ingestFestivals(opts: IngestOptions): Promise<IngestStats> {
  const stats = new IngestStats();
  const pack = loadFestivalsPack();
  const stateIds = await loadStateNameMap();
  const now = new Date();

  for (const row of pack) {
    try {
      const stateId = row.state ? stateIds.get(row.state) : undefined;
      if (row.state && !stateId) {
        console.warn(`[ingest] festival ${row.name}: unknown state "${row.state}"`);
        stats.record('skipped');
        continue;
      }

      const existing = await db
        .select({ id: festivals.id })
        .from(festivals)
        .where(eq(festivals.externalId, row.externalId))
        .limit(1);

      const values = {
        name: row.name,
        stateId: row.isNational ? null : stateId ?? null,
        month: row.month,
        durationDays: row.durationDays ?? null,
        description: row.description,
        traditions: row.traditions ?? null,
        isNational: Boolean(row.isNational),
        externalId: row.externalId,
        source: 'curated',
        updatedAt: now,
      };

      if (opts.dryRun) {
        stats.record(existing[0] ? 'updated' : 'inserted');
        continue;
      }

      if (existing[0]) {
        await db.update(festivals).set(values).where(eq(festivals.id, existing[0].id));
        stats.record('updated');
      } else {
        await db.insert(festivals).values(values);
        stats.record('inserted');
      }
    } catch (err) {
      console.warn(`[ingest] festival failed ${row.name}: ${String(err)}`);
      stats.record('failed');
    }
  }

  stats.print('festivals');
  return stats;
}
