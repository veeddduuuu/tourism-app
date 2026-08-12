/** India-focused recent news for travel safety (NewsAPI.org). */

const NEWS_EVERYTHING_URL = 'https://newsapi.org/v2/everything';

const INDIA_DOMAINS = [
  'thehindu.com',
  'hindustantimes.com',
  'indianexpress.com',
  'timesofindia.indiatimes.com',
  'ndtv.com',
  'news18.com',
  'indiatoday.in',
  'theprint.in',
  'scroll.in',
].join(',');

const RISK_KEYWORDS = [
  'flood',
  'floods',
  'landslide',
  'landslides',
  'curfew',
  'protest',
  'protests',
  'strike',
  'bandh',
  'cyclone',
  'earthquake',
  'riot',
  'violence',
  'terror',
  'advisory',
  'evacuation',
  'heatwave',
  'heat wave',
  'cloudburst',
  'stampede',
];

const DESTINATION_CONTEXT: Record<string, string> = {
  manali: 'Himachal OR Kullu OR "Himachal Pradesh"',
  goa: 'Panaji OR Calangute OR Baga OR "North Goa" OR "South Goa"',
  leh: 'Ladakh OR Leh',
  ladakh: 'Leh OR Ladakh',
  rishikesh: 'Uttarakhand OR Ganga OR "Rishikesh"',
  varanasi: '"Uttar Pradesh" OR Banaras OR Kashi',
  shimla: 'Himachal OR "Shimla"',
  munnar: 'Kerala OR Munnar',
  andaman: '"Port Blair" OR Andaman',
  'port blair': 'Andaman OR "Port Blair"',
};

const IRRELEVANT = [
  'refinery',
  'bpd',
  'crude',
  'stock',
  'sensex',
  'ipl',
  'cricket',
  'wicket',
  'football',
  'share price',
];

export interface NewsHeadline {
  title: string;
  source: string;
  url: string;
  published_at: string;
  description: string;
}

export interface SafetyNewsResult {
  ok: boolean;
  configured: boolean;
  headlines: NewsHeadline[];
  query: string;
  source: string;
  notes: string[];
  raw_error: string | null;
  toPromptBlock(): string;
}

function makeResult(
  partial: {
    ok: boolean;
    configured: boolean;
    headlines?: NewsHeadline[];
    query?: string;
    source?: string;
    notes?: string[];
    raw_error?: string | null;
  }
): SafetyNewsResult {
  return {
    ok: partial.ok,
    configured: partial.configured,
    headlines: partial.headlines ?? [],
    query: partial.query ?? '',
    source: partial.source ?? 'newsapi',
    notes: partial.notes ?? [],
    raw_error: partial.raw_error ?? null,
    toPromptBlock() {
      if (!this.configured) {
        return (
          'LIVE SAFETY NEWS TOOL: NEWS_API_KEY not configured. ' +
          'Give a cautious India-travel safety read from general knowledge, ' +
          'mark risk_level as unknown if unsure, and say news was not live-checked.'
        );
      }
      if (!this.ok) {
        return (
          'LIVE SAFETY NEWS TOOL: unavailable. ' +
          `Reason: ${this.raw_error || 'unknown'}. ` +
          'Mark risk_level unknown unless you have clear seasonal hazards.'
        );
      }
      const lines = [
        'LIVE SAFETY NEWS TOOL (NewsAPI, India-focused):',
        `Query: ${this.query}`,
        `Headlines found: ${this.headlines.length}`,
      ];
      for (const n of this.notes) lines.push(`Note: ${n}`);
      if (!this.headlines.length) {
        lines.push(
          'No matching risk headlines in the lookback window — ' +
            'treat as no recent red flags from this feed (not a guarantee of safety).'
        );
      } else {
        lines.push('Recent headlines:');
        for (const h of this.headlines.slice(0, 12)) {
          const desc = h.description ? ` — ${h.description.slice(0, 160)}` : '';
          lines.push(
            `- [${h.published_at.slice(0, 10) || '?'}] ${h.source}: ${h.title}${desc}`
          );
          if (h.url) lines.push(`  url: ${h.url}`);
        }
      }
      return lines.join('\n');
    },
  };
}

function buildQuery(destination: string): string {
  const place = destination.trim();
  const risks = RISK_KEYWORDS.slice(0, 12).join(' OR ');
  const ctx = DESTINATION_CONTEXT[place.toLowerCase()];
  let placeClause = `("${place}" OR ${place})`;
  if (ctx) placeClause = `(${placeClause} AND (${ctx}))`;
  return `${placeClause} AND (India OR Indian) AND (${risks})`;
}

function isRelevantHeadline(title: string, description = ''): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return !IRRELEVANT.some((bad) => text.includes(bad));
}

function parseArticles(payload: Record<string, unknown>): NewsHeadline[] {
  const out: NewsHeadline[] = [];
  const articles = (payload.articles as Array<Record<string, unknown>>) ?? [];
  for (const item of articles) {
    const title = String(item.title ?? '').trim();
    if (!title || title.toLowerCase() === '[removed]') continue;
    const description = String(item.description ?? '');
    if (!isRelevantHeadline(title, description)) continue;
    let source = '';
    const src = item.source;
    if (src && typeof src === 'object') {
      source = String((src as { name?: string }).name ?? '');
    } else if (src) {
      source = String(src);
    }
    out.push({
      title,
      source,
      url: String(item.url ?? ''),
      published_at: String(item.publishedAt ?? ''),
      description,
    });
  }
  return out;
}

/** Fetch recent India-relevant risk headlines. Never throws. */
export async function fetchIndiaSafetyNews(
  destination: string,
  lookbackDays = 14
): Promise<SafetyNewsResult> {
  const apiKey = (process.env.NEWS_API_KEY ?? '').trim();
  if (!apiKey) {
    return makeResult({
      ok: false,
      configured: false,
      raw_error: 'NEWS_API_KEY missing',
      notes: ['Add NEWS_API_KEY from https://newsapi.org/register'],
    });
  }

  let query = buildQuery(destination);
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - lookbackDays);
  const from = since.toISOString().slice(0, 10);
  const headers = { 'X-Api-Key': apiKey };

  try {
    const params = new URLSearchParams({
      q: query,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '15',
      from,
      domains: INDIA_DOMAINS,
    });

    let resp = await fetch(`${NEWS_EVERYTHING_URL}?${params}`, {
      headers,
      signal: AbortSignal.timeout(20_000),
    });

    let usedDomains = true;
    if (resp.status === 400) {
      params.delete('domains');
      usedDomains = false;
      resp = await fetch(`${NEWS_EVERYTHING_URL}?${params}`, {
        headers,
        signal: AbortSignal.timeout(20_000),
      });
    }

    if (resp.status === 401) {
      return makeResult({
        ok: false,
        configured: true,
        query,
        raw_error: 'NewsAPI unauthorized — check NEWS_API_KEY',
      });
    }
    if (!resp.ok) throw new Error(`NewsAPI ${resp.status}`);

    const data = (await resp.json()) as Record<string, unknown>;
    if (data.status === 'error') {
      return makeResult({
        ok: false,
        configured: true,
        query,
        raw_error: String(data.message ?? JSON.stringify(data)),
      });
    }

    let headlines = parseArticles(data);
    const notes: string[] = [];
    if (!usedDomains) {
      notes.push('Domain filter unavailable; results may include non-India outlets.');
    }

    if (!headlines.length) {
      const ctx = DESTINATION_CONTEXT[destination.trim().toLowerCase()] ?? '';
      let broadQ = `${destination} India`;
      if (ctx) broadQ = `${destination} India (${ctx})`;
      const broadParams = new URLSearchParams({
        q: broadQ,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '10',
        from,
      });
      const broadResp = await fetch(`${NEWS_EVERYTHING_URL}?${broadParams}`, {
        headers,
        signal: AbortSignal.timeout(20_000),
      });
      if (!broadResp.ok) throw new Error(`NewsAPI ${broadResp.status}`);
      const broad = (await broadResp.json()) as Record<string, unknown>;
      headlines = parseArticles(broad);
      notes.push('No risk-keyword hits; fell back to broader destination headlines.');
      query = broadQ;
    }

    return makeResult({
      ok: true,
      configured: true,
      headlines: headlines.slice(0, 12),
      query,
      notes,
    });
  } catch (exc) {
    return makeResult({
      ok: false,
      configured: true,
      query,
      raw_error: exc instanceof Error ? exc.message : String(exc),
    });
  }
}
