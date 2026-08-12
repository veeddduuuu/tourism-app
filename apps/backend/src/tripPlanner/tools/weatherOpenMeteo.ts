/** Open-Meteo forecast + India-first geocoding (Nominatim → Open-Meteo). */

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const MAX_FORECAST_DAYS = 16;

const HTTP_HEADERS = {
  'User-Agent': 'aaroh-trip-planner/0.1 (India trip planner; local/dev)',
};

const INDIA_ALIASES: Record<string, { label: string; lat: number; lon: number; admin1: string }> = {
  manali: { label: 'Manali', lat: 32.2432, lon: 77.1892, admin1: 'Himachal Pradesh' },
  goa: { label: 'Goa', lat: 15.2993, lon: 74.124, admin1: 'Goa' },
  'north goa': { label: 'North Goa', lat: 15.5256, lon: 73.763, admin1: 'Goa' },
  'south goa': { label: 'South Goa', lat: 15.15, lon: 74.0, admin1: 'Goa' },
  leh: { label: 'Leh', lat: 34.1526, lon: 77.5771, admin1: 'Ladakh' },
  ladakh: { label: 'Ladakh', lat: 34.1526, lon: 77.5771, admin1: 'Ladakh' },
  rishikesh: { label: 'Rishikesh', lat: 30.0869, lon: 78.2676, admin1: 'Uttarakhand' },
  varanasi: { label: 'Varanasi', lat: 25.3176, lon: 82.9739, admin1: 'Uttar Pradesh' },
  andaman: { label: 'Port Blair', lat: 11.6234, lon: 92.7265, admin1: 'Andaman and Nicobar' },
  'port blair': { label: 'Port Blair', lat: 11.6234, lon: 92.7265, admin1: 'Andaman and Nicobar' },
};

const WMO: Record<number, string> = {
  0: 'clear sky',
  1: 'mainly clear',
  2: 'partly cloudy',
  3: 'overcast',
  45: 'fog',
  48: 'depositing rime fog',
  51: 'light drizzle',
  53: 'moderate drizzle',
  55: 'dense drizzle',
  61: 'slight rain',
  63: 'moderate rain',
  65: 'heavy rain',
  66: 'light freezing rain',
  67: 'heavy freezing rain',
  71: 'slight snow',
  73: 'moderate snow',
  75: 'heavy snow',
  77: 'snow grains',
  80: 'slight rain showers',
  81: 'moderate rain showers',
  82: 'violent rain showers',
  85: 'slight snow showers',
  86: 'heavy snow showers',
  95: 'thunderstorm',
  96: 'thunderstorm with slight hail',
  99: 'thunderstorm with heavy hail',
};

export interface GeoPlace {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1: string;
}

export interface DailyForecast {
  date: string;
  condition: string;
  high_c: number;
  low_c: number;
  precipitation_chance: number;
  weather_code: number;
}

export interface WeatherToolResult {
  ok: boolean;
  place: GeoPlace | null;
  daily: DailyForecast[];
  source: string;
  mode: string;
  notes: string[];
  raw_error: string | null;
  toPromptBlock(): string;
}

function makeWeatherResult(
  partial: Omit<WeatherToolResult, 'toPromptBlock' | 'daily' | 'notes' | 'source' | 'mode' | 'place'> &
    Partial<Pick<WeatherToolResult, 'daily' | 'notes' | 'source' | 'mode' | 'place'>>
): WeatherToolResult {
  const result: WeatherToolResult = {
    ok: partial.ok,
    place: partial.place ?? null,
    daily: partial.daily ?? [],
    source: partial.source ?? 'open-meteo',
    mode: partial.mode ?? 'forecast',
    notes: partial.notes ?? [],
    raw_error: partial.raw_error ?? null,
    toPromptBlock() {
      if (!this.ok || !this.place) {
        return (
          'LIVE WEATHER TOOL: unavailable. ' +
          `Reason: ${this.raw_error || 'unknown'}. ` +
          'Use seasonal climate norms and say estimates are not live.'
        );
      }
      const p = this.place;
      const lines = [
        'LIVE WEATHER TOOL (Open-Meteo):',
        `Resolved place: ${p.name}, ${p.admin1}, ${p.country} ` +
          `(${p.latitude.toFixed(4)},${p.longitude.toFixed(4)})`,
        `Mode: ${this.mode}`,
      ];
      for (const n of this.notes) lines.push(`Note: ${n}`);
      if (this.daily.length) {
        lines.push('Daily forecast:');
        for (const d of this.daily) {
          lines.push(
            `- ${d.date}: ${d.condition}, high ${d.high_c}C / low ${d.low_c}C, ` +
              `precip chance ${d.precipitation_chance.toFixed(0)}%`
          );
        }
      } else {
        lines.push('No daily rows — rely on seasonal norms for these dates.');
      }
      return lines.join('\n');
    },
  };
  return result;
}

function wmoCondition(code: number): string {
  return WMO[code] ?? `code ${code}`;
}

function parseIsoDate(s: string): Date {
  return new Date(s + 'T00:00:00Z');
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function geocode(
  destination: string,
  _countryHint = 'India'
): Promise<GeoPlace | null> {
  const query = destination.trim();
  if (!query) return null;

  const alias = INDIA_ALIASES[query.toLowerCase()];
  if (alias) {
    return {
      name: alias.label,
      latitude: alias.lat,
      longitude: alias.lon,
      country: 'India',
      admin1: alias.admin1,
    };
  }

  const nominatim = await geocodeNominatim(query);
  if (nominatim) return nominatim;

  return geocodeOpenMeteo(query);
}

async function geocodeNominatim(query: string): Promise<GeoPlace | null> {
  const params = new URLSearchParams({
    q: query.toLowerCase().includes('india') ? query : `${query}, India`,
    format: 'json',
    limit: '5',
    countrycodes: 'in',
    addressdetails: '1',
  });
  try {
    const resp = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: HTTP_HEADERS,
      signal: AbortSignal.timeout(20_000),
    });
    if (!resp.ok) return null;
    const results = (await resp.json()) as Array<Record<string, unknown>>;
    if (!results?.length) return null;
    const pick = results[0];
    const addr =
      pick.address && typeof pick.address === 'object'
        ? (pick.address as Record<string, unknown>)
        : {};
    const admin1 = String(addr.state ?? addr.region ?? addr.state_district ?? '');
    const name = String(
      addr.city ?? addr.town ?? addr.village ?? addr.county ?? pick.name ?? query
    );
    return {
      name,
      latitude: Number(pick.lat),
      longitude: Number(pick.lon),
      country: 'India',
      admin1,
    };
  } catch {
    return null;
  }
}

async function geocodeOpenMeteo(
  query: string,
  countryHint = 'India'
): Promise<GeoPlace | null> {
  const fetchResults = async (withCountry: boolean) => {
    const params = new URLSearchParams({
      name: query,
      count: '10',
      language: 'en',
      format: 'json',
    });
    if (withCountry) params.set('countryCode', 'IN');
    const resp = await fetch(`${GEOCODE_URL}?${params}`, {
      headers: HTTP_HEADERS,
      signal: AbortSignal.timeout(20_000),
    });
    if (!resp.ok) throw new Error(`geocode ${resp.status}`);
    const data = (await resp.json()) as { results?: Array<Record<string, unknown>> };
    return data.results ?? [];
  };

  try {
    let results = await fetchResults(true);
    if (!results.length) {
      results = await fetchResults(false);
      if (!results.length && !query.toLowerCase().includes('india')) {
        return geocodeOpenMeteo(`${query}, India`, countryHint);
      }
      if (!results.length) return null;
    }

    const hint = countryHint.toLowerCase();
    const india = results.filter(
      (r) =>
        String(r.country ?? '').toLowerCase() === hint ||
        String(r.country_code ?? '').toLowerCase() === 'in'
    );
    const pool = (india.length ? india : results).slice().sort((a, b) => {
      const tourist = new Set([
        'himachal pradesh',
        'goa',
        'kerala',
        'rajasthan',
        'uttarakhand',
        'ladakh',
        'jammu and kashmir',
      ]);
      const score = (r: Record<string, unknown>) => {
        const admin = String(r.admin1 ?? '').toLowerCase();
        const boost = tourist.has(admin) ? 1 : 0;
        return boost * 1e9 + Number(r.population ?? 0);
      };
      return score(b) - score(a);
    });
    const pick = pool[0];
    return {
      name: String(pick.name ?? query),
      latitude: Number(pick.latitude),
      longitude: Number(pick.longitude),
      country: String(pick.country ?? ''),
      admin1: String(pick.admin1 ?? ''),
    };
  } catch {
    return null;
  }
}

function clampForecastWindow(
  start: Date,
  end: Date
): { start: Date; end: Date; notes: string[]; canForecast: boolean } {
  const notes: string[] = [];
  const today = parseIsoDate(toIsoDate(new Date()));
  const latest = new Date(today.getTime() + MAX_FORECAST_DAYS * 86_400_000);

  if (end < today) {
    notes.push(
      `Requested dates ${toIsoDate(start)}→${toIsoDate(end)} are in the past; using seasonal fallback.`
    );
    return { start, end, notes, canForecast: false };
  }
  if (start > latest) {
    notes.push(
      `Requested start ${toIsoDate(start)} is beyond the ~${MAX_FORECAST_DAYS}-day forecast ` +
        'horizon; using seasonal fallback.'
    );
    return { start, end, notes, canForecast: false };
  }

  const clampedStart = start > today ? start : today;
  const clampedEnd = end < latest ? end : latest;
  if (
    toIsoDate(clampedStart) !== toIsoDate(start) ||
    toIsoDate(clampedEnd) !== toIsoDate(end)
  ) {
    notes.push(
      `Clamped live forecast to ${toIsoDate(clampedStart)}→${toIsoDate(clampedEnd)} ` +
        `(Open-Meteo horizon ~${MAX_FORECAST_DAYS} days).`
    );
  }
  return { start: clampedStart, end: clampedEnd, notes, canForecast: true };
}

export async function fetchDailyForecast(
  place: GeoPlace,
  startDate: string,
  endDate: string
): Promise<WeatherToolResult> {
  let start: Date;
  let end: Date;
  try {
    start = parseIsoDate(startDate);
    end = parseIsoDate(endDate);
  } catch (exc) {
    return makeWeatherResult({ ok: false, raw_error: `bad dates: ${exc}` });
  }
  if (end < start) {
    return makeWeatherResult({ ok: false, raw_error: 'end_date before start_date' });
  }

  const clamped = clampForecastWindow(start, end);
  if (!clamped.canForecast) {
    return makeWeatherResult({
      ok: true,
      place,
      daily: [],
      mode: 'seasonal_fallback',
      notes: clamped.notes,
      raw_error: null,
    });
  }

  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'auto',
    start_date: toIsoDate(clamped.start),
    end_date: toIsoDate(clamped.end),
  });

  const resp = await fetch(`${FORECAST_URL}?${params}`, {
    signal: AbortSignal.timeout(20_000),
  });
  if (!resp.ok) throw new Error(`forecast ${resp.status}`);
  const data = (await resp.json()) as {
    daily?: {
      time?: string[];
      weather_code?: Array<number | null>;
      temperature_2m_max?: Array<number | null>;
      temperature_2m_min?: Array<number | null>;
      precipitation_probability_max?: Array<number | null>;
    };
  };

  const dailyRaw = data.daily ?? {};
  const times = dailyRaw.time ?? [];
  const codes = dailyRaw.weather_code ?? [];
  const highs = dailyRaw.temperature_2m_max ?? [];
  const lows = dailyRaw.temperature_2m_min ?? [];
  const precips = dailyRaw.precipitation_probability_max ?? [];

  const days: DailyForecast[] = times.map((day, i) => {
    const code = codes[i] != null ? Number(codes[i]) : 0;
    return {
      date: String(day),
      condition: wmoCondition(code),
      high_c: highs[i] != null ? Number(highs[i]) : 0,
      low_c: lows[i] != null ? Number(lows[i]) : 0,
      precipitation_chance: precips[i] != null ? Number(precips[i]) : 0,
      weather_code: code,
    };
  });

  return makeWeatherResult({
    ok: true,
    place,
    daily: days,
    mode: days.length ? 'forecast' : 'seasonal_fallback',
    notes: clamped.notes,
    raw_error: null,
  });
}

/** Geocode + forecast for agent prompts. Never throws. */
export async function getWeatherContext(
  destination: string,
  startDate: string,
  endDate: string
): Promise<WeatherToolResult> {
  try {
    const place = await geocode(destination);
    if (!place) {
      return makeWeatherResult({
        ok: false,
        raw_error: `could not geocode '${destination}'`,
      });
    }
    return await fetchDailyForecast(place, startDate, endDate);
  } catch (exc) {
    return makeWeatherResult({
      ok: false,
      raw_error: exc instanceof Error ? exc.message : String(exc),
    });
  }
}
