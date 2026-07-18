import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import PressableScale from "../components/common/PressableScale";
import GuideAvatar from "../components/guide/GuideAvatar";
import { useAppStore } from "../stores/appStore";

const PURPOSES = [
  { key: "leisure", label: "Leisure & Relaxation", emoji: "🏖️" },
  { key: "adventure", label: "Adventure & Thrill", emoji: "🧗" },
  { key: "culture", label: "Culture & Heritage", emoji: "🏛️" },
  { key: "spiritual", label: "Spiritual / Pilgrimage", emoji: "🕉️" },
  { key: "food", label: "Food & Cuisine", emoji: "🍲" },
  { key: "family", label: "Family Trip", emoji: "👨‍👩‍👧" },
  { key: "honeymoon", label: "Honeymoon", emoji: "💑" },
  { key: "business", label: "Business", emoji: "💼" },
];

const INTERESTS = [
  { key: "monuments", label: "Monuments", emoji: "🏰" },
  { key: "nature", label: "Nature & Wildlife", emoji: "🌿" },
  { key: "food", label: "Street Food", emoji: "🍢" },
  { key: "festivals", label: "Festivals", emoji: "🎉" },
  { key: "shopping", label: "Shopping & Markets", emoji: "🛍️" },
  { key: "temples", label: "Temples", emoji: "🛕" },
  { key: "beaches", label: "Beaches", emoji: "🏝️" },
  { key: "museums", label: "Museums & Art", emoji: "🖼️" },
  { key: "nightlife", label: "Nightlife", emoji: "🌃" },
  { key: "sports", label: "Adventure Sports", emoji: "🪂" },
];

const LAST_STEP = 1;

export default function TripPreferences() {
  const guide = useAppStore((s: any) => s.guide);
  const destination = useAppStore((s: any) => s.destinationState) as string | null;
  const setTripPrefs = useAppStore((s: any) => s.setTripPrefs);

  const accent = guide?.color ?? "#FF6B35";
  const place = destination ?? "this state";

  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  const question = useMemo(() => {
    if (step === 0) return `Why are you visiting ${place}?`;
    return `What do you want to explore most in ${place}?`;
  }, [step, place]);

  const canProceed = step === 0 ? !!purpose : interests.length > 0;

  const tap = () => Haptics.selectionAsync().catch(() => {});

  const toggleInterest = (key: string) => {
    tap();
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const next = () => {
    if (!canProceed) return;
    if (step < LAST_STEP) {
      setStep((s) => s + 1);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTripPrefs({ purpose: purpose!, interests });
    // Hand off to the itinerary screen, which calls the AI trip planner.
    router.replace("/itinerary" as any);
  };

  const back = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  return (
    <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        {/* Progress */}
        <View style={styles.progress}>
          {[0, 1].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i <= step ? accent : "rgba(255,255,255,0.2)",
                  width: i === step ? 26 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Guide asks the question */}
        <Animated.View key={step} entering={FadeInDown.springify().damping(16)} style={styles.askRow}>
          <View style={[styles.avatar, { borderColor: accent }]}>
            <GuideAvatar
              id={guide?.id}
              gender={guide?.gender ?? "female"}
              age={guide?.ageGroup ?? "adult"}
              color={accent}
              size={46}
              background={false}
            />
          </View>
          <View style={[styles.bubble, { borderColor: accent + "66" }]}>
            <Text style={styles.question}>{question}</Text>
            {step === 1 && <Text style={styles.hint}>Pick as many as you like</Text>}
          </View>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <View style={styles.grid}>
              {PURPOSES.map((p, i) => {
                const active = purpose === p.key;
                return (
                  <Animated.View key={p.key} entering={FadeInUp.delay(i * 40)} style={styles.gridCell}>
                    <PressableScale
                      haptic={false}
                      style={[styles.optCard, active && { borderColor: accent, backgroundColor: accent + "1F" }]}
                      onPress={() => {
                        tap();
                        setPurpose(p.key);
                      }}
                    >
                      <Text style={styles.optEmoji}>{p.emoji}</Text>
                      <Text style={styles.optLabel}>{p.label}</Text>
                    </PressableScale>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {step === 1 && (
            <View style={styles.chips}>
              {INTERESTS.map((it, i) => {
                const active = interests.includes(it.key);
                return (
                  <Animated.View key={it.key} entering={FadeInUp.delay(i * 30)}>
                    <PressableScale
                      haptic={false}
                      style={[styles.chip, active && { borderColor: accent, backgroundColor: accent + "22" }]}
                      onPress={() => toggleInterest(it.key)}
                    >
                      <Text style={styles.chipEmoji}>{it.emoji}</Text>
                      <Text style={[styles.chipLabel, active && { color: "white" }]}>{it.label}</Text>
                    </PressableScale>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <Animated.View entering={FadeIn} style={styles.actions}>
          <PressableScale haptic={false} style={styles.backBtn} onPress={back}>
            <Text style={styles.backText}>{step === 0 ? "← Map" : "← Back"}</Text>
          </PressableScale>
          <PressableScale
            style={[styles.nextBtn, { backgroundColor: accent, opacity: canProceed ? 1 : 0.45 }]}
            onPress={next}
            disabled={!canProceed}
          >
            <Text style={styles.nextText}>
              {step === LAST_STEP ? "Plan My Trip ✨" : "Next →"}
            </Text>
          </PressableScale>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 20 },

  progress: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { height: 8, borderRadius: 4 },

  askRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 16, marginTop: 16, marginBottom: 12 },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    padding: 14,
  },
  question: { color: "white", fontSize: 18, fontWeight: "700", lineHeight: 24 },
  hint: { color: "#9EC3EC", fontSize: 12, marginTop: 6 },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridCell: { width: "48%", marginBottom: 12 },
  optCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.10)",
  },
  optEmoji: { fontSize: 30 },
  optLabel: { color: "white", fontSize: 13, fontWeight: "700", marginTop: 8, textAlign: "center" },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipEmoji: { fontSize: 16 },
  chipLabel: { color: "#C9DCF2", fontSize: 14, fontWeight: "600" },

  actions: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { paddingHorizontal: 22, paddingVertical: 15, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.10)" },
  backText: { color: "#DCEEFF", fontWeight: "700", fontSize: 15 },
  nextBtn: { flex: 1, alignItems: "center", paddingVertical: 15, borderRadius: 30 },
  nextText: { color: "white", fontWeight: "800", fontSize: 16 },
});
