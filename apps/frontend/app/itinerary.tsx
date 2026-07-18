import React, { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import PressableScale from "../components/common/PressableScale";
import GuideAvatar from "../components/guide/GuideAvatar";
import { planTrip, type TripParams } from "../services/endpoints";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAppStore } from "../stores/appStore";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const GROUP_BY_PURPOSE: Record<string, string> = {
  family: "family",
  honeymoon: "couple",
  business: "solo",
};

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export default function ItineraryScreen() {
  const guide = useAppStore((s: any) => s.guide);
  const destination = useAppStore((s: any) => s.destinationState) as string | null;
  const prefs = useAppStore((s: any) => s.tripPrefs) as
    | { purpose: string; interests: string[] }
    | null;

  const accent = guide?.color ?? "#FF6B35";
  const state = destination ?? "India";

  // Build the trip request. Budget/duration/start-city/month/group aren't asked
  // in the questionnaire, so we send sensible defaults — the AI plans around them.
  const params: TripParams = useMemo(
    () => ({
      destination: state,
      startCity: state === "Delhi" ? "Mumbai" : "Delhi",
      duration: 4,
      budget: 40000,
      travelStyle: prefs?.purpose ?? "leisure",
      groupType: prefs ? GROUP_BY_PURPOSE[prefs.purpose] ?? "couple" : "couple",
      month: MONTHS[new Date().getMonth()],
      interests: prefs?.interests ?? [],
    }),
    [state, prefs?.purpose, (prefs?.interests ?? []).join(",")]
  );

  const { data, loading, error, refetch } = useApiQuery(
    (signal) => planTrip(params, signal),
    [params.destination, params.travelStyle, params.interests.join(",")]
  );

  const itinerary = data?.data ?? null;

  // ---- Loading ----
  if (loading) {
    return (
      <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.center}>
        <View style={[styles.loaderAvatar, { borderColor: accent }]}>
          <GuideAvatar
            id={guide?.id}
            gender={guide?.gender ?? "female"}
            age={guide?.ageGroup ?? "adult"}
            color={accent}
            size={64}
            background={false}
          />
        </View>
        <ActivityIndicator color={accent} size="large" style={{ marginTop: 24 }} />
        <Text style={styles.loadingText}>Crafting your perfect trip to {state}…</Text>
        <Text style={styles.loadingSub}>The AI is planning your days ✨</Text>
      </LinearGradient>
    );
  }

  // ---- Error ----
  if (error || !itinerary) {
    const rateLimited = error?.status === 429;
    return (
      <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.center}>
        <Text style={styles.errorEmoji}>{rateLimited ? "⏳" : "🧭"}</Text>
        <Text style={styles.errorText}>
          {rateLimited ? "AI request limit reached" : "Couldn't plan your trip right now."}
        </Text>
        <Text style={styles.errorSub}>
          {rateLimited
            ? "The AI planner allows a limited number of requests per hour. Please try again in a few minutes."
            : error?.message ?? "Please try again."}
        </Text>
        <PressableScale style={[styles.primaryBtn, { backgroundColor: accent, marginTop: 24 }]} onPress={refetch}>
          <Text style={styles.primaryText}>Try Again</Text>
        </PressableScale>
        <PressableScale style={styles.ghostBtn} haptic={false} onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.ghostText}>Skip to app →</Text>
        </PressableScale>
      </LinearGradient>
    );
  }

  const bb = itinerary.budget_breakdown;
  const bars = [
    { label: "Stay", pct: bb.accommodation_pct, color: "#FF6B35" },
    { label: "Transport", pct: bb.transport_pct, color: "#22C55E" },
    { label: "Food", pct: bb.food_pct, color: "#FFB703" },
    { label: "Activities", pct: bb.activities_pct, color: "#2563EB" },
  ];

  return (
    <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>YOUR AI ITINERARY</Text>
          <Text style={styles.title}>{itinerary.title}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.chip, { backgroundColor: accent }]}>
              <Text style={styles.chipText}>📍 {state}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>💰 {inr(itinerary.total_cost_inr)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🗓️ {itinerary.days.length} days</Text>
            </View>
          </View>

          {itinerary.weather_warning ? (
            <View style={styles.warning}>
              <Text style={styles.warningText}>⚠️ {itinerary.weather_warning}</Text>
            </View>
          ) : null}

          {/* Budget breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Budget breakdown</Text>
            {bars.map((b) => (
              <View key={b.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{b.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${b.pct}%`, backgroundColor: b.color }]} />
                </View>
                <Text style={styles.barPct}>{b.pct}%</Text>
              </View>
            ))}
          </View>

          {/* Days */}
          {itinerary.days.map((day) => (
            <View key={day.day} style={styles.card}>
              <View style={styles.dayHeader}>
                <View style={[styles.dayBadge, { backgroundColor: accent }]}>
                  <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                </View>
                <Text style={styles.dayCost}>{inr(day.estimated_cost_inr)}</Text>
              </View>

              <Text style={styles.dayTitle}>{day.title}</Text>
              <Text style={styles.dayCity}>📍 {day.city}</Text>

              {day.activities.map((a, i) => (
                <Text key={i} style={styles.activity}>
                  •  {a}
                </Text>
              ))}

              <View style={styles.detailRow}>
                <Text style={styles.detail}>🏨 {day.hotel.name}</Text>
                <Text style={styles.detailSub}>{inr(day.hotel.price_per_night)}/night</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detail}>
                  🚗 {day.transport.from} → {day.transport.to} ({day.transport.mode})
                </Text>
                <Text style={styles.detailSub}>{inr(day.transport.cost)}</Text>
              </View>
            </View>
          ))}

          {/* Cultural notes */}
          {itinerary.cultural_notes?.length ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Good to know</Text>
              {itinerary.cultural_notes.map((n, i) => (
                <Text key={i} style={styles.note}>
                  •  {n}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Best time to visit</Text>
            <Text style={styles.bestTime}>{itinerary.best_time_to_visit}</Text>
          </View>

          <PressableScale
            style={[styles.primaryBtn, { backgroundColor: accent }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryText}>Start Exploring {state} →</Text>
          </PressableScale>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  content: { padding: 20, paddingBottom: 40 },

  loaderAvatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  loadingText: { color: "white", fontSize: 18, fontWeight: "700", marginTop: 22, textAlign: "center" },
  loadingSub: { color: "#9EC3EC", fontSize: 14, marginTop: 8 },

  errorEmoji: { fontSize: 44 },
  errorText: { color: "white", fontSize: 19, fontWeight: "700", marginTop: 14, textAlign: "center" },
  errorSub: { color: "#9EC3EC", fontSize: 13, marginTop: 8, textAlign: "center" },
  ghostBtn: { marginTop: 14, padding: 10 },
  ghostText: { color: "#DCEEFF", fontWeight: "600" },

  kicker: { color: "#7FB0E8", fontSize: 12, fontWeight: "800", letterSpacing: 2, marginTop: 6 },
  title: { color: "white", fontSize: 28, fontWeight: "800", marginTop: 6 },

  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  chip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { color: "white", fontWeight: "700", fontSize: 13 },

  warning: {
    marginTop: 16,
    backgroundColor: "rgba(234,179,8,0.15)",
    borderColor: "rgba(234,179,8,0.5)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  warningText: { color: "#FDE68A", fontSize: 14 },

  card: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "800", marginBottom: 12 },

  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  barLabel: { color: "#C9DCF2", width: 78, fontSize: 13 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  barPct: { color: "#9EC3EC", width: 40, textAlign: "right", fontSize: 12 },

  dayHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  dayBadgeText: { color: "white", fontWeight: "800", fontSize: 13 },
  dayCost: { color: "#9EC3EC", fontWeight: "700" },
  dayTitle: { color: "white", fontSize: 19, fontWeight: "800", marginTop: 12 },
  dayCity: { color: "#8FB6E6", marginTop: 4, marginBottom: 10 },
  activity: { color: "#EAF3FF", fontSize: 15, lineHeight: 24 },

  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  detail: { color: "#C9DCF2", fontSize: 13, flex: 1, paddingRight: 8 },
  detailSub: { color: "#9EC3EC", fontSize: 12, fontWeight: "600" },

  note: { color: "#EAF3FF", fontSize: 14, lineHeight: 23 },
  bestTime: { color: "#EAF3FF", fontSize: 15 },

  primaryBtn: {
    marginTop: 26,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  primaryText: { color: "white", fontWeight: "800", fontSize: 16 },
});
