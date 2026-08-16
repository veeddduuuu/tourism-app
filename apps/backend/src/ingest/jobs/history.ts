import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { historyEntries, places } from '../../db/schema';
import { loadHistoryPack } from '../packs';
import { IngestStats } from '../stats';
import type { IngestOptions } from '../types';

export async function ingestHistory(opts: IngestOptions): Promise<IngestStats> {
  const stats = new IngestStats();
  const pack = loadHistoryPack();
  const now = new Date();

  const placeRows = await db.select({ id: places.id, name: places.name, externalId: places.externalId }).from(places);
  const byExt = new Map(placeRows.filter((p) => p.externalId).map((p) => [p.externalId as string, p.id]));
  const byName = new Map(placeRows.map((p) => [p.name.toLowerCase(), p.id]));

  for (const row of pack) {
    try {
      let placeId: string | null = null;
      if (row.placeExternalId && byExt.has(row.placeExternalId)) {
        placeId = byExt.get(row.placeExternalId)!;
      } else if (row.placeName && byName.has(row.placeName.toLowerCase())) {
        placeId = byName.get(row.placeName.toLowerCase())!;
      }

      const existing = await db
        .select({ id: historyEntries.id })
        .from(historyEntries)
        .where(eq(historyEntries.externalId, row.externalId))
        .limit(1);

      const values = {
        eventTitle: row.eventTitle,
        era: row.era,
        year: row.year ?? null,
        description: row.description,
        mediaUrl: row.mediaUrl ?? null,
        placeId,
        externalId: row.externalId,
        source: 'curated',
        updatedAt: now,
      };

      if (opts.dryRun) {
        stats.record(existing[0] ? 'updated' : 'inserted');
        continue;
      }

      if (existing[0]) {
        await db.update(historyEntries).set(values).where(eq(historyEntries.id, existing[0].id));
        stats.record('updated');
      } else {
        await db.insert(historyEntries).values(values);
        stats.record('inserted');
      }
    } catch (err) {
      console.warn(`[ingest] history failed ${row.eventTitle}: ${String(err)}`);
      stats.record('failed');
    }
  }

  stats.print('history');
  return stats;
}
