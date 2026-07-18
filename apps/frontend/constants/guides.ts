import type { Gender, AgeGroup } from "../stores/appStore";

export interface GuideCharacter {
  id: string;
  name: string;
  role: string;
  totem: string; // role emoji
  color: string;
  defaultGender: Gender; // look shown on the selection card
  greeting: string;
  tips: string[];
}

export const AGE_GROUPS: { key: AgeGroup; label: string }[] = [
  { key: "young", label: "Young" },
  { key: "adult", label: "Adult" },
  { key: "senior", label: "Senior" },
];

export const GENDERS: { key: Gender; label: string }[] = [
  { key: "female", label: "Female" },
  { key: "male", label: "Male" },
];

// Person emoji chosen from gender + age group — the customisable avatar.
const AVATARS: Record<Gender, Record<AgeGroup, string>> = {
  female: { young: "👧", adult: "👩", senior: "👵" },
  male: { young: "👦", adult: "👨", senior: "👴" },
};

export function buildAvatar(gender: Gender, ageGroup: AgeGroup): string {
  return AVATARS[gender][ageGroup];
}

export const DEFAULT_GUIDE_ID = "aarohi";

export const GUIDES: GuideCharacter[] = [
  {
    id: "aarohi",
    name: "Aarohi",
    role: "Culture Guide",
    totem: "🪷",
    color: "#FF6B35",
    defaultGender: "female",
    greeting: "Namaste! I'll show you the soul of India.",
    tips: [
      "Tap a state on the map to begin your journey.",
      "Every region has its own story — let's explore together!",
      "Check out featured destinations right here on the home screen.",
    ],
  },
  {
    id: "ravi",
    name: "Ravi",
    role: "Foodie",
    totem: "🍛",
    color: "#F4A300",
    defaultGender: "male",
    greeting: "Bhookh lagi? Let's chase India's best flavours!",
    tips: [
      "Swipe through Popular Foods for local delicacies.",
      "Every state has a signature dish — don't miss it!",
      "Street food is where the real magic happens.",
    ],
  },
  {
    id: "meera",
    name: "Meera",
    role: "History Buff",
    totem: "🏛️",
    color: "#C98F3C",
    defaultGender: "female",
    greeting: "Let's walk through centuries of history.",
    tips: [
      "Explore the History timeline on the home screen.",
      "Each monument hides a thousand tales.",
      "Tap a destination to uncover its past.",
    ],
  },
  {
    id: "arjun",
    name: "Arjun",
    role: "Adventure Guide",
    totem: "🏔️",
    color: "#22C55E",
    defaultGender: "male",
    greeting: "Ready for mountains, forests and thrills?",
    tips: [
      "Discover breathtaking destinations to explore.",
      "Nature is calling — let's answer it!",
      "Pack light, dream big.",
    ],
  },
  {
    id: "priya",
    name: "Priya",
    role: "Festival Expert",
    totem: "🎉",
    color: "#EC4899",
    defaultGender: "female",
    greeting: "Let's celebrate India's vibrant festivals!",
    tips: [
      "See Upcoming Festivals on the home screen.",
      "Colour, music and joy await you.",
      "There's always a festival somewhere in India!",
    ],
  },
  {
    id: "kabir",
    name: "Kabir",
    role: "Local Friend",
    totem: "🛺",
    color: "#2563EB",
    defaultGender: "male",
    greeting: "Chalo! I'll show you India like a local.",
    tips: [
      "I'll share little tips as you explore each page.",
      "Ask me anything about your destination.",
      "The best spots are the ones locals love.",
    ],
  },
];
