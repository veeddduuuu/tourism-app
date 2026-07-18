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
import * as Speech from "expo-speech";

import { getStory } from "../services/endpoints";
import { useApiQuery } from "../hooks/useApiQuery";
import { useAppStore } from "../stores/appStore";

// Bundled narration audio keyed by state (used when the API has no audioUrl).
const LOCAL_AUDIO: Record<string, number> = {
  Maharashtra: require("../assets/audio/maharashtra.mp3"),
};

// Backend stories carry no image, so keep the hero slot filled.
const FALLBACK_IMAGE = {
  uri: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200",
};

export default function StoryScreen() {
  const destinationState = useAppStore((s: any) => s.destinationState) as
    | string
    | null;
  const state = destinationState ?? "Maharashtra";

  const { data: story, loading } = useApiQuery(
    (signal) => getStory(state, signal),
    [state]
  );

  const [displayedText, setDisplayedText] = useState("");

  // Typewriter effect — replays whenever new narration arrives.
  useEffect(() => {
    const narration = story?.narration;
    setDisplayedText("");
    if (!narration) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < narration.length) {
        setDisplayedText(narration.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 35);

    return () => clearInterval(interval);
  }, [story?.narration]);

  // Narration audio, in order of preference:
  //   1. the API's hosted audioUrl (best quality),
  //   2. a bundled clip for that state,
  //   3. on-device text-to-speech of the narration (works for every state).
  useEffect(() => {
    let sound: Audio.Sound | undefined;
    const narration = story?.narration;
    const clip = story?.audioUrl ? { uri: story.audioUrl } : LOCAL_AUDIO[state];

    (async () => {
      try {
        if (clip) {
          const { sound: playback } = await Audio.Sound.createAsync(clip);
          sound = playback;
          await playback.playAsync();
        } else if (narration) {
          Speech.stop();
          Speech.speak(narration, { rate: 0.92, pitch: 1.02 });
        }
      } catch (err) {
        console.log(err);
      }
    })();

    return () => {
      sound?.unloadAsync();
      Speech.stop();
    };
  }, [story?.audioUrl, story?.narration, state]);

  const title = story?.title ?? (loading ? "Summoning the story…" : `A Story of ${state}`);
  const monument = story?.monument ?? state;

  return (
    <ScrollView style={styles.container}>
      <Image source={FALLBACK_IMAGE} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.heading}>🎙 AI Storytelling</Text>

        <Text style={styles.title}>{title}</Text>

        <Text style={styles.monument}>📍 {monument}</Text>

        <Text style={styles.story}>
          {displayedText}
          <Text style={styles.cursor}>▋</Text>
        </Text>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Continue Exploring →</Text>
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
