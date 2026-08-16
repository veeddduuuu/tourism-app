import '../config';

import { ingestCities } from './jobs/cities';
import { ingestFestivals } from './jobs/festivals';
import { ingestFoods } from './jobs/foods';
import { ingestHistory } from './jobs/history';
import { ingestPlaces } from './jobs/places';
import { ingestStates } from './jobs/states';
import { INGEST_JOBS, type IngestJobName, type IngestOptions } from './types';

function flag(name: string): boolean {
  return process.argv.includes(name);
}

function argValue(name: string): string | undefined {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function parseJobs(): IngestJobName[] {
  const raw = argValue('--jobs');
  if (!raw) return [...INGEST_JOBS];
  const jobs = raw.split(',').map((s) => s.trim()) as IngestJobName[];
  for (const j of jobs) {
    if (!INGEST_JOBS.includes(j)) {
      throw new Error(`Unknown job "${j}". Allowed: ${INGEST_JOBS.join(', ')}`);
    }
  }
  return jobs;
}

async function main(): Promise<void> {
  const capRaw = argValue('--cap');
  const opts: IngestOptions = {
    dryRun: flag('--dry-run'),
    jobs: parseJobs(),
    cityFilter: argValue('--city'),
    capOverride: capRaw ? Number(capRaw) : undefined,
    skipWikipedia: flag('--skip-wikipedia'),
    skipMealDb: flag('--skip-mealdb'),
    refreshWikipedia: flag('--refresh-wikipedia'),
  };

  if (opts.capOverride !== undefined && !Number.isFinite(opts.capOverride)) {
    throw new Error('--cap must be a number');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required (dry-run still checks existing rows)');
  }

  console.log(
    `[ingest] starting jobs=${opts.jobs.join(',')} dryRun=${opts.dryRun} city=${opts.cityFilter ?? '*'} skipWikipedia=${opts.skipWikipedia}`
  );

  const run = opts.jobs.includes.bind(opts.jobs);
  if (run('states')) await ingestStates(opts);
  if (run('cities')) await ingestCities(opts);
  if (run('places')) await ingestPlaces(opts);
  if (run('foods')) await ingestFoods(opts);
  if (run('festivals')) await ingestFestivals(opts);
  if (run('history')) await ingestHistory(opts);

  console.log('[ingest] done');
}

main().catch((err) => {
  console.error('[ingest] failed:', err);
  process.exit(1);
});
