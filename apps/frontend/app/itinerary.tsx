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

function money(amount: number, currency = "INR") {
  if (currency.toUpperCase() === "INR") {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

function budgetBars(budget: {
  travel: number;
  lodging: number;
  food: number;
  activities: number;
  misc: number;
  total: number;
}) {
  const total = budget.total || 1;
  const pct = (n: number) => Math.max(0, Math.min(100, Math.round((n / total) * 100)));
  return [
    { label: "Stay", pct: pct(budget.lodging), color: "#FF6B35" },
    { label: "Transport", pct: pct(budget.travel), color: "#22C55E" },
    { label: "Food", pct: pct(budget.food), color: "#FFB703" },
    { label: "Activities", pct: pct(budget.activities), color: "#2563EB" },
    { label: "Misc", pct: pct(budget.misc), color: "#A78BFA" },
  ];
}

export default function ItineraryScreen() {
  const guide = useAppStore((s: any) => s.guide);
  const destination = useAppStore((s: any) => s.destinationState) as string | null;
  const prefs = useAppStore((s: any) => s.tripPrefs);

  const accent = guide?.color ?? "#FF6B35";
  const state = destination ?? "India";
  const planDestination = prefs?.destination ?? state;

  const params: TripParams = useMemo(
    () => {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const iso = (d: Date) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const start = new Date(today);
      start.setDate(start.getDate() + 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 3);

      return {
        destination: planDestination,
        origin: prefs?.origin ?? "Delhi",
        startDate: prefs?.startDate ?? iso(start),
        endDate: prefs?.endDate ?? iso(end),
        budget: prefs?.budget ?? 40000,
        currency: prefs?.currency ?? "INR",
        travelers: prefs?.travelers ?? 2,
        pace: prefs?.pace ?? "moderate",
        interests: prefs?.interests ?? [],
        stayType: prefs?.stayType ?? "budget",
        transportMode: prefs?.transportMode ?? "any",
      };
    },
    [
      planDestination,
      prefs?.origin,
      prefs?.startDate,
      prefs?.endDate,
      prefs?.budget,
      prefs?.currency,
      prefs?.travelers,
      prefs?.pace,
      prefs?.stayType,
      prefs?.transportMode,
      (prefs?.interests ?? []).join(","),
    ]
  );

  const { data: plan, loading, error, refetch } = useApiQuery(
    (signal) => planTrip(params, signal),
    [
      params.destination,
      params.origin,
      params.startDate,
      params.endDate,
      params.budget,
      params.currency,
      params.travelers,
      params.pace,
      params.stayType,
      params.transportMode,
      params.interests.join(","),
    ]
  );

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
        <Text style={styles.loadingText}>Crafting your perfect trip to {planDestination}…</Text>
        <Text style={styles.loadingSub}>
          Multi-agent planner: weather → travel → hotels → itinerary → budget → critic
        </Text>
      </LinearGradient>
    );
  }

  if (error || !plan) {
    const rateLimited = error?.status === 429;
    return (
      <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.center}>
        <Text style={styles.errorEmoji}>{rateLimited ? "⏳" : "🧭"}</Text>
        <Text style={styles.errorText}>
          {rateLimited ? "AI request limit reached" : "Couldn't plan your trip right now."}
        </Text>
        <Text style={styles.errorSub}>
          {rateLimited
            ? "Please try again in a few minutes."
            : error?.message ?? "Is the Aaroh backend running?"}
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

  const bars = budgetBars(plan.budget);
  const currency = plan.budget.currency || "INR";
  const hotel = plan.hotels.recommendations[0];
  const weatherWarn =
    plan.weather.alerts?.[0] ??
    (plan.critique.issues.find((i) => i.area.toLowerCase().includes("weather"))?.message ||
      null);

  return (
    <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.kicker}>YOUR AI ITINERARY</Text>
          <Text style={styles.title}>{plan.destination}</Text>
          <Text style={styles.summary}>{plan.summary}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.chip, { backgroundColor: accent }]}>
              <Text style={styles.chipText}>📍 {plan.destination}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>💰 {money(plan.budget.total, currency)}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>🗓️ {plan.itinerary.days.length} days</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>⭐ {plan.critique.overall_score}/10</Text>
            </View>
          </View>

          {weatherWarn ? (
            <View style={styles.warning}>
              <Text style={styles.warningText}>⚠️ {weatherWarn}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weather</Text>
            <Text style={styles.body}>{plan.weather.summary}</Text>
            {plan.weather.packing_tips?.slice(0, 3).map((t, i) => (
              <Text key={i} style={styles.activity}>
                •  {t}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Budget breakdown</Text>
            {!plan.budget.within_budget ? (
              <Text style={styles.overBudget}>
                Over budget by {money(Math.abs(plan.budget.variance), currency)}
              </Text>
            ) : (
              <Text style={styles.underBudget}>Within budget ✓</Text>
            )}
            {bars.map((b) => (
              <View key={b.label} style={styles.barRow}>
                <Text style={styles.barLabel}>{b.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${b.pct}%`, backgroundColor: b.color }]} />
                </View>
                <Text style={styles.barPct}>{b.pct}%</Text>
              </View>
            ))}
            {plan.budget.suggestions?.slice(0, 3).map((s, i) => (
              <Text key={i} style={styles.note}>
                •  {s}
              </Text>
            ))}
          </View>

          {hotel ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Suggested stay</Text>
              <Text style={styles.dayTitle}>{hotel.name}</Text>
              <Text style={styles.dayCity}>
                📍 {hotel.area} · {hotel.type}
              </Text>
              <Text style={styles.body}>{hotel.why}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detail}>
                  {money(hotel.price_per_night, currency)}/night · {hotel.nights} nights
                </Text>
                <Text style={styles.detailSub}>{money(hotel.total_estimate, currency)}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Getting there</Text>
            <Text style={styles.body}>{plan.travel.summary}</Text>
            {plan.travel.to_destination?.slice(0, 2).map((leg, i) => {
              const from = leg.from ?? leg.from_place ?? "?";
              const to = leg.to ?? leg.to_place ?? "?";
              return (
                <View key={i} style={styles.detailRow}>
                  <Text style={styles.detail}>
                    🚗 {from} → {to} ({leg.mode})
                  </Text>
                  <Text style={styles.detailSub}>{money(leg.estimated_cost, currency)}</Text>
                </View>
              );
            })}
          </View>

          {plan.itinerary.days.map((day, idx) => (
            <View key={day.date + idx} style={styles.card}>
              <View style={styles.dayHeader}>
                <View style={[styles.dayBadge, { backgroundColor: accent }]}>
                  <Text style={styles.dayBadgeText}>Day {idx + 1}</Text>
                </View>
                <Text style={styles.dayCost}>{money(day.estimated_cost, currency)}</Text>
              </View>

              <Text style={styles.dayTitle}>{day.theme}</Text>
              <Text style={styles.dayCity}>📅 {day.date}</Text>
              {day.weather_note ? (
                <Text style={styles.weatherNote}>🌤 {day.weather_note}</Text>
              ) : null}

              <Text style={styles.slotLabel}>Morning</Text>
              <Text style={styles.activity}>{day.morning}</Text>
              <Text style={styles.slotLabel}>Afternoon</Text>
              <Text style={styles.activity}>{day.afternoon}</Text>
              <Text style={styles.slotLabel}>Evening</Text>
              <Text style={styles.activity}>{day.evening}</Text>

              {day.meals?.length ? (
                <Text style={styles.detail}>🍽 {day.meals.join(" · ")}</Text>
              ) : null}
            </View>
          ))}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Critic notes ({plan.critique.overall_score}/10)</Text>
            {plan.critique.strengths?.slice(0, 3).map((s, i) => (
              <Text key={`s${i}`} style={styles.note}>
                ✓  {s}
              </Text>
            ))}
            {plan.critique.issues?.slice(0, 4).map((issue, i) => (
              <Text key={`i${i}`} style={styles.note}>
                •  [{issue.severity}] {issue.message}
              </Text>
            ))}
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
  loadingSub: { color: "#9EC3EC", fontSize: 13, marginTop: 8, textAlign: "center", paddingHorizontal: 12 },

  errorEmoji: { fontSize: 44 },
  errorText: { color: "white", fontSize: 19, fontWeight: "700", marginTop: 14, textAlign: "center" },
  errorSub: { color: "#9EC3EC", fontSize: 13, marginTop: 8, textAlign: "center" },
  ghostBtn: { marginTop: 14, padding: 10 },
  ghostText: { color: "#DCEEFF", fontWeight: "600" },

  kicker: { color: "#7FB0E8", fontSize: 12, fontWeight: "800", letterSpacing: 2, marginTop: 6 },
  title: { color: "white", fontSize: 28, fontWeight: "800", marginTop: 6 },
  summary: { color: "#C9DCF2", fontSize: 14, lineHeight: 21, marginTop: 8 },

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
  body: { color: "#EAF3FF", fontSize: 14, lineHeight: 21, marginBottom: 8 },
  overBudget: { color: "#FCA5A5", fontSize: 13, fontWeight: "700", marginBottom: 10 },
  underBudget: { color: "#86EFAC", fontSize: 13, fontWeight: "700", marginBottom: 10 },

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
  weatherNote: { color: "#FDE68A", fontSize: 13, marginBottom: 8 },
  slotLabel: { color: "#7FB0E8", fontSize: 12, fontWeight: "800", marginTop: 8, letterSpacing: 0.5 },
  activity: { color: "#EAF3FF", fontSize: 15, lineHeight: 24 },

  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  detail: { color: "#C9DCF2", fontSize: 13, flex: 1, paddingRight: 8 },
  detailSub: { color: "#9EC3EC", fontSize: 12, fontWeight: "600" },

  note: { color: "#EAF3FF", fontSize: 14, lineHeight: 23 },

  primaryBtn: {
    marginTop: 26,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  primaryText: { color: "white", fontWeight: "800", fontSize: 16 },
});
