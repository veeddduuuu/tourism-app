import { Bell } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import THEME from "../../constants/theme";
import { useAppStore } from "../../stores/appStore";
import { getWeather } from "../../services/weather";
import GuideAvatar from "../guide/GuideAvatar";
import PressableScale from "../common/PressableScale";

const weatherEmoji = (w: string): string => {
  const map: Record<string, string> = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
    Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Haze: "🌫️",
    Fog: "🌫️", Smoke: "🌫️",
  };
  return map[w] ?? "🌤️";
};

export default function AppHeader() {
  const guide = useAppStore((s: any) => s.guide);
  const state = useAppStore((s: any) => s.destinationState) as string | null;
  const accent = guide?.color ?? THEME.colors.primary;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const [weather, setWeather] = useState<{ weather: string; temperature: number } | null>(null);

  useEffect(() => {
    let active = true;
    getWeather(state ?? "India")
      .then((w) => active && setWeather(w))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [state]);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.greeting}>{greeting} 👋</Text>

        <Text style={styles.name} numberOfLines={1}>
          {state ? `Exploring ${state}` : "Explore Incredible India"}
        </Text>

        {weather && (
          <View style={styles.weatherChip}>
            <Text style={styles.weatherText}>
              {weatherEmoji(weather.weather)}  {Math.round(weather.temperature)}°C · {weather.weather}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <PressableScale haptic={false} style={styles.iconButton}>
          <Bell color="white" size={20} />
          <View style={styles.badge} />
        </PressableScale>

        <View style={[styles.avatarRing, { borderColor: accent }]}>
          <GuideAvatar
            id={guide?.id}
            gender={guide?.gender ?? "female"}
            age={guide?.ageGroup ?? "adult"}
            color={accent}
            size={42}
            background={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  left: { flex: 1, paddingRight: 12 },

  greeting: {
    color: THEME.colors.subtitle,
    fontSize: 14,
  },

  name: {
    color: THEME.colors.white,
    fontWeight: "800",
    fontSize: 24,
    marginTop: 5,
  },

  weatherChip: {
    alignSelf: "flex-start",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  weatherText: {
    color: "#EDEDF0",
    fontSize: 13,
    fontWeight: "600",
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginRight: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  badge: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    borderWidth: 1.5,
    borderColor: "#09090B",
  },

  avatarRing: {
    padding: 2,
    borderRadius: 26,
    borderWidth: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
