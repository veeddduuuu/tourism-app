/** Wikidata QIDs we treat as tourist-worthy instance types (no P279* walk). */
export const PLACE_CLASS_QIDS = [
  'Q570116', // tourist attraction
  'Q4989906', // monument
  'Q839954', // archaeological site
  'Q842402', // Hindu temple
  'Q44542', // temple
  'Q32815', // mosque
  'Q16970', // church building
  'Q1641208', // gurdwara
  'Q5393308', // Buddhist temple
  'Q18087', // stupa
  'Q23413', // castle
  'Q1785071', // fort
  'Q16560', // palace
  'Q33506', // museum
  'Q207694', // art museum
  'Q204832', // waterfall
  'Q46169', // national park
  'Q473972', // wildlife sanctuary
  'Q23397', // lake
  'Q40080', // beach
  'Q35509', // cave
  'Q8502', // mountain
  'Q1690211', // hill station
  'Q1107656', // garden
  'Q167346', // botanical garden
  'Q5003624', // memorial
  'Q185141', // mausoleum
  'Q381885', // tomb
  'Q234223', // stepwell
  'Q1329623', // rock-cut architecture
  'Q35112127', // heritage site
  'Q811102', // cultural heritage
  'Q210272', // cultural property
  'Q2434238', // heritage railway (toy trains etc.)
  'Q200764', // dam (optional scenic)
  'Q12518', // tower
] as const;

const TEMPLE = new Set([
  'Q842402',
  'Q44542',
  'Q32815',
  'Q16970',
  'Q1641208',
  'Q5393308',
  'Q18087',
]);
const FORT = new Set(['Q23413', 'Q1785071']);
const MUSEUM = new Set(['Q33506', 'Q207694']);
const BEACH = new Set(['Q40080']);
const HILL = new Set(['Q8502', 'Q1690211']);
const NATURE = new Set([
  'Q204832',
  'Q46169',
  'Q473972',
  'Q23397',
  'Q35509',
  'Q1107656',
  'Q167346',
]);

export function categoryFromClassIds(classIds: string[]): string {
  if (classIds.some((id) => TEMPLE.has(id))) return 'temple';
  if (classIds.some((id) => FORT.has(id))) return 'fort';
  if (classIds.some((id) => MUSEUM.has(id))) return 'museum';
  if (classIds.some((id) => BEACH.has(id))) return 'beach';
  if (classIds.some((id) => HILL.has(id))) return 'hill';
  if (classIds.some((id) => NATURE.has(id))) return 'nature';
  if (classIds.length === 0) return 'other';
  return 'heritage';
}
