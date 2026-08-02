import { useSyncExternalStore } from "react";

export type StampCategory = "states" | "languages" | "foods" | "festivals" | "unesco" | "handicrafts";

export interface Stamp {
  id: string;
  category: StampCategory;
  name: string;
  emoji: string;
  description: string;
  hint: string;
  state: string;
  collectedDate?: string;
}

export interface TitleBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (collectedCount: number, stamps: Stamp[], collectedStampIds: string[]) => boolean;
}

export interface PassportState {
  stamps: Stamp[];
  collectedStampIds: string[];
  collectStamp: (id: string) => void;
  resetStamps: () => void;
}

const INITIAL_STAMPS: Stamp[] = [
  // States
  { id: "s1", category: "states", name: "Rajasthan", emoji: "🏰", description: "Land of Kings, historic hill forts, and majestic desert safaris.", hint: "Explore dynamic itineraries for Rajasthan or visit the history section.", state: "Rajasthan" },
  { id: "s2", category: "states", name: "Kerala", emoji: "🌴", description: "God's Own Country, known for serene backwaters, houseboats, and ayurveda.", hint: "Check out Kerala's spice boat tours and tropical recipes.", state: "Kerala" },
  { id: "s3", category: "states", name: "Goa", emoji: "🏖️", description: "Famed for its sandy beaches, stunning Portuguese churches, and coastal cuisine.", hint: "Explore the seafood culinary maps of West India.", state: "Goa" },
  { id: "s4", category: "states", name: "Uttar Pradesh", emoji: "🕌", description: "Cultural heartland home to the iconic Taj Mahal and the sacred Ganges.", hint: "Search for heritage monuments or the golden triangle itinerary.", state: "Uttar Pradesh" },
  { id: "s5", category: "states", name: "Jammu & Kashmir", emoji: "🏔️", description: "Paradise on Earth with snow-capped Himalayan peaks and beautiful houseboats.", hint: "Explore alpine treks and traditional Pashmina weavers.", state: "Jammu & Kashmir" },

  // Languages
  { id: "l1", category: "languages", name: "Hindi", emoji: "🗣️", description: "One of India's official languages, boasting a rich heritage of literature.", hint: "Try using the AI translation companion or listen to northern audio guides.", state: "North India" },
  { id: "l2", category: "languages", name: "Bengali", emoji: "✍️", description: "Sweet language of Nobel Laureate Rabindranath Tagore, poetry, and fine arts.", hint: "Interact with stories from the cultural heart of Bengal.", state: "West Bengal" },
  { id: "l3", category: "languages", name: "Tamil", emoji: "📜", description: "One of the oldest surviving classical languages in the world, dating back millennia.", hint: "Listen to the chanting guides at temple destinations.", state: "Tamil Nadu" },
  { id: "l4", category: "languages", name: "Marathi", emoji: "🦁", description: "Language of the Maratha Empire, holding a rich legacy in theater and folk songs.", hint: "Read up on the history of Maratha fort construction.", state: "Maharashtra" },
  { id: "l5", category: "languages", name: "Sanskrit", emoji: "🕉️", description: "The sacred classical language of ancient Indian scriptures and philosophy.", hint: "Attend a virtual temple ritual guide session.", state: "Pan-India" },

  // Foods
  { id: "f1", category: "foods", name: "Masala Dosa", emoji: "🍛", description: "Crisp golden rice crepe stuffed with spiced potato mash, served with sambar.", hint: "Browse South Indian recipes in the Food tab.", state: "Karnataka" },
  { id: "f2", category: "foods", name: "Biryani", emoji: "🍲", description: "Fragrant long-grain basmati rice layered with aromatic spices and slow-cooked to perfection.", hint: "View the Mughlai food card or popular food recommendations.", state: "Telangana" },
  { id: "f3", category: "foods", name: "Pav Bhaji", emoji: "🍞", description: "A buttery street-food curry of mashed vegetables served hot with soft bread rolls.", hint: "Explore Mumbai's street culinary guide.", state: "Maharashtra" },
  { id: "f4", category: "foods", name: "Dhokla", emoji: "🧽", description: "Spongy, savory steamed cake made from fermented batter, tempered with mustard seeds.", hint: "Look at Gujarat high-tea snacks in the Food library.", state: "Gujarat" },
  { id: "f5", category: "foods", name: "Rasgulla", emoji: "⚪", description: "Soft, syrupy cottage cheese balls, a legendary dessert of Eastern India.", hint: "Claim your sweet tooth stamp by viewing dessert recipes.", state: "West Bengal" },

  // Festivals
  { id: "v1", category: "festivals", name: "Diwali", emoji: "🪔", description: "The Festival of Lights celebrating the victory of light over spiritual darkness.", hint: "Explore the Festivals tab during autumn season.", state: "Pan-India" },
  { id: "v2", category: "festivals", name: "Holi", emoji: "🎨", description: "The Festival of Colors marking the arrival of spring, playfulness, and love.", hint: "Check out Mathura & Vrindavan Holi events.", state: "Uttar Pradesh" },
  { id: "v3", category: "festivals", name: "Durga Puja", emoji: "🦁", description: "A grand celebration of Goddess Durga, famous for magnificent, artistic pandals.", hint: "Look up Kolkata's pandal-hopping guide.", state: "West Bengal" },
  { id: "v4", category: "festivals", name: "Onam", emoji: "⛵", description: "Harvest festival of Kerala celebrated with flower carpets (Pookalam) and boat races.", hint: "View the Onam festival card.", state: "Kerala" },
  { id: "v5", category: "festivals", name: "Hornbill Festival", emoji: "🪶", description: "The Festival of Festivals in Nagaland showcasing rich tribal dance and music.", hint: "Discover Nagaland's cultural events.", state: "Nagaland" },

  // UNESCO Sites
  { id: "u1", category: "unesco", name: "Taj Mahal", emoji: "🕌", description: "An ivory-white marble monument of eternal love, one of the Seven Wonders.", hint: "Search for Agra attractions or read monument history.", state: "Uttar Pradesh" },
  { id: "u2", category: "unesco", name: "Hampi Ruins", emoji: "🛕", description: "Labyrinth of ancient temples and royal palaces amidst a scenic boulder-strewn terrain.", hint: "Open the Vijayanagara Empire history page.", state: "Karnataka" },
  { id: "u3", category: "unesco", name: "Ajanta Caves", emoji: "🎨", description: "Rock-cut caves adorned with masterpiece Buddhist murals and sculptures.", hint: "Read the history section on Cave Art.", state: "Maharashtra" },
  { id: "u4", category: "unesco", name: "Sundarbans Mangroves", emoji: "🐯", description: "The world's largest mangrove forest, habitat of the magnificent Bengal Tiger.", hint: "Explore nature trails in West Bengal.", state: "West Bengal" },
  { id: "u5", category: "unesco", name: "Konark Sun Temple", emoji: "☀️", description: "A colossal 13th-century temple styled as a stone chariot with intricate wheels.", hint: "Browse monument details for Odisha.", state: "Odisha" },

  // Handicrafts
  { id: "h1", category: "handicrafts", name: "Pashmina Shawl", emoji: "🧣", description: "Incredibly soft, warm cashmere wool handwoven by master artisans in the valleys.", hint: "Explore Kashmiri traditional textile markets.", state: "Jammu & Kashmir" },
  { id: "h2", category: "handicrafts", name: "Jaipur Blue Pottery", emoji: "🏺", description: "Glazed, hand-painted earthenware using natural cobalt dyes, unique to Jaipur.", hint: "Visit handicrafts vendors or souvenirs list in Rajasthan.", state: "Rajasthan" },
  { id: "h3", category: "handicrafts", name: "Kanjeevaram Silk", emoji: "🧵", description: "Exquisite handwoven silk sarees with heavy golden zari work, loved for weddings.", hint: "View textile traditions of South India.", state: "Tamil Nadu" },
  { id: "h4", category: "handicrafts", name: "Madhubani Painting", emoji: "🖌️", description: "Tribal wall paintings depicting mythology, hand-drawn with twigs and plant dyes.", hint: "Check out folk art workshops in Bihar.", state: "Bihar" },
  { id: "h5", category: "handicrafts", name: "Channapatna Wooden Toys", emoji: "🧸", description: "Brightly colored non-toxic wooden toys lacquered using vegetable dyes.", hint: "Look at regional toys and art in Karnataka.", state: "Karnataka" }
];

export const TITLE_BADGES: TitleBadge[] = [
  {
    id: "t1",
    name: "Heritage Explorer",
    description: "Awarded for starting your cultural journey and collecting 5 stamps.",
    icon: "🗺️",
    condition: (count) => count >= 5
  },
  {
    id: "t2",
    name: "Cultural Connoisseur",
    description: "Awarded for exploring all 6 categories (at least 1 stamp in each category).",
    icon: "🏺",
    condition: (count, stamps, collectedStampIds) => {
      const collectedStamps = stamps.filter(s => collectedStampIds.includes(s.id));
      const categories = new Set(collectedStamps.map(s => s.category));
      return categories.size >= 6;
    }
  },
  {
    id: "t3",
    name: "India Master Traveler",
    description: "Awarded for collecting 20 or more stamps. You are a true ambassador of Indian culture!",
    icon: "👑",
    condition: (count) => count >= 20
  },
  {
    id: "t4",
    name: "Linguistic Nomad",
    description: "Awarded for unlocking all 5 languages of the cultural passport.",
    icon: "📜",
    condition: (_, stamps, collectedStampIds) => {
      const collectedStamps = stamps.filter(s => collectedStampIds.includes(s.id));
      return collectedStamps.filter(s => s.category === "languages").length === 5;
    }
  },
  {
    id: "t5",
    name: "Gourmet Voyager",
    description: "Awarded for tasting all 5 local delicacies of India.",
    icon: "🍲",
    condition: (_, stamps, collectedStampIds) => {
      const collectedStamps = stamps.filter(s => collectedStampIds.includes(s.id));
      return collectedStamps.filter(s => s.category === "foods").length === 5;
    }
  }
];

let state = {
  stamps: INITIAL_STAMPS,
  collectedStampIds: ["s1", "l1", "f1", "v1", "u1", "h1"] as string[] // Pre-collected one stamp in each category to unlock "Cultural Connoisseur" out-of-the-box
};

const listeners = new Set<() => void>();

function setState(partial: Partial<typeof state>) {
  state = { ...state, ...partial };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const actions = {
  collectStamp: (id: string) => {
    if (state.collectedStampIds.includes(id)) return;
    const newCollected = [...state.collectedStampIds, id];
    
    // Update stamp collection date
    const updatedStamps = state.stamps.map(s => {
      if (s.id === id) {
        return { ...s, collectedDate: new Date().toLocaleDateString() };
      }
      return s;
    });

    setState({
      collectedStampIds: newCollected,
      stamps: updatedStamps
    });
  },
  resetStamps: () => {
    setState({
      collectedStampIds: [],
      stamps: INITIAL_STAMPS.map(s => ({ ...s, collectedDate: undefined }))
    });
  }
};

function getSnapshot() {
  return { ...state, ...actions };
}

export function usePassportStore<T>(selector: (s: PassportState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getSnapshot())
  );
}

export const passportStore = {
  getState: getSnapshot,
  collectStamp: actions.collectStamp,
  resetStamps: actions.resetStamps
};
