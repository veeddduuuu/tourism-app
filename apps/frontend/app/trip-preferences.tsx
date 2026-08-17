import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import PressableScale from "../components/common/PressableScale";
import GuideAvatar from "../components/guide/GuideAvatar";
import { citiesForState, ORIGIN_CITIES } from "../constants/tripCities";
import { useAppStore } from "../stores/appStore";
import type { TripPrefs } from "../stores/appStore";

const PACE_OPTIONS: { key: TripPrefs["pace"]; label: string }[] = [
  { key: "relaxed", label: "Relaxed" },
  { key: "moderate", label: "Moderate" },
  { key: "packed", label: "Packed" },
];

const STAY_OPTIONS: { key: NonNullable<TripPrefs["stayType"]>; label: string }[] = [
  { key: "hostel", label: "Hostel" },
  { key: "budget", label: "Budget" },
  { key: "boutique", label: "Boutique" },
  { key: "luxury", label: "Luxury" },
  { key: "apartment", label: "Apartment" },
];

const TRANSPORT_OPTIONS: { key: TripPrefs["transportMode"]; label: string }[] = [
  { key: "any", label: "Any" },
  { key: "flight", label: "Flight" },
  { key: "train", label: "Train" },
  { key: "car", label: "Car" },
  { key: "mixed", label: "Mixed" },
];

const INTEREST_SUGGESTIONS = [
  "monuments",
  "nature",
  "food",
  "festivals",
  "shopping",
  "temples",
  "beaches",
  "museums",
  "nightlife",
  "adventure",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T00:00:00");
  return !Number.isNaN(d.getTime()) && toISODate(d) === value;
}

type SegmentProps<T extends string> = {
  options: { key: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  accent: string;
  wrap?: boolean;
};

function Segmented<T extends string>({
  options,
  value,
  onChange,
  accent,
  wrap,
}: SegmentProps<T>) {
  return (
    <View style={[styles.segmentRow, wrap && styles.segmentWrap]}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <PressableScale
            key={opt.key}
            haptic={false}
            style={[
              styles.segment,
              wrap && styles.segmentWrapItem,
              active && { backgroundColor: accent, borderColor: accent },
            ]}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onChange(opt.key);
            }}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {opt.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: string;
  flex?: number;
};

function Field({ label, children, hint, flex }: FieldProps) {
  return (
    <View style={[styles.field, flex != null && { flex }]}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export default function TripPreferences() {
  const guide = useAppStore((s) => s.guide);
  const destinationState = useAppStore((s) => s.destinationState);
  const setTripPrefs = useAppStore((s) => s.setTripPrefs);
  const setSavedPlan = useAppStore((s) => s.setSavedPlan);

  const accent = guide?.color ?? "#FF6B35";
  const place = destinationState ?? "India";
  const focusCities = useMemo(() => citiesForState(destinationState), [destinationState]);

  const today = useMemo(() => new Date(), []);
  const [destination, setDestination] = useState(place);
  const [origin, setOrigin] = useState("Delhi");
  const [startDate, setStartDate] = useState(toISODate(addDays(today, 7)));
  const [endDate, setEndDate] = useState(toISODate(addDays(today, 10)));
  const [budget, setBudget] = useState("40000");
  const [travelers, setTravelers] = useState("2");
  const [pace, setPace] = useState<TripPrefs["pace"]>("moderate");
  const [stayType, setStayType] = useState<NonNullable<TripPrefs["stayType"]>>("budget");
  const [transportMode, setTransportMode] =
    useState<TripPrefs["transportMode"]>("any");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestDraft, setInterestDraft] = useState("");

  const budgetNum = Number(budget.replace(/,/g, ""));
  const travelersNum = Number(travelers);
  const datesOk =
    isValidISODate(startDate) &&
    isValidISODate(endDate) &&
    endDate >= startDate;

  const canSubmit =
    destination.trim().length > 0 &&
    origin.trim().length > 0 &&
    datesOk &&
    Number.isFinite(budgetNum) &&
    budgetNum > 0 &&
    Number.isFinite(travelersNum) &&
    travelersNum >= 1;

  const addInterest = (raw: string) => {
    const value = raw.trim().toLowerCase();
    if (!value) return;
    setInterests((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setInterestDraft("");
  };

  const removeInterest = (key: string) => {
    setInterests((prev) => prev.filter((i) => i !== key));
  };

  const toggleSuggestion = (key: string) => {
    Haptics.selectionAsync().catch(() => {});
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const submit = () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTripPrefs({
      destination: destination.trim(),
      origin: origin.trim(),
      startDate,
      endDate,
      budget: budgetNum,
      currency: "INR",
      travelers: Math.floor(travelersNum),
      pace,
      interests,
      stayType,
      transportMode,
    });
    setSavedPlan(null);
    router.replace("/itinerary" as any);
  };

  const webDateProps =
    Platform.OS === "web"
      ? ({ type: "date" } as Record<string, string>)
      : {};

  return (
    <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
          <View style={[styles.avatar, { borderColor: accent }]}>
            <GuideAvatar
              id={guide?.id}
              gender={guide?.gender ?? "female"}
              age={guide?.ageGroup ?? "adult"}
              color={accent}
              size={40}
              background={false}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Plan your trip</Text>
            <Text style={styles.subtitle}>Dates, budget, stay & travel — all editable</Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.section}>Where</Text>
            <View style={styles.row}>
              <Field label="Destination" flex={1}>
                <TextInput
                  style={styles.input}
                  value={destination}
                  onChangeText={setDestination}
                  placeholder="City or region"
                  placeholderTextColor="#6F8FB0"
                  autoCapitalize="words"
                />
              </Field>
              <Field label="Origin" flex={1}>
                <TextInput
                  style={styles.input}
                  value={origin}
                  onChangeText={setOrigin}
                  placeholder="Departure city"
                  placeholderTextColor="#6F8FB0"
                  autoCapitalize="words"
                />
              </Field>
            </View>

            {focusCities.length > 0 ? (
              <View style={styles.quickRow}>
                <PressableScale
                  haptic={false}
                  style={[
                    styles.quickChip,
                    destination === place && { borderColor: accent, backgroundColor: accent + "22" },
                  ]}
                  onPress={() => setDestination(place)}
                >
                  <Text style={styles.quickText}>Whole {place}</Text>
                </PressableScale>
                {focusCities.slice(0, 5).map((city) => (
                  <PressableScale
                    key={city}
                    haptic={false}
                    style={[
                      styles.quickChip,
                      destination === `${city}, ${place}` && {
                        borderColor: accent,
                        backgroundColor: accent + "22",
                      },
                    ]}
                    onPress={() => setDestination(`${city}, ${place}`)}
                  >
                    <Text style={styles.quickText}>{city}</Text>
                  </PressableScale>
                ))}
              </View>
            ) : null}

            <View style={styles.quickRow}>
              {ORIGIN_CITIES.slice(0, 6).map((city) => (
                <PressableScale
                  key={city}
                  haptic={false}
                  style={[
                    styles.quickChip,
                    origin === city && { borderColor: accent, backgroundColor: accent + "22" },
                  ]}
                  onPress={() => setOrigin(city)}
                >
                  <Text style={styles.quickText}>{city}</Text>
                </PressableScale>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>When</Text>
            <View style={styles.row}>
              <Field label="Start date" flex={1} hint="YYYY-MM-DD">
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="2026-09-10"
                  placeholderTextColor="#6F8FB0"
                  {...webDateProps}
                />
              </Field>
              <Field label="End date" flex={1} hint="YYYY-MM-DD">
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="2026-09-14"
                  placeholderTextColor="#6F8FB0"
                  {...webDateProps}
                />
              </Field>
            </View>
            {!datesOk ? (
              <Text style={styles.errorHint}>End date must be on or after start date</Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Budget & party</Text>
            <View style={styles.row}>
              <Field label="Budget (₹)" flex={1.4}>
                <TextInput
                  style={styles.input}
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="40000"
                  placeholderTextColor="#6F8FB0"
                  keyboardType="numeric"
                />
              </Field>
              <Field label="Travelers" flex={0.8}>
                <TextInput
                  style={styles.input}
                  value={travelers}
                  onChangeText={setTravelers}
                  placeholder="2"
                  placeholderTextColor="#6F8FB0"
                  keyboardType="number-pad"
                />
              </Field>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Preferences</Text>

            <Text style={styles.label}>Pace</Text>
            <Segmented options={PACE_OPTIONS} value={pace} onChange={setPace} accent={accent} />

            <Text style={[styles.label, { marginTop: 12 }]}>Stay type</Text>
            <Segmented
              options={STAY_OPTIONS}
              value={stayType}
              onChange={setStayType}
              accent={accent}
              wrap
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Transport</Text>
            <Segmented
              options={TRANSPORT_OPTIONS}
              value={transportMode}
              onChange={setTransportMode}
              accent={accent}
              wrap
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Interests</Text>
            <View style={styles.interestInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={interestDraft}
                onChangeText={setInterestDraft}
                placeholder="Type an interest, then add"
                placeholderTextColor="#6F8FB0"
                onSubmitEditing={() => addInterest(interestDraft)}
                returnKeyType="done"
              />
              <PressableScale
                style={[styles.addBtn, { backgroundColor: accent }]}
                onPress={() => addInterest(interestDraft)}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </PressableScale>
            </View>

            {interests.length > 0 ? (
              <View style={styles.tagRow}>
                {interests.map((item) => (
                  <PressableScale
                    key={item}
                    haptic={false}
                    style={[styles.tag, { borderColor: accent, backgroundColor: accent + "22" }]}
                    onPress={() => removeInterest(item)}
                  >
                    <Text style={styles.tagText}>{item} ×</Text>
                  </PressableScale>
                ))}
              </View>
            ) : null}

            <View style={styles.quickRow}>
              {INTEREST_SUGGESTIONS.map((item) => {
                const active = interests.includes(item);
                return (
                  <PressableScale
                    key={item}
                    haptic={false}
                    style={[
                      styles.quickChip,
                      active && { borderColor: accent, backgroundColor: accent + "22" },
                    ]}
                    onPress={() => toggleSuggestion(item)}
                  >
                    <Text style={[styles.quickText, active && { color: "#fff" }]}>{item}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <Animated.View entering={FadeIn} style={styles.actions}>
          <PressableScale haptic={false} style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Map</Text>
          </PressableScale>
          <PressableScale
            style={[styles.nextBtn, { backgroundColor: accent, opacity: canSubmit ? 1 : 0.45 }]}
            onPress={submit}
            disabled={!canSubmit}
          >
            <Text style={styles.nextText}>Plan My Trip ✨</Text>
          </PressableScale>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 14, paddingBottom: 20, gap: 10 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerText: { flex: 1 },
  title: { color: "white", fontSize: 20, fontWeight: "800" },
  subtitle: { color: "#9EC3EC", fontSize: 12, marginTop: 2 },

  card: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 12,
  },
  section: {
    color: "#7FB0E8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  row: { flexDirection: "row", gap: 10 },
  field: { marginBottom: 2 },
  label: {
    color: "#9EC3EC",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  fieldHint: { color: "#6F8FB0", fontSize: 10, marginTop: 4 },
  errorHint: { color: "#FCA5A5", fontSize: 11, marginTop: 8, fontWeight: "600" },

  input: {
    backgroundColor: "rgba(4,18,42,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 10 : 11,
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    minHeight: 42,
  },

  segmentRow: { flexDirection: "row", gap: 6 },
  segmentWrap: { flexWrap: "wrap" },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(4,18,42,0.4)",
  },
  segmentWrapItem: { flexGrow: 0, flexBasis: "auto", paddingHorizontal: 12 },
  segmentText: { color: "#C9DCF2", fontSize: 12, fontWeight: "700" },
  segmentTextActive: { color: "white" },

  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  quickText: { color: "#C9DCF2", fontSize: 11, fontWeight: "600" },

  interestInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    minHeight: 42,
    justifyContent: "center",
  },
  addBtnText: { color: "white", fontWeight: "800", fontSize: 13 },

  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagText: { color: "white", fontSize: 11, fontWeight: "700" },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  backText: { color: "#DCEEFF", fontWeight: "700", fontSize: 14 },
  nextBtn: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 26 },
  nextText: { color: "white", fontWeight: "800", fontSize: 15 },
});
