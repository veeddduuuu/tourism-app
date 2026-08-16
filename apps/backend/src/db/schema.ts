import { pgTable, uuid, text, decimal, integer, jsonb, boolean, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const states = pgTable('states', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  capital: text('capital'),
  region: text('region'),
  language: text('language'),
  description: text('description'),
  imageUrl: text('image_url'),
  bestSeason: text('best_season'),
  source: text('source'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  nameUid: uniqueIndex('states_name_uidx').on(table.name),
}));

export const cities = pgTable('cities', {
  id: uuid('id').defaultRandom().primaryKey(),
  stateId: uuid('state_id').references(() => states.id),
  name: text('name').notNull(),
  lat: decimal('lat', { precision: 9, scale: 6 }),
  lng: decimal('lng', { precision: 9, scale: 6 }),
  description: text('description'),
  externalId: text('external_id'),
  source: text('source'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  externalUid: uniqueIndex('cities_external_id_uidx').on(table.externalId),
  stateNameUid: uniqueIndex('cities_state_name_uidx').on(table.stateId, table.name),
}));

export const places = pgTable('places', {
  id: uuid('id').defaultRandom().primaryKey(),
  cityId: uuid('city_id').references(() => cities.id),
  name: text('name').notNull(),
  // heritage | temple | nature | beach | hill | museum | fort | other
  category: text('category'),
  lat: decimal('lat', { precision: 9, scale: 6 }),
  lng: decimal('lng', { precision: 9, scale: 6 }),
  rating: decimal('rating', { precision: 2, scale: 1 }),
  entryFee: integer('entry_fee'),
  timings: text('timings'),
  historyBrief: text('history_brief'),
  images: jsonb('images'),
  wikipediaUrl: text('wikipedia_url'),
  externalId: text('external_id'),
  source: text('source'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  nameSearchIndex: index('places_fts').using('gin', sql`to_tsvector('english', ${table.name} || ' ' || COALESCE(${table.historyBrief}, ''))`),
  externalUid: uniqueIndex('places_external_id_uidx').on(table.externalId),
  cityNameUid: uniqueIndex('places_city_name_uidx').on(table.cityId, table.name),
}));

export const historyEntries = pgTable('history_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  placeId: uuid('place_id').references(() => places.id),
  era: text('era'), // 'ancient' | 'medieval' | 'british' | 'modern'
  year: integer('year'),
  eventTitle: text('event_title').notNull(),
  description: text('description'),
  mediaUrl: text('media_url'),
  externalId: text('external_id'),
  source: text('source'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  externalUid: uniqueIndex('history_external_id_uidx').on(table.externalId),
}));

export const traditionalFoods = pgTable('traditional_foods', {
  id: uuid('id').defaultRandom().primaryKey(),
  stateId: uuid('state_id').references(() => states.id),
  name: text('name').notNull(),
  category: text('category'), // 'veg' | 'non-veg' | 'vegan' | 'sweet'
  prepTime: integer('prep_time'),
  difficulty: text('difficulty'),
  description: text('description'),
  imageUrl: text('image_url'),
  externalId: text('external_id'),
  source: text('source'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  nameSearchIndex: index('foods_fts').using('gin', sql`to_tsvector('english', ${table.name} || ' ' || COALESCE(${table.description}, ''))`),
  externalUid: uniqueIndex('foods_external_id_uidx').on(table.externalId),
}));

export const recipes = pgTable('recipes', {
  id: uuid('id').defaultRandom().primaryKey(),
  foodId: uuid('food_id').references(() => traditionalFoods.id),
  ingredients: jsonb('ingredients'), // [{ name, qty, unit }]
  steps: jsonb('steps'), // [{ step_no, instruction }]
  nutritionalInfo: jsonb('nutritional_info'),
  videoUrl: text('video_url'),
  source: text('source'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  foodUid: uniqueIndex('recipes_food_id_uidx').on(table.foodId),
}));

export const festivals = pgTable('festivals', {
  id: uuid('id').defaultRandom().primaryKey(),
  stateId: uuid('state_id').references(() => states.id),
  name: text('name').notNull(),
  month: integer('month'),
  durationDays: integer('duration_days'),
  description: text('description'),
  traditions: text('traditions'),
  isNational: boolean('is_national').default(false),
  externalId: text('external_id'),
  source: text('source'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  externalUid: uniqueIndex('festivals_external_id_uidx').on(table.externalId),
}));

export const hotels = pgTable('hotels', {
  id: uuid('id').defaultRandom().primaryKey(),
  cityId: uuid('city_id').references(() => cities.id),
  name: text('name').notNull(),
  stars: integer('stars'),
  pricePerNight: integer('price_per_night'),
  amenities: jsonb('amenities'),
  lat: decimal('lat', { precision: 9, scale: 6 }),
  lng: decimal('lng', { precision: 9, scale: 6 }),
  bookingUrl: text('booking_url'),
  rating: decimal('rating', { precision: 2, scale: 1 }),
  source: text('source'), // 'osm' | 'opentripmap' | 'manual'
});

export const aiTrips = pgTable('ai_trips', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'), // clerk user IDs are string-based
  budget: integer('budget'),
  duration: integer('duration'),
  preferences: jsonb('preferences'),
  generatedItinerary: jsonb('generated_itinerary'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
