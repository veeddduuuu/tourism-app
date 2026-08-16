import '../config'; // load DATABASE_URL before ./index reads it
import { db } from './index';
import {
  states,
  cities,
  places,
  traditionalFoods,
  recipes,
  festivals,
  historyEntries,
  hotels,
} from './schema';

/**
 * Demo fixture only — wipe-and-insert a tiny catalog for empty local bootstraps.
 * Production / real catalog: `npm run ingest` (see docs/CONTENT_INGEST.md).
 *
 * This script DELETES states/cities/places/foods/festivals/history. Refusing to
 * run without an explicit wipe flag keeps ingested data safe.
 *
 *   npm run db:seed -- --wipe
 *   SEED_WIPE=1 npx ts-node --transpile-only src/db/seed.ts
 */
async function seed() {
  const wipe = process.argv.includes('--wipe') || process.env.SEED_WIPE === '1';
  if (!wipe) {
    console.error(
      'Demo seed wipes catalog tables. Re-run with --wipe (or SEED_WIPE=1).\n' +
        'For the real catalog use: npm run ingest   (docs/CONTENT_INGEST.md)'
    );
    process.exit(1);
  }

  console.log('Clearing existing rows (demo seed wipe)...');
  // Delete in FK-dependency order (children first).
  await db.delete(historyEntries);
  await db.delete(recipes);
  await db.delete(places);
  await db.delete(traditionalFoods);
  await db.delete(festivals);
  await db.delete(hotels);
  await db.delete(cities);
  await db.delete(states);

  console.log('Inserting states...');
  const stateRows = await db
    .insert(states)
    .values([
      { name: 'Uttar Pradesh', capital: 'Lucknow', region: 'North' },
      { name: 'Rajasthan', capital: 'Jaipur', region: 'North' },
      { name: 'Punjab', capital: 'Chandigarh', region: 'North' },
      { name: 'Delhi', capital: 'New Delhi', region: 'North' },
      { name: 'Himachal Pradesh', capital: 'Shimla', region: 'North' },
      { name: 'Uttarakhand', capital: 'Dehradun', region: 'North' },
      { name: 'Tamil Nadu', capital: 'Chennai', region: 'South' },
      { name: 'Telangana', capital: 'Hyderabad', region: 'South' },
      { name: 'Kerala', capital: 'Thiruvananthapuram', region: 'South' },
      { name: 'Karnataka', capital: 'Bengaluru', region: 'South' },
      { name: 'Maharashtra', capital: 'Mumbai', region: 'West' },
      { name: 'Goa', capital: 'Panaji', region: 'West' },
      { name: 'West Bengal', capital: 'Kolkata', region: 'East' },
    ])
    .returning({ id: states.id, name: states.name });

  const stateId = (name: string) => {
    const s = stateRows.find((r) => r.name === name);
    if (!s) throw new Error(`Missing state: ${name}`);
    return s.id;
  };

  console.log('Inserting cities...');
  const cityRows = await db
    .insert(cities)
    .values([
      { name: 'Agra', stateId: stateId('Uttar Pradesh') },
      { name: 'Varanasi', stateId: stateId('Uttar Pradesh') },
      { name: 'Jaipur', stateId: stateId('Rajasthan') },
      { name: 'Udaipur', stateId: stateId('Rajasthan') },
      { name: 'Jodhpur', stateId: stateId('Rajasthan') },
      { name: 'Amritsar', stateId: stateId('Punjab') },
      { name: 'New Delhi', stateId: stateId('Delhi') },
      { name: 'Shimla', stateId: stateId('Himachal Pradesh') },
      { name: 'Manali', stateId: stateId('Himachal Pradesh') },
      { name: 'Rishikesh', stateId: stateId('Uttarakhand') },
      { name: 'Nainital', stateId: stateId('Uttarakhand') },
      { name: 'Madurai', stateId: stateId('Tamil Nadu') },
      { name: 'Chennai', stateId: stateId('Tamil Nadu') },
      { name: 'Mahabalipuram', stateId: stateId('Tamil Nadu') },
      { name: 'Hyderabad', stateId: stateId('Telangana') },
      { name: 'Kochi', stateId: stateId('Kerala') },
      { name: 'Alappuzha', stateId: stateId('Kerala') },
      { name: 'Munnar', stateId: stateId('Kerala') },
      { name: 'Mysuru', stateId: stateId('Karnataka') },
      { name: 'Hampi', stateId: stateId('Karnataka') },
      { name: 'Bengaluru', stateId: stateId('Karnataka') },
      { name: 'Mumbai', stateId: stateId('Maharashtra') },
      { name: 'Aurangabad', stateId: stateId('Maharashtra') },
      { name: 'Raigad', stateId: stateId('Maharashtra') },
      { name: 'Panaji', stateId: stateId('Goa') },
      { name: 'Kolkata', stateId: stateId('West Bengal') },
      { name: 'Darjeeling', stateId: stateId('West Bengal') },
    ])
    .returning({ id: cities.id, name: cities.name });

  const cityId = (name: string) => {
    const c = cityRows.find((r) => r.name === name);
    if (!c) throw new Error(`Missing city: ${name}`);
    return c.id;
  };

  // A small pool of verified Unsplash imagery, reused so every card loads.
  const IMG = {
    monument: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200',
    palace: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09d?w=1200',
    temple: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200',
    palace2: 'https://images.unsplash.com/photo-1600100397608-f010e0dacd0f?w=1200',
    street: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
    nature: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200',
  };

  const place = (
    city: string,
    name: string,
    category: string,
    rating: string,
    entryFee: number,
    historyBrief: string,
    image: string
  ) => ({ cityId: cityId(city), name, category, rating, entryFee, historyBrief, images: [image] });

  console.log('Inserting places...');
  await db.insert(places).values([
    // Uttar Pradesh
    place('Agra', 'Taj Mahal', 'heritage', '4.9', 50, 'An ivory-white marble mausoleum on the Yamuna river.', IMG.monument),
    place('Agra', 'Agra Fort', 'heritage', '4.7', 40, 'A red-sandstone Mughal fortress beside the Taj.', IMG.palace),
    place('Agra', 'Fatehpur Sikri', 'heritage', '4.6', 50, 'A perfectly preserved Mughal ghost city.', IMG.monument),
    place('Varanasi', 'Varanasi Ghats', 'temple', '4.8', 0, 'Sacred riverfront steps on the holy Ganges.', IMG.temple),
    // Rajasthan
    place('Jaipur', 'Hawa Mahal', 'heritage', '4.8', 200, 'The "Palace of Winds", famous for its honeycomb facade.', IMG.palace),
    place('Jaipur', 'Amber Fort', 'heritage', '4.8', 100, 'A majestic hilltop fort above Maota Lake.', IMG.monument),
    place('Udaipur', 'City Palace, Udaipur', 'heritage', '4.7', 300, 'A lakeside palace complex in the City of Lakes.', IMG.palace2),
    place('Jodhpur', 'Mehrangarh Fort', 'heritage', '4.8', 120, 'One of India’s largest forts over the Blue City.', IMG.monument),
    // Punjab
    place('Amritsar', 'Golden Temple', 'temple', '4.9', 0, 'The holiest gurdwara of Sikhism, gilded in gold.', IMG.temple),
    place('Amritsar', 'Jallianwala Bagh', 'heritage', '4.6', 0, 'A poignant memorial garden of the freedom struggle.', IMG.street),
    place('Amritsar', 'Wagah Border', 'heritage', '4.7', 0, 'The famous daily beating-retreat ceremony.', IMG.street),
    // Delhi
    place('New Delhi', 'India Gate', 'heritage', '4.7', 0, 'A war memorial arch at the heart of the capital.', IMG.monument),
    place('New Delhi', 'Red Fort', 'heritage', '4.7', 35, 'The Mughal emperors’ mighty red-walled citadel.', IMG.palace),
    place('New Delhi', 'Qutub Minar', 'heritage', '4.6', 30, 'The world’s tallest brick minaret.', IMG.monument),
    place('New Delhi', 'Lotus Temple', 'temple', '4.7', 0, 'A serene lotus-shaped Baha’i house of worship.', IMG.temple),
    // Himachal Pradesh
    place('Shimla', 'The Ridge, Shimla', 'hill', '4.6', 0, 'A colonial hill-station promenade with valley views.', IMG.nature),
    place('Manali', 'Solang Valley', 'nature', '4.7', 0, 'A snow-sports valley ringed by Himalayan peaks.', IMG.nature),
    place('Manali', 'Rohtang Pass', 'nature', '4.8', 0, 'A high mountain pass of glaciers and snowfields.', IMG.nature),
    // Uttarakhand
    place('Rishikesh', 'Rishikesh', 'temple', '4.7', 0, 'The yoga capital on the banks of the Ganges.', IMG.nature),
    place('Nainital', 'Naini Lake', 'nature', '4.6', 0, 'A crescent lake amid the Kumaon hills.', IMG.nature),
    // Tamil Nadu
    place('Madurai', 'Meenakshi Temple', 'temple', '4.9', 0, 'A towering, riotously colourful Dravidian temple.', IMG.temple),
    place('Chennai', 'Marina Beach', 'beach', '4.5', 0, 'One of the world’s longest urban beaches.', IMG.street),
    place('Mahabalipuram', 'Shore Temple', 'temple', '4.7', 40, 'Seaside granite temples from the Pallava era.', IMG.temple),
    // Telangana
    place('Hyderabad', 'Charminar', 'heritage', '4.7', 25, 'The four-minaret icon at the heart of old Hyderabad.', IMG.monument),
    place('Hyderabad', 'Golconda Fort', 'heritage', '4.7', 25, 'A ruined granite fortress of the Qutb Shahis.', IMG.palace),
    // Kerala
    place('Munnar', 'Munnar Tea Hills', 'nature', '4.8', 0, 'Rolling emerald tea gardens in the Western Ghats.', IMG.nature),
    place('Alappuzha', 'Alleppey Backwaters', 'nature', '4.8', 0, 'Palm-fringed canals cruised by houseboats.', IMG.nature),
    place('Kochi', 'Fort Kochi', 'heritage', '4.6', 0, 'A colonial-era port of Chinese fishing nets.', IMG.street),
    // Karnataka
    place('Mysuru', 'Mysore Palace', 'heritage', '4.7', 70, 'The opulent seat of the Wadiyar dynasty.', IMG.palace2),
    place('Hampi', 'Hampi Ruins', 'heritage', '4.8', 40, 'The vast boulder-strewn Vijayanagara capital.', IMG.temple),
    place('Bengaluru', 'Bangalore Palace', 'heritage', '4.4', 230, 'A Tudor-style royal residence in the Garden City.', IMG.palace),
    // Maharashtra
    place('Mumbai', 'Gateway of India', 'heritage', '4.7', 0, 'The grand seafront arch of colonial Bombay.', IMG.monument),
    place('Mumbai', 'Marine Drive', 'beach', '4.6', 0, 'The glittering "Queen’s Necklace" promenade.', IMG.street),
    place('Aurangabad', 'Ajanta Caves', 'heritage', '4.8', 40, 'Ancient rock-cut Buddhist caves and murals.', IMG.temple),
    place('Raigad', 'Raigad Fort', 'heritage', '4.7', 0, 'The mountain capital of Chhatrapati Shivaji.', IMG.monument),
    // Goa
    place('Panaji', 'Baga Beach', 'beach', '4.5', 0, 'A lively golden beach of shacks and water sports.', IMG.street),
    place('Panaji', 'Basilica of Bom Jesus', 'heritage', '4.7', 0, 'A UNESCO baroque church of Old Goa.', IMG.temple),
    // West Bengal
    place('Kolkata', 'Victoria Memorial', 'heritage', '4.7', 30, 'A gleaming white marble monument to the Raj.', IMG.monument),
    place('Kolkata', 'Howrah Bridge', 'heritage', '4.6', 0, 'The iconic cantilever bridge over the Hooghly.', IMG.street),
    place('Darjeeling', 'Darjeeling Hills', 'nature', '4.8', 0, 'Tea slopes and toy-train views of Kanchenjunga.', IMG.nature),
  ]);

  console.log('Inserting foods...');
  await db.insert(traditionalFoods).values([
    {
      stateId: stateId('Punjab'),
      name: 'Butter Chicken',
      category: 'non-veg',
      prepTime: 45,
      difficulty: 'Medium',
      description: 'Tandoori chicken in a spiced tomato-butter gravy.',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1200',
    },
    {
      stateId: stateId('Tamil Nadu'),
      name: 'Masala Dosa',
      category: 'veg',
      prepTime: 30,
      difficulty: 'Easy',
      description: 'Crispy rice crepe filled with spiced potato.',
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=1200',
    },
    {
      stateId: stateId('Telangana'),
      name: 'Hyderabadi Biryani',
      category: 'non-veg',
      prepTime: 60,
      difficulty: 'Hard',
      description: 'Fragrant layered rice cooked with marinated meat.',
      imageUrl: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=1200',
    },
    {
      stateId: stateId('Maharashtra'),
      name: 'Vada Pav',
      category: 'veg',
      prepTime: 20,
      difficulty: 'Easy',
      description: "Mumbai's iconic spiced-potato fritter in a bun.",
      imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=1200',
    },
  ]);

  console.log('Inserting festivals...');
  await db.insert(festivals).values([
    {
      name: 'Diwali',
      month: 10,
      durationDays: 5,
      description: 'The festival of lights celebrated across India.',
      isNational: true,
    },
    {
      name: 'Holi',
      month: 3,
      durationDays: 2,
      description: 'The festival of colours marking the arrival of spring.',
      isNational: true,
    },
    {
      name: 'Onam',
      month: 8,
      durationDays: 10,
      description: "Kerala's harvest festival with boat races and feasts.",
      isNational: false,
      stateId: stateId('Kerala'),
    },
    {
      name: 'Navratri',
      month: 10,
      durationDays: 9,
      description: 'Nine nights of dance and devotion to goddess Durga.',
      isNational: true,
    },
  ]);

  console.log('Inserting history entries...');
  await db.insert(historyEntries).values([
    {
      era: 'ancient',
      year: -3300,
      eventTitle: 'Indus Valley Civilization',
      description: "One of the world's earliest urban civilizations.",
    },
    {
      era: 'ancient',
      year: -322,
      eventTitle: 'Maurya Empire',
      description: 'Chandragupta Maurya united most of India.',
    },
    {
      era: 'ancient',
      year: 320,
      eventTitle: 'Gupta Empire',
      description: "India's classical golden age of science and art.",
    },
    {
      era: 'medieval',
      year: 1526,
      eventTitle: 'Mughal Empire',
      description: 'Beginning of the Mughal era under Babur.',
    },
    {
      era: 'modern',
      year: 1947,
      eventTitle: 'Indian Independence',
      description: 'India gained independence from British rule.',
    },
  ]);

  console.log('✅ Seed complete.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
