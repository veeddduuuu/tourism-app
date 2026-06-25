# AAROH — Implementation Plan (Phases 1–3)
> Cultural Tourism App for India | 2-Developer Team | 4 Weeks

---

## Stack Changes: Original → Free Replacement

| Original | Replacement | Reason |
|---|---|---|
| Claude API (paid per token) | **Groq API** (free tier) | 14,400 req/day free; Llama 3.3 70B is fast + capable |
| Railway.app ($5/mo after credit) | **Render.com** free tier | 750 hrs/month free web services |
| Railway PostgreSQL | **NeonDB** (free) | Serverless PostgreSQL (free tier) |
| Redis (Railway) | **Upstash Redis** (free) | 10,000 commands/day free, HTTP-based |
| Mapbox (50K loads/mo limit) | **react-native-maps + OSM tiles** | Google Maps free quota generous; OSM tiles 100% free |
| Foursquare (hotel/restaurant) | **Overpass API + OpenTripMap** | Both 100% free, no billing required |
| RunwayML (video gen) | Deferred to Phase 4 | Not in scope for Phase 1–3 |
| Spoonacular (150 req/day) | **TheMealDB + Open Food Facts** | Both 100% free, no key |

### Groq API Setup (replaces Claude)
```
Free tier: 6,000 tokens/min, 500K tokens/day on llama-3.3-70b-versatile
Sign up: console.groq.com → API Keys → Create Key
Model to use: llama-3.3-70b-versatile (instruction-following, great for trip planning)
Fallback: gemma2-9b-it (faster, lower token cost for simple tasks)
```

---

## Project Structure

```
aaroh/
├── apps/
│   ├── mobile/          ← React Native + Expo (Dev 1)
│   └── backend/         ← Node.js + Express + REST (Dev 2)
├── packages/
│   └── shared/          ← TypeScript types shared between both
├── docs/
│   └── api-contracts/   ← Agreed request/response shapes
└── infrastructure/
    └── docker-compose.yml
```

> **Note on GraphQL vs REST:** REST is used here instead of Apollo/GraphQL — it's faster to build, easier to debug, and sufficient for all Phase 1–3 features. GraphQL can be layered on later if needed.

---

## 4-Week Timeline Overview

| Week | Backend (Dev 2) | Frontend (Dev 1) |
|---|---|---|
| **Week 1** | Server scaffold, NeonDB schema, auth, CI/CD | Expo scaffold, API client, design system, auth screens |
| **Week 2** | Places/food/festivals/history routes, seeding, search | Map + list views, history timeline, food recipes, festival calendar |
| **Week 3** | Groq trip planner, translation service, weather | Trip planner UI, itinerary display, translation UI |
| **Week 4** | Hotels/restaurants API, smart rerouting, voice endpoint | Weather UI, hotels/restaurants UI, voice flow, polish |

---

## Milestones

| # | Deliverable | Day | Owner |
|---|---|---|---|
| M1 | Monorepo boots, emulators running, server health-check live | Day 2 | Both |
| M2 | NeonDB schema live, 5 states seeded, JWT auth working | Day 5 | Dev 2 |
| M3 | Expo app navigates between tabs, design system 20+ components | Day 5 | Dev 1 |
| M4 | CI/CD auto-deploys to Render on push | Day 7 | Dev 2 |
| M5 | 500+ places seeded, map + list view working | Day 10 | Both |
| M6 | Food recipes, history timeline, festival calendar all rendered | Day 14 | Both |
| M7 | Global search <500ms across places, food, festivals | Day 14 | Dev 2 |
| M8 | Groq trip planner returns valid itinerary JSON | Day 16 | Dev 2 |
| M9 | Trip Planner UI + itinerary display complete | Day 19 | Dev 1 |
| M10 | Translation live — 12 Indian languages + voice pipeline | Day 21 | Both |
| M11 | Weather 7-day forecast with cloud alerts | Day 24 | Both |
| M12 | Hotels/restaurants + smart weather rerouting working | Day 28 | Both |

---

# Week 1 — Foundation & Architecture

## BACKEND TRACK (Dev 2)

### Days 1–2 — Server Scaffold

**Initialize the backend:**
```bash
cd apps/backend
npm init -y
npm install express cors helmet dotenv morgan zod drizzle-orm @neondatabase/serverless @clerk/clerk-sdk-node @clerk/clerk-expo
npm install -D typescript @types/express @types/node ts-node-dev
npx tsc --init
```

**Folder structure:**
```
apps/backend/src/
├── routes/
│   ├── auth.ts
│   ├── places.ts
│   ├── states.ts
│   ├── food.ts
│   ├── festivals.ts
│   ├── weather.ts
│   └── ai.ts
├── middleware/
│   ├── auth.ts          ← JWT verification via Clerk
│   ├── rateLimit.ts
│   └── errorHandler.ts
├── services/
│   ├── groq.ts          ← Groq API wrapper
│   ├── weather.ts       ← Open-Meteo wrapper
│   └── translation.ts   ← Bhashini wrapper
├── db/
│   └── db.ts      ← Drizzle ORM & Neon client init
└── index.ts
```

**Health check:**
```typescript
// src/index.ts
app.get('/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});
```

Deploy to Render.com: connect GitHub repo → New Web Service → build: `npm run build`, start: `npm start` → add env vars in dashboard.

---

### Days 3–4 — NeonDB & Drizzle Schema

Sign up at neon.tech → New Project → copy `DATABASE_URL` and `CLERK_SECRET_KEY`.

**Run using Drizzle migrations or Neon SQL editor:**
```sql
CREATE TABLE states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, capital TEXT, region TEXT, language TEXT,
  description TEXT, image_url TEXT, best_season TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id),
  name TEXT NOT NULL, lat DECIMAL(9,6), lng DECIMAL(9,6), description TEXT
);

CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  name TEXT NOT NULL,
  category TEXT,        -- 'heritage' | 'temple' | 'nature' | 'beach' | 'hill'
  lat DECIMAL(9,6), lng DECIMAL(9,6),
  rating DECIMAL(2,1), entry_fee INTEGER,
  timings TEXT, history_brief TEXT,
  images JSONB, wikipedia_url TEXT
);

CREATE TABLE history_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id),
  era TEXT,             -- 'ancient' | 'medieval' | 'british' | 'modern'
  year INTEGER, event_title TEXT NOT NULL, description TEXT, media_url TEXT
);

CREATE TABLE traditional_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id),
  name TEXT NOT NULL,
  category TEXT,        -- 'veg' | 'non-veg' | 'vegan' | 'sweet'
  prep_time INTEGER, difficulty TEXT, description TEXT, image_url TEXT
);

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES traditional_foods(id),
  ingredients JSONB,    -- [{ name, qty, unit }]
  steps JSONB,          -- [{ step_no, instruction }]
  nutritional_info JSONB, video_url TEXT
);

CREATE TABLE festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id UUID REFERENCES states(id),
  name TEXT NOT NULL, month INTEGER, duration_days INTEGER,
  description TEXT, traditions TEXT, is_national BOOLEAN DEFAULT false
);

CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id),
  name TEXT NOT NULL, stars INTEGER, price_per_night INTEGER,
  amenities JSONB, lat DECIMAL(9,6), lng DECIMAL(9,6),
  booking_url TEXT, rating DECIMAL(2,1),
  source TEXT           -- 'osm' | 'opentripmap' | 'manual'
);

CREATE TABLE ai_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  budget INTEGER, duration INTEGER,
  preferences JSONB, generated_itinerary JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Full-text search indexes
CREATE INDEX places_fts ON places USING gin(to_tsvector('english', name || ' ' || COALESCE(history_brief, '')));
CREATE INDEX foods_fts ON traditional_foods USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Nearby places function
CREATE OR REPLACE FUNCTION places_within_radius(user_lat FLOAT, user_lng FLOAT, radius_km FLOAT)
RETURNS TABLE (id UUID, name TEXT, lat FLOAT, lng FLOAT, distance_km FLOAT) AS $$
  SELECT id, name, lat::FLOAT, lng::FLOAT,
    (6371 * acos(cos(radians(user_lat)) * cos(radians(lat)) *
     cos(radians(lng) - radians(user_lng)) +
     sin(radians(user_lat)) * sin(radians(lat)))) AS distance_km
  FROM places
  WHERE (6371 * acos(cos(radians(user_lat)) * cos(radians(lat)) *
    cos(radians(lng) - radians(user_lng)) +
    sin(radians(user_lat)) * sin(radians(lat)))) < radius_km
  ORDER BY distance_km;
$$ LANGUAGE SQL;
```

**Neon + Drizzle client:**
```typescript
// src/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);
```

---

### Day 5 — Auth + Rate Limiting

Clerk Auth handles JWTs — no need to write token management from scratch.

```typescript
// src/middleware/auth.ts
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

// Clerk handles JWT validation and populates req.auth
export const requireAuth = ClerkExpressRequireAuth();
```

```bash
npm install express-rate-limit
```
```typescript
export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
export const aiLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }); // 10 AI calls/hr per IP
```

---

### Days 6–7 — CI/CD

**.github/workflows/ci.yml:**
```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd apps/backend && npm ci
      - run: cd apps/backend && npx tsc --noEmit
      - run: cd apps/backend && npm test
  mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd apps/mobile && npm ci
      - run: cd apps/mobile && npx tsc --noEmit
```

Connect Render.com to GitHub → enable auto-deploy on push to `main`.

---

## FRONTEND TRACK (Dev 1)

### Days 1–2 — Expo Scaffold

```bash
cd apps
npx create-expo-app mobile --template expo-template-blank-typescript
cd mobile
npx expo install expo-router nativewind react-native-reanimated react-native-gesture-handler
npm install @tanstack/react-query zustand drizzle-orm @neondatabase/serverless @clerk/clerk-sdk-node @clerk/clerk-expo axios
npx expo install react-native-maps expo-location expo-notifications
```

**Folder structure:**
```
apps/mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx          ← Home
│   │   ├── explore.tsx        ← Places + Map
│   │   ├── discover.tsx       ← Food & Festivals
│   │   └── profile.tsx
│   ├── place/[id].tsx
│   ├── food/[id].tsx
│   ├── history/index.tsx
│   ├── translate/index.tsx
│   └── trip/
│       ├── planner.tsx
│       └── itinerary.tsx
├── components/
│   ├── ui/                    ← Design system atoms
│   ├── cards/
│   └── maps/
├── hooks/
│   ├── useAuth.ts
│   ├── usePlaces.ts
│   └── useTrip.ts
├── stores/
│   └── appStore.ts            ← Zustand global state
├── lib/
│   ├── api.ts                 ← Axios instance
│   └── db.ts
└── locales/
    ├── en/translation.json
    └── hi/translation.json
```

---

### Days 3–4 — API Client + React Query

```typescript
// lib/api.ts
import axios from 'axios';
import { useAuth } from '@clerk/clerk-expo';

const api = axios.create({ baseURL: process.env.EXPO_PUBLIC_API_URL });

// Inside a React component or custom hook:
// const { getToken } = useAuth();
// const token = await getToken();
// config.headers.Authorization = `Bearer ${token}`;

export default api;
```

```typescript
// app/_layout.tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } },
});
```

---

### Days 5–7 — Design System + Auth Screens

**20+ base components in `components/ui/`:**

| Component | Notes |
|---|---|
| `Button` | variants: primary, secondary, outline, ghost |
| `Card` | image, title, subtitle, badge slot |
| `PlaceCard` | category color strip, rating badge |
| `FoodCard` | veg/non-veg indicator, difficulty badge |
| `Badge` | color-coded by category |
| `SearchBar` | debounced, clear button |
| `FilterChip` | multi-select row |
| `SkeletonLoader` | placeholder while loading |
| `MapMarker` | custom SVG by category |
| `BottomSheet` | snap points for detail views |
| `ProgressBar` | for budget breakdown |
| `EmptyState` | illustration + CTA |
| `ErrorBoundary` | catch + retry |

**Color tokens:**
```javascript
// tailwind.config.js
colors: {
  saffron: '#FF6B00',   // primary
  heritage: '#8B1A1A',  // heritage sites
  nature: '#2E7D32',    // nature places
  ocean: '#0277BD',     // beaches
  sand: '#F5F0E8',      // background
  ink: '#1A1A1A',       // primary text
}
```

**Auth screen:**
```typescript
// app/(auth)/login.tsx
import { useSignIn, useOAuth } from '@clerk/clerk-expo';

export default function LoginScreen() {
  const { signIn, setActive } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  // Use Clerk hooks to handle sign-in and OAuth
}
```

---

# Week 2 — Core Content Modules

## BACKEND TRACK (Dev 2)

### Days 8–10 — Places Seeding + Routes

**Free data pipeline — Wikidata SPARQL:**
```typescript
// scripts/seed-places.ts
const WIKIDATA_QUERY = `
SELECT ?place ?placeLabel ?lat ?lon ?image WHERE {
  ?place wdt:P17 wd:Q668;
         wdt:P31/wdt:P279* wd:Q839954;
         wdt:P625 ?coords.
  OPTIONAL { ?place wdt:P18 ?image }
  BIND(geof:latitude(?coords) AS ?lat)
  BIND(geof:longitude(?coords) AS ?lon)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
} LIMIT 500`;

const resp = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(WIKIDATA_QUERY)}&format=json`);
const { results } = await resp.json();

for (const r of results.bindings) {
  // Fetch Wikipedia extract for each place
  const wiki = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(r.placeLabel.value)}`).then(r => r.json());
  await db.insert(places).values({
    name: r.placeLabel.value, lat: r.lat.value, lng: r.lon.value,
    history_brief: wiki.extract, wikipedia_url: wiki.content_urls?.desktop?.page,
    images: r.image ? [r.image.value] : []
  });
}
```

**Places routes:**
```typescript
// GET /api/places?state=rajasthan&category=heritage&page=1&limit=20
router.get('/places', async (req, res) => {
  const { state, category, page = 1, limit = 20, search } = req.query;
  let query = db.select().from(places)
    .select('*, cities!inner(*, states!inner(*))')
    .range((+page - 1) * +limit, +page * +limit - 1);

  if (state) query = query.eq('cities.states.name', state);
  if (category) query = query.eq('category', category);
  if (search) query = query.textSearch('name', search as string);

  const { data, error } = await query;
  res.json({ data, page: +page, limit: +limit });
});

// GET /api/places/nearby?lat=28.6&lng=77.2&radius=10
router.get('/places/nearby', async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;
  // Using raw SQL query via Drizzle
  const { data } = await db.execute(sql`SELECT * FROM places_within_radius(
    user_lat: +lat, user_lng: +lng, radius_km: +radius
  });
  res.json({ data });
});
```

---

### Days 11–12 — Food + Festivals + History Routes

**TheMealDB seeding (100% free, no key):**
```typescript
const resp = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian');
const { meals } = await resp.json();

for (const meal of meals) {
  const detail = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`).then(r => r.json());
  const m = detail.meals[0];
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (m[`strIngredient${i}`]) ingredients.push({ name: m[`strIngredient${i}`], qty: m[`strMeasure${i}`] });
  }
  await db.insert(traditional_foods).values({
    name: m.strMeal, image_url: m.strMealThumb,
    category: m.strTags?.includes('Vegetarian') ? 'veg' : 'non-veg'
  });
}
```

Routes to implement:
```typescript
// GET /api/foods?state=kerala&category=veg&page=1
// GET /api/foods/:id          ← full recipe with ingredients + steps
// GET /api/festivals?month=10&state=west-bengal
// GET /api/history?era=ancient&place_id=xxx
```

---

### Days 13–14 — Global Search

```typescript
// GET /api/search?q=Taj Mahal&types=places,foods,festivals
router.get('/search', async (req, res) => {
  const { q, types = 'places,foods,festivals' } = req.query;
  const typeList = (types as string).split(',');
  const results: Record<string, unknown[]> = {};

  if (typeList.includes('places')) {
    const { data } = await db.select().from('places')
      .select('id, name, category, images')
      .textSearch('name', q as string).limit(5);
    results.places = data ?? [];
  }
  if (typeList.includes('foods')) {
    const { data } = await db.select().from('traditional_foods')
      .select('id, name, category, image_url')
      .textSearch('name', q as string).limit(5);
    results.foods = data ?? [];
  }
  if (typeList.includes('festivals')) {
    const { data } = await db.select().from('festivals')
      .select('id, name, month').ilike('name', `%${q}%`).limit(5);
    results.festivals = data ?? [];
  }

  res.json({ results, query: q });
});
```

---

## FRONTEND TRACK (Dev 1)

### Days 8–10 — Places Explorer + Map

```typescript
// hooks/usePlaces.ts
export function usePlaces(filters: PlaceFilters) {
  return useQuery({
    queryKey: ['places', filters],
    queryFn: () => api.get('/places', { params: filters }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
```

```typescript
// app/(tabs)/explore.tsx
const CATEGORY_COLORS = {
  heritage: '#8B1A1A', temple: '#FF6B00',
  nature: '#2E7D32',   beach: '#0277BD', hill: '#558B2F',
};

export default function ExploreScreen() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { data: places } = usePlaces(filters);

  return (
    <View>
      <ViewToggle value={viewMode} onChange={setViewMode} />
      {viewMode === 'map' ? (
        <MapView initialRegion={INDIA_REGION}>
          {places?.map(place => (
            <Marker key={place.id} coordinate={{ latitude: place.lat, longitude: place.lng }}
              pinColor={CATEGORY_COLORS[place.category]}>
              <Callout onPress={() => router.push(`/place/${place.id}`)}>
                <PlaceCallout place={place} />
              </Callout>
            </Marker>
          ))}
        </MapView>
      ) : (
        <FlashList data={places} renderItem={({ item }) => <PlaceCard place={item} />}
          estimatedItemSize={160} onEndReached={fetchNextPage} />
      )}
    </View>
  );
}
```

---

### Days 11–12 — History Timeline + Food Recipes

**History timeline:**
```typescript
// app/history/index.tsx
const ERA_COLORS = {
  ancient: '#8B6914', medieval: '#4A148C',
  british: '#B71C1C', modern: '#1565C0',
};

export default function HistoryScreen() {
  const [activeEra, setActiveEra] = useState<Era>('ancient');
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['ancient', 'medieval', 'british', 'modern'] as Era[]).map(era => (
          <FilterChip key={era} label={era} active={activeEra === era}
            color={ERA_COLORS[era]} onPress={() => setActiveEra(era)} />
        ))}
      </ScrollView>
      <FlashList data={historyEntries} estimatedItemSize={140}
        renderItem={({ item }) => (
          <TimelineCard year={item.year} title={item.event_title}
            description={item.description} accentColor={ERA_COLORS[item.era]} />
        )} />
    </View>
  );
}
```

**Recipe detail screen:**
```typescript
// app/food/[id].tsx
export default function RecipeScreen({ params: { id } }) {
  const { data: food } = useFood(id);
  const [servings, setServings] = useState(4);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');

  const scaledIngredients = food?.recipe?.ingredients.map(ing => ({
    ...ing, qty: scale(ing.qty, servings / 4),
  }));

  return (
    <ScrollView>
      <FoodHero image={food?.image_url} name={food?.name} />
      <ServingsPicker value={servings} onChange={setServings} />
      <TabBar tabs={['ingredients', 'steps']} active={activeTab} onChange={setActiveTab} />
      {activeTab === 'ingredients'
        ? <IngredientsList items={scaledIngredients} />
        : <StepsList steps={food?.recipe?.steps} />}
    </ScrollView>
  );
}
```

---

### Days 13–14 — Festival Calendar + Push Notifications

```typescript
// app/festivals/index.tsx
import * as Notifications from 'expo-notifications';

async function scheduleFestivalReminder(festival: Festival) {
  const festivalDate = new Date(new Date().getFullYear(), festival.month - 1, 1);
  const reminderDate = new Date(festivalDate);
  reminderDate.setDate(reminderDate.getDate() - 7);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎉 ${festival.name} in 7 days!`,
      body: festival.description.slice(0, 100),
      data: { festivalId: festival.id },
    },
    trigger: { date: reminderDate },
  });
}
```

---

# Week 3 — AI & Translation

## BACKEND TRACK (Dev 2)

### Days 15–16 — Groq Trip Planner

```bash
npm install groq-sdk @upstash/redis
```

```typescript
// src/services/groq.ts
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TRIP_SYSTEM_PROMPT = `You are an expert India travel guide with 20+ years of experience.
When given a travel request, respond ONLY with a JSON object in this exact format:
{
  "title": "string",
  "total_cost_inr": number,
  "budget_breakdown": { "accommodation_pct": 40, "transport_pct": 25, "food_pct": 20, "activities_pct": 15 },
  "days": [{
    "day": 1, "title": "string", "city": "string",
    "activities": ["string"],
    "estimated_cost_inr": number,
    "hotel": { "name": "string", "type": "string", "price_per_night": number },
    "transport": { "from": "string", "to": "string", "mode": "string", "cost": number }
  }],
  "cultural_notes": ["string"],
  "best_time_to_visit": "string",
  "weather_warning": "string or null"
}
All prices in INR. No preamble, no markdown — only valid JSON.`;

export async function generateTripPlan(params: TripParams): Promise<TripItinerary> {
  const userPrompt = `Plan a ${params.duration}-day trip to ${params.destination}.
Budget: Rs ${params.budget.toLocaleString('en-IN')} total.
Travel style: ${params.travelStyle}. Group: ${params.groupType}.
Starting from: ${params.startCity}. Month: ${params.month}.
Interests: ${params.interests.join(', ')}.`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: TRIP_SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 4096,
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content!) as TripItinerary;
}
```

**Trip route with caching:**
```typescript
// src/routes/ai.ts
import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.UPSTASH_URL!, token: process.env.UPSTASH_TOKEN! });

router.post('/trip/plan', requireAuth, aiLimiter, async (req, res) => {
  const params = TripSchema.parse(req.body);
  const cacheKey = `trip:${JSON.stringify(params)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ data: cached, cached: true });

  const itinerary = await generateTripPlan(params);
  await redis.set(cacheKey, JSON.stringify(itinerary), { ex: 86400 }); // 24hr cache

  await db.insert(ai_trips).values({
    user_id: req.user.id, budget: params.budget,
    duration: params.duration, preferences: params,
    generated_itinerary: itinerary,
  });

  res.json({ data: itinerary });
});
```

> **Groq free tier note:** `llama-3.3-70b-versatile` gives ~250 full itineraries/day on the free tier. For quick budget estimates, drop to `gemma2-9b-it` (30K tokens/min) — near-instant responses.

---

### Days 17–19 — Translation Service

**Bhashini API (free for Indian developers — recommended for production):**
```typescript
// src/services/translation.ts
const BHASHINI_BASE = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  const payload = {
    pipelineTasks: [{
      taskType: 'translation',
      config: {
        modelId: '641803b6b64f3602cef30af2',
        language: { sourceLanguage: sourceLang, targetLanguage: targetLang }
      }
    }],
    inputData: { input: [{ source: text }] }
  };

  const resp = await fetch(BHASHINI_BASE, {
    method: 'POST',
    headers: { 'Authorization': process.env.BHASHINI_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await resp.json();
  return data.pipelineResponse[0].output[0].target;
}
```

**Local dev fallback — LibreTranslate via Docker:**
```bash
docker run -p 5000:5000 libretranslate/libretranslate --load-only en,hi,bn,te,mr,ta,gu,kn,ml,pa,ur,or
```

**Translation route with Redis cache:**
```typescript
// POST /api/translate
router.post('/translate', async (req, res) => {
  const { text, source, target } = req.body;
  const cacheKey = `tr:${source}:${target}:${text.slice(0, 50)}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json({ translation: cached });

  const translation = await translateText(text, source, target);
  await redis.set(cacheKey, translation, { ex: 7 * 24 * 60 * 60 }); // 7-day cache
  res.json({ translation, source, target });
});
```

---

## FRONTEND TRACK (Dev 1)

### Days 15–17 — Trip Planner UI

```typescript
// app/trip/planner.tsx
import Slider from '@react-native-community/slider';

export default function TripPlannerScreen() {
  const [budget, setBudget] = useState(20000);
  const [duration, setDuration] = useState(5);
  const [destination, setDestination] = useState('');
  const [travelStyle, setTravelStyle] = useState<string[]>([]);

  const planTrip = useMutation({
    mutationFn: (params: TripParams) => api.post('/ai/trip/plan', params).then(r => r.data),
    onSuccess: (data) => router.push({ pathname: '/trip/itinerary', params: { id: data.id } }),
  });

  return (
    <ScrollView>
      <Text>Total Budget</Text>
      <Text style={styles.budgetLabel}>₹{budget.toLocaleString('en-IN')}</Text>
      <Slider minimumValue={5000} maximumValue={500000} step={1000}
        value={budget} onValueChange={setBudget} minimumTrackTintColor="#FF6B00" />

      <Text>Duration: {duration} days</Text>
      <Slider minimumValue={2} maximumValue={30} step={1}
        value={duration} onValueChange={setDuration} />

      <MultiSelectChips
        options={['Adventure', 'Culture', 'Relaxation', 'Pilgrimage', 'Food Tour', 'Wildlife']}
        value={travelStyle} onChange={setTravelStyle} />

      <Button
        label={planTrip.isPending ? 'Generating your trip...' : 'Plan My Trip ✈️'}
        onPress={() => planTrip.mutate({ budget, duration, destination, travelStyle })}
        loading={planTrip.isPending} />
    </ScrollView>
  );
}
```

**Itinerary display:**
```typescript
// app/trip/itinerary.tsx
export default function ItineraryScreen() {
  const { data: trip } = useTrip(params.id);
  return (
    <ScrollView>
      <BudgetBreakdown total={trip?.total_cost_inr} breakdown={trip?.budget_breakdown} />
      {trip?.days.map(day => <DayCard key={day.day} day={day} />)}
      <Section title="Cultural Notes 🙏">
        {trip?.cultural_notes.map((note, i) => <BulletPoint key={i} text={note} />)}
      </Section>
    </ScrollView>
  );
}
```

---

### Days 18–21 — Translation UI + Voice Pipeline

```bash
npm install expo-speech @react-native-voice/voice
```

```typescript
// app/translate/index.tsx
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

const INDIAN_LANGUAGES = [
  { code: 'hi', label: 'Hindi',     script: 'हिन्दी' },
  { code: 'bn', label: 'Bengali',   script: 'বাংলা' },
  { code: 'te', label: 'Telugu',    script: 'తెలుగు' },
  { code: 'ta', label: 'Tamil',     script: 'தமிழ்' },
  { code: 'mr', label: 'Marathi',   script: 'मराठी' },
  { code: 'gu', label: 'Gujarati',  script: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada',   script: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', script: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi',   script: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'Urdu',      script: 'اردو' },
  { code: 'or', label: 'Odia',      script: 'ଓଡ଼ିଆ' },
  { code: 'en', label: 'English',   script: 'English' },
];

export default function TranslateScreen() {
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [translation, setTranslation] = useState('');
  const [isListening, setIsListening] = useState(false);

  const translate = useMutation({
    mutationFn: ({ text, source, target }) =>
      api.post('/translate', { text, source, target }).then(r => r.data.translation),
    onSuccess: setTranslation,
  });

  Voice.onSpeechResults = (e) => {
    const text = e.value?.[0] ?? '';
    setInputText(text);
    translate.mutate({ text, source: sourceLang, target: targetLang });
    setIsListening(false);
  };

  return (
    <View>
      <LanguagePicker languages={INDIAN_LANGUAGES} value={sourceLang} onChange={setSourceLang} label="From" />
      <SwapButton onPress={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }} />
      <LanguagePicker languages={INDIAN_LANGUAGES} value={targetLang} onChange={setTargetLang} label="To" />

      <TextInput value={inputText} onChangeText={setInputText} placeholder="Type or speak..." multiline />
      <MicButton onPress={() => { setIsListening(true); Voice.start(sourceLang); }} active={isListening} />
      <Button label="Translate" onPress={() => translate.mutate({ text: inputText, source: sourceLang, target: targetLang })} />

      {translation ? (
        <View>
          <Text style={styles.translationOutput}>{translation}</Text>
          <IconButton icon="volume-high" onPress={() => Speech.speak(translation, { language: targetLang, rate: 0.9 })} />
          <IconButton icon="copy" onPress={() => Clipboard.setStringAsync(translation)} />
        </View>
      ) : null}
    </View>
  );
}
```

> **Voice pipeline summary:** Speak in any language → `@react-native-voice/voice` (device STT, free) → POST to `/translate` → Bhashini translates → `expo-speech` reads it aloud (device TTS, free). Fully offline-capable for TTS; only translation hits the network.

---

# Week 4 — Weather, Hotels & Polish

## BACKEND TRACK (Dev 2)

### Days 22–23 — Weather Module

```typescript
// src/services/weather.ts
// Open-Meteo: 100% free, no API key, no rate limit

export async function getWeatherForecast(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lng}` +
    `&daily=precipitation_sum,cloud_cover_mean,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=7&timezone=Asia%2FKolkata`;

  const resp = await fetch(url);
  const data = await resp.json();

  return data.daily.time.map((date: string, i: number) => ({
    date,
    temp_max: data.daily.temperature_2m_max[i],
    temp_min: data.daily.temperature_2m_min[i],
    cloud_cover_pct: data.daily.cloud_cover_mean[i],
    precipitation_mm: data.daily.precipitation_sum[i],
    alert: classifyWeather(data.daily.cloud_cover_mean[i], data.daily.precipitation_sum[i]),
  }));
}

function classifyWeather(cloudPct: number, precipMm: number): WeatherAlert {
  if (cloudPct < 20)  return { level: 'green',  message: 'Perfect travel day ☀️' };
  if (cloudPct < 50)  return { level: 'yellow', message: 'Partly cloudy, good for sightseeing' };
  if (cloudPct < 80)  return { level: 'orange', message: 'Overcast — carry an umbrella' };
  if (precipMm > 20)  return { level: 'red',    message: '⚠️ Heavy rain — reschedule outdoor plans' };
  return { level: 'orange', message: 'Mostly cloudy' };
}
```

**Smart rerouting with Groq:**
```typescript
// POST /api/ai/weather-alternatives
router.post('/ai/weather-alternatives', requireAuth, async (req, res) => {
  const { day, weather } = req.body;
  const prompt = `The user's trip plan for ${day.city} — "${day.title}" is disrupted.
Weather: ${weather.message}. Original activities: ${JSON.stringify(day.activities)}.
Suggest 3 indoor or rain-friendly alternatives in ${day.city}. Return JSON array of strings only.`;

  const completion = await groq.chat.completions.create({
    model: 'gemma2-9b-it',   // faster model for simple suggestions
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    response_format: { type: 'json_object' },
  });

  res.json({ alternatives: JSON.parse(completion.choices[0].message.content!) });
});
```

---

### Days 24–26 — Hotels & Restaurants

```typescript
// src/services/overpass.ts
// Overpass API: 100% free, unlimited, OpenStreetMap data

export async function getHotelsNearby(lat: number, lng: number, radiusKm: number) {
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="hotel"](around:${radiusKm * 1000},${lat},${lng});
      node["tourism"="hostel"](around:${radiusKm * 1000},${lat},${lng});
      node["tourism"="guest_house"](around:${radiusKm * 1000},${lat},${lng});
    );
    out body;
  `;

  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: query,
  });
  const { elements } = await resp.json();
  return elements.map((el: any) => ({
    id: el.id, name: el.tags.name,
    lat: el.lat, lng: el.lon,
    stars: parseInt(el.tags.stars ?? '0'),
    website: el.tags.website, phone: el.tags.phone,
    source: 'osm',
  }));
}

export async function getRestaurantsNearby(lat: number, lng: number, radiusKm: number) {
  const query = `
    [out:json][timeout:25];
    node["amenity"="restaurant"](around:${radiusKm * 1000},${lat},${lng});
    out body;
  `;
  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', body: query,
  });
  const { elements } = await resp.json();
  return elements.map((el: any) => ({
    id: el.id, name: el.tags.name,
    lat: el.lat, lng: el.lon,
    cuisine: el.tags.cuisine, website: el.tags.website,
  }));
}
```

```typescript
// GET /api/hotels?lat=&lng=&radius=&minStars=&maxPrice=
router.get('/hotels', async (req, res) => {
  const { lat, lng, radius = 5, minStars = 0, maxPrice } = req.query;
  let hotels = await getHotelsNearby(+lat, +lng, +radius);
  if (+minStars > 0) hotels = hotels.filter(h => h.stars >= +minStars);
  res.json({ hotels });
});
```

---

### Days 27–28 — Final Integration + Error Handling

Add global error handler, request logging, and 404 fallback:
```typescript
// src/middleware/errorHandler.ts
export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  if (err.name === 'ZodError') return res.status(400).json({ error: 'Invalid request', details: err.errors });
  res.status(500).json({ error: 'Internal server error' });
}

app.use('*', (req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);
```

---

## FRONTEND TRACK (Dev 1)

### Days 22–23 — Weather UI

```typescript
// components/WeatherCard.tsx
const ALERT_STYLES = {
  green:  { bg: '#E8F5E9', icon: '☀️', text: '#2E7D32' },
  yellow: { bg: '#FFF9C4', icon: '⛅', text: '#F57F17' },
  orange: { bg: '#FFE0B2', icon: '🌧️', text: '#E65100' },
  red:    { bg: '#FFEBEE', icon: '⛈️', text: '#C62828' },
};

export function WeatherCard({ forecast }: { forecast: DayForecast }) {
  const style = ALERT_STYLES[forecast.alert.level];
  return (
    <View style={[styles.card, { backgroundColor: style.bg }]}>
      <Text style={styles.date}>{formatDate(forecast.date)}</Text>
      <Text style={styles.icon}>{style.icon}</Text>
      <Text style={[styles.temp, { color: style.text }]}>
        {forecast.temp_max}° / {forecast.temp_min}°
      </Text>
      <Text style={{ color: style.text }}>{forecast.alert.message}</Text>
      <CloudBar pct={forecast.cloud_cover_pct} />
    </View>
  );
}

// 7-day row on the Place Detail screen
export function WeatherStrip({ lat, lng }: { lat: number, lng: number }) {
  const { data: forecast } = useQuery({
    queryKey: ['weather', lat, lng],
    queryFn: () => api.get('/weather', { params: { lat, lng } }).then(r => r.data.forecast),
  });
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {forecast?.map(day => <WeatherCard key={day.date} forecast={day} />)}
    </ScrollView>
  );
}
```

---

### Days 24–26 — Hotels & Restaurants UI

```typescript
// app/place/[id].tsx — Hotels tab
export function HotelsList({ lat, lng }: { lat: number; lng: number }) {
  const [minStars, setMinStars] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);

  const { data } = useQuery({
    queryKey: ['hotels', lat, lng, minStars, maxPrice],
    queryFn: () => api.get('/hotels', { params: { lat, lng, radius: 5, minStars, maxPrice } }).then(r => r.data.hotels),
  });

  return (
    <View>
      <FilterRow>
        <StarFilter value={minStars} onChange={setMinStars} />
        <PriceFilter value={maxPrice} onChange={setMaxPrice} max={10000} step={500} />
      </FilterRow>
      <FlashList data={data} renderItem={({ item }) => <HotelCard hotel={item} />} estimatedItemSize={120} />
    </View>
  );
}
```

---

### Days 27–28 — Polish + Performance

- Replace all `FlatList` with `FlashList` (`@shopify/flash-list`) — 10x faster for large lists
- Add `React.memo()` on all list item components
- Convert images to WebP via Cloudinary URL param: append `?f_auto,q_auto`
- Add skeleton loaders for all async screens
- Implement global `ErrorBoundary` with retry button
- Test on low-end Android (Redmi/Realme) using Expo Go

---

## API Contract Reference

```
# Places
GET  /api/places?state=&category=&page=&limit=&search=
GET  /api/places/:id
GET  /api/places/nearby?lat=&lng=&radius=

# Content
GET  /api/foods?state=&category=&page=
GET  /api/foods/:id
GET  /api/history?era=&place_id=
GET  /api/festivals?month=&state=
GET  /api/search?q=&types=

# AI
POST /api/ai/trip/plan          { budget, duration, destination, travelStyle, groupType, startCity, month, interests[] }
POST /api/ai/weather-alternatives { day: ItineraryDay, weather: WeatherAlert }

# Utilities
POST /api/translate             { text, source: LangCode, target: LangCode }
GET  /api/weather?lat=&lng=
GET  /api/hotels?lat=&lng=&radius=&minStars=&maxPrice=
GET  /api/restaurants?lat=&lng=&radius=&cuisine=
```

---

## Environment Variables

```bash
# Backend (.env)
DATABASE_URL=postgresql://neondb_owner:...@ep-falling-darkness-ai0mc8tn.aws.neon.tech/neondb
CLERK_SECRET_KEY=eyJh...       # service role key — never expose this
GROQ_API_KEY=gsk_...               # console.groq.com
UPSTASH_REDIS_URL=https://...      # console.upstash.com
UPSTASH_REDIS_TOKEN=...
BHASHINI_API_KEY=...               # bhashini.gov.in (free signup)
OTM_KEY=...                        # opentripmap.io (free tier)
PORT=3000

# Frontend (.env)
EXPO_PUBLIC_API_URL=https://your-app.onrender.com
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=eyJh...  # anon key — safe on client
```

---

## Zero-Cost Stack Summary

| Layer | Service | Cost |
|---|---|---|
| Mobile App | React Native + Expo | Free |
| Backend Hosting | Render.com | Free (750 hrs/mo) |
| Database | NeonDB Serverless PostgreSQL | Free (500MB) |
| Auth | Clerk Auth | Free (50K MAU) |
| Cache | Upstash Redis | Free (10K cmd/day) |
| AI / LLM | Groq (Llama 3.3 70B) | Free (500K tokens/day) |
| Translation | Bhashini (Govt of India API) | Free for Indian devs |
| Weather | Open-Meteo | Free (no key needed) |
| Maps | react-native-maps | Free (OSM / Google free quota) |
| Places Data | Overpass + Wikidata + Wikipedia | Free |
| Food Data | TheMealDB + Open Food Facts | Free |
| Hotels/POIs | OpenTripMap + Overpass | Free |
| CDN (images) | Cloudinary | Free (25GB) |
| Push Notifications | Expo Push | Free |
| CI/CD | GitHub Actions | Free (2000 min/mo) |
| **Total** | | **₹0/month** |
