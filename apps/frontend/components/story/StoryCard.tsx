import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Headphones, Play, Volume2, Sparkles } from "lucide-react-native";

import PressableScale from "../common/PressableScale";
import COLORS from "../../constants/colors";
import THEME from "../../constants/theme";

const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80"; // Immersive Taj/Indian Heritage at Twilight

export default function StoryCard() {
  return (
    <PressableScale
      style={styles.wrapper}
      onPress={() => router.push("/story" as any)}
    >
      <ImageBackground
        source={{ uri: HERO_BG_IMAGE }}
        style={styles.heroBackground}
        imageStyle={{ borderRadius: 24 }}
      >
        <LinearGradient
          colors={[
            "rgba(11, 19, 38, 0.35)",
            "rgba(11, 19, 38, 0.75)",
            "rgba(11, 19, 38, 0.95)",
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          {/* Top Badge */}
          <View style={styles.topRow}>
            <View style={styles.aiChip}>
              <Sparkles color={COLORS.saffron} size={14} />
              <Text style={styles.aiChipText}>AI STORYTELLING</Text>
            </View>

            <View style={styles.audioPill}>
              <Volume2 color="white" size={13} />
              <Text style={styles.audioPillText}>Spatial Audio</Text>
            </View>
          </View>

          {/* Hero Titles */}
          <View style={styles.middleBlock}>
            <Text style={styles.heroTitle}>
              Tales & Legends of India
            </Text>
            <Text style={styles.heroSubtitle}>
              Experience immersive AI-narrated audio stories as you explore ancient forts, sacred temples, and royal heritage.
            </Text>
          </View>

          {/* Glassmorphic Start Listening Action */}
          <View style={styles.actionGlassCard}>
            <View style={styles.playIconCircle}>
              <Play color="#0B1326" fill="#0B1326" size={20} style={{ marginLeft: 2 }} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionPrimary}>Start Listening</Text>
              <Text style={styles.actionSecondary}>Maharashtra & Beyond · 12 mins</Text>
            </View>
            <Headphones color={COLORS.marigold} size={20} />
          </View>
        </View>
      </ImageBackground>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: THEME.radius.card,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  heroBackground: {
    minHeight: 250,
    justifyContent: "flex-end",
    borderRadius: THEME.radius.card,
  },
  content: {
    padding: 22,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 153, 51, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 153, 51, 0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiChipText: {
    color: COLORS.saffron,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  audioPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  audioPillText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "600",
  },
  middleBlock: {
    marginBottom: 20,
  },
  heroTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: "#CBD5E1",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  actionGlassCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(19, 31, 55, 0.72)",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  playIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.saffron,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionPrimary: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
  actionSecondary: {
    color: COLORS.subtitle,
    fontSize: 12,
    marginTop: 2,
  },
});
