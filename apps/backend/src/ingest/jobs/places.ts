import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { cities, places, states } from '../../db/schema';
import { categoryFromClassIds } from '../category';
import { discoverPlacesAround } from '../clients/wikidata';
import {
  clipBrief,
  fetchWikipediaSummaries,
  loadWikipediaCache,
  lookupWikipediaSummary,
  saveWikipediaCache,
} from '../clients/wikipedia';
import { fmtCoord, haversineKm } from '../geo';
import { loadCitiesPack } from '../packs';
import { IngestStats } from '../stats';
import type { IngestOptions, WikidataPlace } from '../types';

function mergeImages(...urls: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of urls) {
    if (!u) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

async function upsertPlace(
  dryRun: boolean,
  row: {
    cityId: string;
    name: string;
    category: string;
    lat: string;
    lng: string;
    historyBrief: string | null;
    images: string[];
    wikipediaUrl: string | null;
    externalId: string;
    source: string;
  }
): Promise<'inserted' | 'updated'> {
  const byExt = await db
    .select({ id: places.id, cityId: places.cityId })
    .from(places)
    .where(eq(places.externalId, row.externalId))
    .limit(1);

  const byName = byExt[0]
    ? []
    : await db
        .select({ id: places.id })
        .from(places)
        .where(and(eq(places.cityId, row.cityId), eq(places.name, row.name)))
        .limit(1);

  const existing = byExt[0] ?? byName[0];
  const now = new Date();
  const values = {
    name: row.name,
    category: row.category,
    lat: row.lat,
    lng: row.lng,
    historyBrief: row.historyBrief,
    images: row.images,
    wikipediaUrl: row.wikipediaUrl,
    externalId: row.externalId,
    source: row.source,
    updatedAt: now,
    cityId: byExt[0]?.cityId ?? row.cityId,
  };

  if (dryRun) return existing ? 'updated' : 'inserted';

  if (existing) {
    await db.update(places).set(values).where(eq(places.id, existing.id));
    return 'updated';
  }

  await db.insert(places).values({ ...values, cityId: row.cityId });
  return 'inserted';
}

export async function ingestPlaces(opts: IngestOptions): Promise<IngestStats> {
  const stats = new IngestStats();
  const pack = loadCitiesPack().filter((c) =>
    opts.cityFilter ? c.name.toLowerCase() === opts.cityFilter.toLowerCase() : true
  );

  const cityRows = await db
    .select({
      id: cities.id,
      name: cities.name,
      lat: cities.lat,
      lng: cities.lng,
      stateName: states.name,
    })
    .from(cities)
    .leftJoin(states, eq(cities.stateId, states.id));

  const cityByName = new Map(cityRows.map((c) => [c.name.toLowerCase(), c]));

  loadWikipediaCache();
  const existingPlaceRows = await db
    .select({
      externalId: places.externalId,
      historyBrief: places.historyBrief,
    })
    .from(places);
  const alreadyEnriched = new Set(
    existingPlaceRows
      .filter((p) => p.externalId && p.historyBrief && !opts.refreshWikipedia)
      .map((p) => p.externalId as string)
  );
  if (alreadyEnriched.size > 0) {
    console.log(`[ingest] skipping Wikipedia for ${alreadyEnriched.size} places that already have briefs`);
  }

  for (const spec of pack) {
    const city = cityByName.get(spec.name.toLowerCase());
    if (!city?.id || !city.lat || !city.lng) {
      console.warn(`[ingest] skip places for ${spec.name}: city missing in DB or lacks coords`);
      stats.record('skipped');
      continue;
    }

    const lat = Number(city.lat);
    const lng = Number(city.lng);
    const radius = spec.radiusKm ?? 25;
    const cap = opts.capOverride ?? spec.placeCap ?? 14;
    const fetchLimit = Math.max(cap * 2, 24);

    console.log(`[ingest] places around ${spec.name} (${lat},${lng}) r=${radius}km cap=${cap}`);

    let discovered: WikidataPlace[] = [];
    try {
      discovered = await discoverPlacesAround(lat, lng, radius, fetchLimit);
    } catch (err) {
      console.warn(`[ingest] Wikidata failed for ${spec.name}: ${String(err)}`);
      stats.record('failed');
      continue;
    }

    const ranked = discovered
      .map((p) => ({ ...p, dist: haversineKm(lat, lng, p.lat, p.lng) }))
      .filter((p) => p.dist <= radius + 1)
      .sort((a, b) => a.dist - b.dist);

    const seen = new Set<string>();
    const picked: typeof ranked = [];
    for (const p of ranked) {
      if (spec.wikidataId && p.qid === spec.wikidataId) continue;
      if (p.name.toLowerCase() === spec.name.toLowerCase()) continue;
      if (seen.has(p.qid) || seen.has(p.name.toLowerCase())) continue;
      seen.add(p.qid);
      seen.add(p.name.toLowerCase());
      picked.push(p);
      if (picked.length >= cap) break;
    }

    const needWiki = picked.filter((p) => !opts.skipWikipedia && !alreadyEnriched.has(p.qid));
    if (needWiki.length > 0) {
      await fetchWikipediaSummaries(needWiki.map((p) => p.wikipediaUrl || p.name));
      saveWikipediaCache();
    }

    for (const p of picked) {
      try {
        if (alreadyEnriched.has(p.qid)) {
          stats.record('skipped');
          continue;
        }

        let brief: string | null = null;
        let wikiUrl = p.wikipediaUrl ?? null;
        let thumb = p.imageUrl ?? null;

        if (!opts.skipWikipedia) {
          const summary = lookupWikipediaSummary(p.wikipediaUrl || p.name);
          if (summary?.extract) brief = clipBrief(summary.extract);
          if (summary?.url) wikiUrl = summary.url;
          if (summary?.thumbnail) thumb = thumb ?? summary.thumbnail;
        }

        if (!brief) {
          stats.record('skipped');
          continue;
        }

        const action = await upsertPlace(opts.dryRun, {
          cityId: city.id,
          name: p.name,
          category: categoryFromClassIds(p.classIds),
          lat: fmtCoord(p.lat),
          lng: fmtCoord(p.lng),
          historyBrief: brief,
          images: mergeImages(thumb, p.imageUrl),
          wikipediaUrl: wikiUrl,
          externalId: p.qid,
          source: 'wikidata+wikipedia',
        });
        stats.record(action);
        alreadyEnriched.add(p.qid);
      } catch (err) {
        console.warn(`[ingest] place failed ${p.name}: ${String(err)}`);
        stats.record('failed');
      }
    }
  }

  stats.print('places');
  return stats;
}
