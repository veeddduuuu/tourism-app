import fs from 'fs';
import path from 'path';
import { fetchJson, sleep } from '../http';
import type { WikipediaSummary } from '../types';

const BATCH_SIZE = 15;
const GAP_MS = Number(process.env.INGEST_WIKI_GAP_MS || 1500);
const cache = new Map<string, WikipediaSummary>();

function cacheFile(): string {
  return path.resolve(__dirname, '../../.cache/wikipedia-summaries.json');
}

export function titleFromWikiUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const marker = '/wiki/';
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(u.pathname.slice(idx + marker.length).replace(/_/g, ' '));
  } catch {
    return null;
  }
}

export function loadWikipediaCache(): void {
  const file = cacheFile();
  if (!fs.existsSync(file)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, WikipediaSummary>;
    for (const [k, v] of Object.entries(parsed)) cache.set(k, v);
    console.log(`[ingest] wikipedia disk cache: ${cache.size} titles`);
  } catch (err) {
    console.warn(`[ingest] wikipedia cache unreadable: ${String(err)}`);
  }
}

export function saveWikipediaCache(): void {
  const file = cacheFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const obj: Record<string, WikipediaSummary> = {};
  for (const [k, v] of cache.entries()) obj[k] = v;
  fs.writeFileSync(file, JSON.stringify(obj));
}

function cacheKey(title: string): string {
  return title.replace(/_/g, ' ').trim().toLowerCase();
}

interface ActionPage {
  title?: string;
  extract?: string;
  fullurl?: string;
  missing?: boolean;
  thumbnail?: { source?: string };
}

interface ActionResponse {
  query?: {
    redirects?: { from: string; to: string }[];
    normalized?: { from: string; to: string }[];
    pages?: ActionPage[];
  };
}

async function fetchBatch(titles: string[]): Promise<void> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    redirects: '1',
    prop: 'extracts|pageimages|info',
    exintro: '1',
    explaintext: '1',
    exlimit: String(Math.min(20, titles.length)),
    inprop: 'url',
    pithumbsize: '800',
    titles: titles.join('|'),
  });
  const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
  const json = await fetchJson<ActionResponse>(url, {
    timeoutMs: 45_000,
    retries: 6,
  });

  const alias = new Map<string, string>();
  for (const n of json.query?.normalized ?? []) alias.set(n.to, n.from);
  for (const r of json.query?.redirects ?? []) {
    const original = alias.get(r.from) ?? r.from;
    alias.set(r.to, original);
  }

  for (const page of json.query?.pages ?? []) {
    const title = page.title;
    if (!title) continue;
    const requested = alias.get(title) ?? title;
    const summary: WikipediaSummary = page.missing
      ? { extract: null, url: null, thumbnail: null }
      : {
          extract: page.extract?.trim() ? page.extract.trim() : null,
          url: page.fullurl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
          thumbnail: page.thumbnail?.source ?? null,
        };
    cache.set(cacheKey(title), summary);
    cache.set(cacheKey(requested), summary);
  }

  await sleep(GAP_MS);
}

/**
 * Fetch intro extracts via the MediaWiki Action API (batched).
 * Prefer this over rest_v1/page/summary — that gateway 429s quickly.
 */
export async function fetchWikipediaSummaries(titlesOrUrls: string[]): Promise<Map<string, WikipediaSummary>> {
  const wanted: string[] = [];
  const seen = new Set<string>();
  for (const raw of titlesOrUrls) {
    const title = raw.startsWith('http') ? titleFromWikiUrl(raw) : raw;
    if (!title) continue;
    const key = cacheKey(title);
    if (seen.has(key)) continue;
    seen.add(key);
    if (!cache.has(key)) wanted.push(title.replace(/_/g, ' ').trim());
  }

  for (let i = 0; i < wanted.length; i += BATCH_SIZE) {
    const slice = wanted.slice(i, i + BATCH_SIZE);
    try {
      await fetchBatch(slice);
    } catch (err) {
      console.warn(`[ingest] wikipedia batch failed (${slice.length} titles): ${String(err)}`);
    }
  }

  const out = new Map<string, WikipediaSummary>();
  for (const raw of titlesOrUrls) {
    const title = raw.startsWith('http') ? titleFromWikiUrl(raw) : raw;
    if (!title) continue;
    const hit = cache.get(cacheKey(title));
    if (hit) out.set(cacheKey(title), hit);
  }
  return out;
}

export function lookupWikipediaSummary(titleOrUrl: string): WikipediaSummary | null {
  const title = titleOrUrl.startsWith('http') ? titleFromWikiUrl(titleOrUrl) : titleOrUrl;
  if (!title) return null;
  return cache.get(cacheKey(title)) ?? null;
}

export function clipBrief(text: string, max = 900): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const last = cut.lastIndexOf('. ');
  return (last > 200 ? cut.slice(0, last + 1) : cut).trim();
}
