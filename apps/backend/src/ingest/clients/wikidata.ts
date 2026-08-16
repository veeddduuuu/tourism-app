import { PLACE_CLASS_QIDS } from '../category';
import { fetchJson, sleep } from '../http';
import type { WikidataPlace } from '../types';

const SPARQL_URL = 'https://query.wikidata.org/sparql';

interface SparqlBinding {
  place?: { value: string };
  placeLabel?: { value: string };
  lat?: { value: string };
  lon?: { value: string };
  article?: { value: string };
  classes?: { value: string };
  image?: { value: string };
}

interface SparqlResponse {
  results?: { bindings?: SparqlBinding[] };
}

function qidFromUri(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] ?? uri;
}

function commonsThumb(fileUrl: string): string {
  if (fileUrl.includes('Special:FilePath')) {
    return fileUrl.includes('?') ? `${fileUrl}&width=1200` : `${fileUrl}?width=1200`;
  }
  return fileUrl;
}

function aroundQuery(lat: number, lng: number, radiusKm: number, limit: number): string {
  const values = PLACE_CLASS_QIDS.map((id) => `wd:${id}`).join(' ');
  return `
SELECT ?place ?placeLabel ?lat ?lon ?article (GROUP_CONCAT(DISTINCT ?classId; separator=",") AS ?classes) ?image WHERE {
  SERVICE wikibase:around {
    ?place wdt:P625 ?location .
    bd:serviceParam wikibase:center "Point(${lng} ${lat})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "${radiusKm}" .
  }
  ?place wdt:P31 ?class .
  VALUES ?class { ${values} }
  BIND(STRAFTER(STR(?class), "entity/") AS ?classId)
  ?place wdt:P625 ?coords .
  BIND(geof:latitude(?coords) AS ?lat)
  BIND(geof:longitude(?coords) AS ?lon)
  ?article schema:about ?place ;
           schema:isPartOf <https://en.wikipedia.org/> .
  OPTIONAL { ?place wdt:P18 ?image }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
}
GROUP BY ?place ?placeLabel ?lat ?lon ?article ?image
LIMIT ${limit}
`.trim();
}

function parseBindings(bindings: SparqlBinding[]): WikidataPlace[] {
  const out: WikidataPlace[] = [];
  for (const b of bindings) {
    const uri = b.place?.value;
    const name = b.placeLabel?.value;
    const lat = Number(b.lat?.value);
    const lon = Number(b.lon?.value);
    if (!uri || !name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (name.startsWith('Q') && /^Q\d+$/.test(name)) continue;
    out.push({
      qid: qidFromUri(uri),
      name,
      lat,
      lng: lon,
      wikipediaUrl: b.article?.value,
      imageUrl: b.image?.value ? commonsThumb(b.image.value) : undefined,
      classIds: (b.classes?.value ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }
  return out;
}

export async function discoverPlacesAround(
  lat: number,
  lng: number,
  radiusKm: number,
  fetchLimit: number
): Promise<WikidataPlace[]> {
  const query = aroundQuery(lat, lng, radiusKm, fetchLimit);
  const url = `${SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`;
  const json = await fetchJson<SparqlResponse>(url, {
    accept: 'application/sparql-results+json',
    timeoutMs: 90_000,
    retries: 4,
  });
  await sleep(800);
  return parseBindings(json.results?.bindings ?? []);
}
