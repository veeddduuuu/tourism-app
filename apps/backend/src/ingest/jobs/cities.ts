import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { cities } from '../../db/schema';
import { fmtCoord } from '../geo';
import { loadStateNameMap } from '../lookup';
import { loadCitiesPack } from '../packs';
import { IngestStats } from '../stats';
import type { IngestOptions } from '../types';

export async function ingestCities(opts: IngestOptions): Promise<IngestStats> {
  const stats = new IngestStats();
  const pack = loadCitiesPack().filter((c) =>
    opts.cityFilter ? c.name.toLowerCase() === opts.cityFilter.toLowerCase() : true
  );
  const stateIds = await loadStateNameMap();
  const now = new Date();

  for (const row of pack) {
    try {
      if (!Number.isFinite(row.lat) || !Number.isFinite(row.lng)) {
        console.warn(`[ingest] skip city without coords: ${row.name}`);
        stats.record('skipped');
        continue;
      }

      const stateId = stateIds.get(row.state);
      if (!stateId) {
        console.warn(`[ingest] skip city ${row.name}: unknown state "${row.state}"`);
        stats.record('skipped');
        continue;
      }

      const existing = await db
        .select({ id: cities.id })
        .from(cities)
        .where(and(eq(cities.stateId, stateId), eq(cities.name, row.name)))
        .limit(1);

      const values = {
        name: row.name,
        stateId,
        lat: fmtCoord(row.lat),
        lng: fmtCoord(row.lng),
        description: row.description ?? null,
        externalId: row.wikidataId ?? null,
        source: 'curated',
        updatedAt: now,
      };

      if (opts.dryRun) {
        stats.record(existing[0] ? 'updated' : 'inserted');
        continue;
      }

      if (existing[0]) {
        await db.update(cities).set(values).where(eq(cities.id, existing[0].id));
        stats.record('updated');
      } else {
        await db.insert(cities).values(values);
        stats.record('inserted');
      }
    } catch (err) {
      console.warn(`[ingest] city failed ${row.name}: ${String(err)}`);
      stats.record('failed');
    }
  }

  stats.print('cities');
  return stats;
}
