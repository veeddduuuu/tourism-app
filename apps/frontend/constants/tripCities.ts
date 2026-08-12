/** Major cities / regions the planner can focus on within each mapped state. */
export const CITIES_BY_STATE: Record<string, string[]> = {
  "Andaman & Nicobar": ["Port Blair", "Havelock Island", "Neil Island"],
  "Andhra Pradesh": ["Visakhapatnam", "Tirupati", "Vijayawada", "Amaravati"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro"],
  Assam: ["Guwahati", "Kaziranga", "Majuli", "Jorhat"],
  Bihar: ["Patna", "Bodh Gaya", "Nalanda", "Rajgir"],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Jagdalpur"],
  "Dadra & Nagar Haveli": ["Silvassa"],
  Delhi: ["New Delhi", "Old Delhi", "Connaught Place", "South Delhi"],
  Goa: ["Panaji", "North Goa", "South Goa", "Vasco da Gama"],
  Gujarat: ["Ahmedabad", "Vadodara", "Surat", "Dwarka", "Kutch"],
  Haryana: ["Gurugram", "Chandigarh", "Kurukshetra", "Faridabad"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Spiti"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Gulmarg", "Pahalgam"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Deoghar"],
  Karnataka: ["Bengaluru", "Mysuru", "Hampi", "Coorg", "Gokarna"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Munnar", "Alleppey", "Kozhikode"],
  Ladakh: ["Leh", "Nubra Valley", "Pangong", "Kargil"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Khajuraho", "Gwalior", "Ujjain"],
  Maharashtra: ["Mumbai", "Pune", "Nashik", "Aurangabad", "Mahabaleshwar"],
  Manipur: ["Imphal", "Loktak Lake"],
  Meghalaya: ["Shillong", "Cherrapunji", "Dawki"],
  Mizoram: ["Aizawl", "Lunglei"],
  Nagaland: ["Kohima", "Dimapur"],
  Odisha: ["Bhubaneswar", "Puri", "Konark", "Cuttack"],
  Puducherry: ["Pondicherry", "Auroville"],
  Punjab: ["Amritsar", "Ludhiana", "Chandigarh", "Patiala"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Pushkar"],
  Sikkim: ["Gangtok", "Pelling", "Lachung"],
  "Tamil Nadu": ["Chennai", "Madurai", "Ooty", "Kodaikanal", "Rameswaram"],
  Telangana: ["Hyderabad", "Warangal", "Ramoji Film City"],
  Tripura: ["Agartala", "Udaipur (Tripura)"],
  "Uttar Pradesh": ["Lucknow", "Varanasi", "Agra", "Prayagraj", "Mathura"],
  Uttarakhand: ["Dehradun", "Rishikesh", "Mussoorie", "Nainital", "Haridwar"],
  "West Bengal": ["Kolkata", "Darjeeling", "Sundarbans", "Siliguri"],
};

/** Common Indian departure cities for the origin step. */
export const ORIGIN_CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
  "Kochi",
  "Lucknow",
];

export const BUDGET_OPTIONS = [
  { key: 15000, label: "₹15,000", hint: "Budget" },
  { key: 30000, label: "₹30,000", hint: "Comfort" },
  { key: 50000, label: "₹50,000", hint: "Premium" },
  { key: 75000, label: "₹75,000", hint: "Luxury" },
  { key: 100000, label: "₹1,00,000+", hint: "No limits" },
];

export const DURATION_OPTIONS = [
  { key: 2, label: "2 days" },
  { key: 3, label: "3 days" },
  { key: 4, label: "4 days" },
  { key: 5, label: "5 days" },
  { key: 7, label: "1 week" },
  { key: 10, label: "10 days" },
];

export const GROUP_OPTIONS = [
  { key: "solo", label: "Solo", emoji: "🧍" },
  { key: "couple", label: "Couple", emoji: "💑" },
  { key: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { key: "friends", label: "Friends", emoji: "👯" },
];

export function citiesForState(state: string | null | undefined): string[] {
  if (!state) return [];
  return CITIES_BY_STATE[state] ?? [];
}
