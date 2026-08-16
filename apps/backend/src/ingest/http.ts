export const DEFAULT_USER_AGENT =
  process.env.INGEST_USER_AGENT ||
  'AarohCatalogIngest/1.0 (https://www.mediawiki.org/wiki/API:Etiquette; travel-catalog-ingest)';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryAfterMs(res: Response, attempt: number): number {
  const raw = res.headers.get('retry-after');
  if (raw) {
    const seconds = Number(raw);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(300_000, Math.max(5_000, seconds * 1000));
    }
    const when = Date.parse(raw);
    if (!Number.isNaN(when)) {
      return Math.min(300_000, Math.max(5_000, when - Date.now()));
    }
  }
  // Wikimedia 429s often need a long cool-down; 1s retries make it worse.
  const base = res.status === 429 ? 60_000 : 2_000;
  return Math.min(300_000, base * 2 ** attempt);
}

export async function fetchJson<T>(
  url: string,
  opts: {
    accept?: string;
    timeoutMs?: number;
    retries?: number;
    extraHeaders?: Record<string, string>;
  } = {}
): Promise<T> {
  const retries = opts.retries ?? 3;
  const timeoutMs = opts.timeoutMs ?? 60_000;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          'Api-User-Agent': DEFAULT_USER_AGENT,
          Accept: opts.accept ?? 'application/json',
          ...(opts.extraHeaders ?? {}),
        },
      });

      if (res.status === 429 || res.status >= 500) {
        const backoff = retryAfterMs(res, attempt);
        lastErr = new Error(`HTTP ${res.status} ${res.statusText}`);
        const host = (() => {
          try {
            return new URL(url).host;
          } catch {
            return url;
          }
        })();
        console.warn(`[ingest] HTTP ${res.status} from ${host} — waiting ${Math.round(backoff / 1000)}s (attempt ${attempt + 1}/${retries + 1})`);
        await sleep(backoff);
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      const backoff = Math.min(30_000, 1500 * 2 ** attempt);
      console.warn(`[ingest] fetch failed (${attempt + 1}/${retries + 1}): ${String(err)}`);
      if (attempt < retries) await sleep(backoff);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}
