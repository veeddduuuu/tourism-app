import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Play } from "lucide-react-native";

import PressableScale from "../common/PressableScale";

export default function StoryCard() {
  return (
    <PressableScale
      style={styles.wrapper}
      onPress={() => router.push("/story" as any)}
    >
      <LinearGradient
        colors={["#1E3A5F", "#122A4D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.textBlock}>
          <Text style={styles.title}>🎙 AI Storytelling</Text>
          <Text style={styles.subtitle}>
            Tap to hear the story of Maharashtra
          </Text>
        </View>

        <View style={styles.playButton}>
          <Play color="#122A4D" fill="#122A4D" size={22} />
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: "#1E3A5F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  textBlock: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 8,
    fontSize: 14,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
