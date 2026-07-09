import * as Localization from "expo-localization";

import { getFestival } from "./festival";
import { getWelcomeContent } from "./gemini";
import { getUserLocation } from "./location";
import { getWeather } from "./weather";

export async function buildHomepage() {
  try {
    // -----------------------------
    // 1. Get User Location
    // -----------------------------
    const location = await getUserLocation();

    // -----------------------------
    // 2. Get Weather
    // -----------------------------
    const weather = await getWeather(location.city);

    // -----------------------------
    // 3. Detect Festival
    // -----------------------------
    const festival = getFestival();

    // -----------------------------
    // 4. Detect Time of Day
    // -----------------------------
    const hour = new Date().getHours();

    let timeOfDay = "Morning";

    if (hour >= 12 && hour < 17) {
      timeOfDay = "Afternoon";
    } else if (hour >= 17 && hour < 20) {
      timeOfDay = "Evening";
    } else if (hour >= 20 || hour < 5) {
      timeOfDay = "Night";
    }

    // -----------------------------
    // 5. Detect Device Language
    // -----------------------------
    const language =
      Localization.getLocales()[0]?.languageCode ?? "en";

    // -----------------------------
    // 6. Ask Gemini
    // -----------------------------
    const ai = await getWelcomeContent({
      city: location.city,
      country: location.country,

      weather: weather.weather,
      temperature: weather.temperature,

      festival,

      language,

      time: timeOfDay,
    });

    return ai;
  } catch (error) {
    console.log("Homepage Error:", error);

    // Fallback if anything fails
    return {
      title: "Welcome to India 🇮🇳",

      subtitle:
        "Every journey begins with a story.",

      imagePrompt:
        "Beautiful sunrise over Varanasi ghats India",
    };
  }
}