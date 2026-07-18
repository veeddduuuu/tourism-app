import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";

import PressableScale from "../components/common/PressableScale";
import GuideAvatar from "../components/guide/GuideAvatar";
import { useAppStore, Gender, AgeGroup } from "../stores/appStore";
import {
  GUIDES,
  GENDERS,
  AGE_GROUPS,
  buildAvatar,
  DEFAULT_GUIDE_ID,
} from "../constants/guides";

export default function GuideSelector() {
  const setGuide = useAppStore((s: any) => s.setGuide);

  const [selectedId, setSelectedId] = useState(DEFAULT_GUIDE_ID);
  const [gender, setGender] = useState<Gender>("female");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("adult");

  const guide = useMemo(
    () => GUIDES.find((g) => g.id === selectedId) ?? GUIDES[0],
    [selectedId]
  );
  const avatar = buildAvatar(gender, ageGroup);

  const tap = () => Haptics.selectionAsync().catch(() => {});

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setGuide({
      id: guide.id,
      name: guide.name,
      role: guide.role,
      totem: guide.totem,
      color: guide.color,
      gender,
      ageGroup,
      avatar,
      greeting: guide.greeting,
      tips: guide.tips,
    });
    router.replace("/state-selector");
  };

  return (
    <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Animated.Text entering={FadeInDown} style={styles.kicker}>
            YOUR TRAVEL COMPANION
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(60)} style={styles.title}>
            Choose Your Guide
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(120)} style={styles.subtitle}>
            They'll walk with you across India.
          </Animated.Text>

          {/* Live preview */}
          <Animated.View entering={FadeIn.delay(150)} style={styles.preview}>
            <View style={[styles.avatarRing, { borderColor: guide.color }]}>
              <GuideAvatar
                id={guide.id}
                gender={gender}
                age={ageGroup}
                color={guide.color}
                size={94}
                background={false}
              />
              <View style={[styles.totemBadge, { backgroundColor: guide.color }]}>
                <Text style={styles.totemText}>{guide.totem}</Text>
              </View>
            </View>
            <Text style={styles.previewName}>{guide.name}</Text>
            <Text style={[styles.previewRole, { color: guide.color }]}>{guide.role}</Text>

            <View style={styles.speech}>
              <Text style={styles.speechText}>“{guide.greeting}”</Text>
            </View>
          </Animated.View>

          {/* Gender + Age customisation */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.customBlock}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.segment}>
              {GENDERS.map((g) => {
                const active = gender === g.key;
                return (
                  <PressableScale
                    key={g.key}
                    haptic={false}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                    onPress={() => {
                      tap();
                      setGender(g.key);
                    }}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {g.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 18 }]}>Age group</Text>
            <View style={styles.segment}>
              {AGE_GROUPS.map((a) => {
                const active = ageGroup === a.key;
                return (
                  <PressableScale
                    key={a.key}
                    haptic={false}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                    onPress={() => {
                      tap();
                      setAgeGroup(a.key);
                    }}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {a.label}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </Animated.View>

          {/* Character grid */}
          <Text style={[styles.label, styles.gridLabel]}>Pick a character</Text>
          <View style={styles.grid}>
            {GUIDES.map((g, i) => {
              const active = selectedId === g.id;
              return (
                <Animated.View key={g.id} entering={FadeInUp.delay(240 + i * 50)} style={styles.gridItem}>
                  <PressableScale
                    haptic={false}
                    style={[
                      styles.card,
                      active && { borderColor: g.color, backgroundColor: g.color + "1F" },
                    ]}
                    onPress={() => {
                      tap();
                      setSelectedId(g.id);
                    }}
                  >
                    <GuideAvatar
                      id={g.id}
                      gender={g.defaultGender}
                      age="adult"
                      color={g.color}
                      size={54}
                      background={false}
                    />
                    <Text style={styles.cardName}>{g.name}</Text>
                    <Text style={styles.cardRole}>
                      {g.totem} {g.role}
                    </Text>
                    {g.id === DEFAULT_GUIDE_ID && (
                      <View style={styles.defaultTag}>
                        <Text style={styles.defaultTagText}>DEFAULT</Text>
                      </View>
                    )}
                  </PressableScale>
                </Animated.View>
              );
            })}
          </View>

          <PressableScale style={[styles.cta, { backgroundColor: guide.color }]} onPress={handleContinue}>
            <Text style={styles.ctaText}>Continue with {guide.name} →</Text>
          </PressableScale>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  kicker: {
    color: "#7FB0E8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 10,
    textAlign: "center",
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },
  subtitle: { color: "#B9D2EE", fontSize: 15, textAlign: "center", marginTop: 6 },

  preview: { alignItems: "center", marginTop: 20 },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { fontSize: 52 },
  totemBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0A2E5C",
  },
  totemText: { fontSize: 16 },
  previewName: { color: "white", fontSize: 24, fontWeight: "800", marginTop: 14 },
  previewRole: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  speech: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "92%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  speechText: { color: "#EAF3FF", fontSize: 15, fontStyle: "italic", textAlign: "center" },

  customBlock: { marginTop: 26 },
  label: { color: "#9EC3EC", fontSize: 13, fontWeight: "700", marginBottom: 10, letterSpacing: 0.4 },
  segment: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 5,
    gap: 5,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  segmentItemActive: { backgroundColor: "#FF6B35" },
  segmentText: { color: "#C9DCF2", fontWeight: "700", fontSize: 15 },
  segmentTextActive: { color: "white" },

  gridLabel: { marginTop: 28 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "31.5%", marginBottom: 12 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.10)",
  },
  cardTotem: { fontSize: 30 },
  cardName: { color: "white", fontWeight: "800", fontSize: 14, marginTop: 8 },
  cardRole: { color: "#9EC3EC", fontSize: 11, marginTop: 2, textAlign: "center" },
  defaultTag: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  defaultTagText: { color: "#DCEEFF", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },

  cta: {
    marginTop: 22,
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: "center",
  },
  ctaText: { color: "white", fontWeight: "800", fontSize: 17 },
});
