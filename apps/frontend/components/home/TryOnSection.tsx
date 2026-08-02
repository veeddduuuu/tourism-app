import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, ArrowRight } from "lucide-react-native";

import PressableScale from "../common/PressableScale";

import COLORS from "../../constants/colors";
import THEME from "../../constants/theme";

export default function TryOnSection() {
  return (
    <PressableScale
      style={styles.wrapper}
      onPress={() => router.push("/try-on" as any)}
    >
      <LinearGradient
        colors={["#9333EA", "#6D28D9", "#3B0764"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.topRow}>
          <View style={styles.iconWrap}>
            <Sparkles color="#FDE047" size={24} />
          </View>

          <View style={styles.badgePill}>
            <Text style={styles.badge}>AI ATTIRE STUDIO ✨</Text>
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Traditional Virtual Try-On</Text>
          <Text style={styles.subtitle}>
            Step into authentic Indian heritage wear — preview yourself in royal Banarasi sarees, Sherwanis & bridal couture powered by AI.
          </Text>
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>Try Traditional Attire</Text>
          <ArrowRight color="#3B0764" size={18} />
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  card: {
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgePill: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badge: {
    color: "#FDE047",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  textBlock: { marginTop: 16 },
  title: { color: "white", fontSize: 24, fontWeight: "800" },
  subtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 20,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaText: { color: "#3B0764", fontWeight: "800", fontSize: 14 },
});
