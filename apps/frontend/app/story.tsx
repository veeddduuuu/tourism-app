import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Audio } from "expo-av";
import { stories } from "../data/stories";

export default function StoryScreen() {
  const story = stories.Maharashtra;

  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let sound: Audio.Sound;

    async function playStory() {
      try {
        const { sound: playback } = await Audio.Sound.createAsync(
          story.audio
        );

        sound = playback;

        await playback.playAsync();
      } catch (err) {
        console.log(err);
      }
    }

    playStory();

    // Typewriter Effect
    let index = 0;

    const interval = setInterval(() => {
      if (index < story.narration.length) {
        setDisplayedText(story.narration.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => {
      clearInterval(interval);
      sound?.unloadAsync();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={story.image}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.heading}>
          🎙 AI Storytelling
        </Text>

        <Text style={styles.title}>
          {story.title}
        </Text>

        <Text style={styles.monument}>
          📍 {story.monument}
        </Text>

        <Text style={styles.story}>
          {displayedText}
          <Text style={styles.cursor}>▋</Text>
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Continue Exploring →
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#081A34",
  },

  image: {
    width: "100%",
    height: 280,
  },

  content: {
    padding: 22,
  },

  heading: {
    color: "#FFD166",
    fontSize: 16,
    fontWeight: "700",
  },

  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 10,
  },

  monument: {
    color: "#9FD3FF",
    marginTop: 10,
    fontSize: 18,
  },

  story: {
    color: "white",
    marginTop: 25,
    fontSize: 18,
    lineHeight: 34,
    letterSpacing: 0.3,
  },

  cursor: {
    color: "#FFD166",
    fontSize: 18,
  },

  button: {
    marginTop: 40,
    backgroundColor: "#00B4FF",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
  },
});