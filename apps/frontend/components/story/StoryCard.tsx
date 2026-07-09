import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { router } from "expo-router";

export default function StoryCard() {
  const handlePress = () => {
    console.log("✅ Story Card Pressed");
    router.push("/story");
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Text style={styles.title}>🎙 AI Storytelling</Text>

      <Text style={styles.subtitle}>
        Tap to hear the story of Maharashtra
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#122A4D",
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#ddd",
    marginTop: 10,
  },
});